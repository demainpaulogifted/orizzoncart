
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { attributeStoreActivation } from '@/lib/invite';

const DAYS: Record<string, number> = {
  monthly: 30,
  quarterly: 90,
  yearly: 365,
};

export async function GET(request: NextRequest) {
  try {
    const reference = request.nextUrl.searchParams.get('reference');

    if (!reference) {
      return NextResponse.json(
        { error: 'Missing reference' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    const { data: tx, error: txError } = await admin
      .from('platform_transactions')
      .select('*')
      .eq('payment_reference', reference)
      .maybeSingle();

    if (txError) throw txError;

    if (!tx) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    const activationGateway = String(
      tx.metadata?.activation_gateway || 'paystack'
    ).toLowerCase();

    if (tx.status !== 'paid' && activationGateway === 'paypal') {
      return NextResponse.json({
        transaction: tx,
        awaiting_confirmation: true,
        message: 'Waiting for PayPal payment confirmation.',
      });
    }

    if (tx.status !== 'paid') {
      const { data: keys, error: keysError } = await admin
        .from('platform_payment_keys')
        .select('secret_key')
        .eq('gateway', 'paystack')
        .maybeSingle();

      if (keysError) throw keysError;

      const secret =
        keys?.secret_key ||
        process.env.PLATFORM_PAYSTACK_SECRET_KEY;

      if (!secret) {
        return NextResponse.json(
          { error: 'Platform Paystack credentials are not configured.' },
          { status: 503 }
        );
      }

      const response = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
        {
          headers: {
            Authorization: `Bearer ${secret}`,
          },
          cache: 'no-store',
        }
      );

      const result = await response.json();

      if (
        !response.ok ||
        !result.status ||
        result.data?.status !== 'success'
      ) {
        return NextResponse.json(
          {
            transaction: tx,
            awaiting_confirmation: true,
            message: 'Payment has not been confirmed yet.',
          },
          { status: 200 }
        );
      }

      const expectedCurrency = String(
        tx.currency || 'NGN'
      ).toUpperCase();

      const receivedCurrency = String(
        result.data.currency || ''
      ).toUpperCase();

      const expectedAmount = Math.round(Number(tx.amount) * 100);
      const receivedAmount = Number(result.data.amount);

      if (
        result.data.reference !== reference ||
        receivedCurrency !== expectedCurrency ||
        !Number.isFinite(expectedAmount) ||
        !Number.isFinite(receivedAmount) ||
        expectedAmount !== receivedAmount
      ) {
        console.error('Platform payment verification mismatch:', {
          reference,
          expectedCurrency,
          receivedCurrency,
          expectedAmount,
          receivedAmount,
        });

        return NextResponse.json(
          { error: 'Payment details could not be verified.' },
          { status: 400 }
        );
      }

      const { error: updateError } = await admin
        .from('platform_transactions')
        .update({ status: 'paid' })
        .eq('id', tx.id)
        .neq('status', 'paid');

      if (updateError) throw updateError;

      tx.status = 'paid';
    }

    // Apply activation after payment is confirmed.
    // This also keeps bank-account merchants consistent with the webhook.
    if (tx.transaction_type === 'payment_activation') {
      try {
        await attributeStoreActivation(tx.merchant_id);
      } catch (error) {
        console.error('Invite activation attribution failed:', error);
      }

      const { data: merchant, error: merchantError } = await admin
        .from('merchants')
        .select(
          'paystack_secret_key, flutterwave_secret_key, bank_name, account_number, payment_activated_at'
        )
        .eq('id', tx.merchant_id)
        .single();

      if (merchantError) throw merchantError;

      const hasPaymentMethod = Boolean(
        merchant?.paystack_secret_key ||
        merchant?.flutterwave_secret_key ||
        (merchant?.bank_name && merchant?.account_number)
      );

      const { error: activationError } = await admin
        .from('merchants')
        .update(
          hasPaymentMethod
            ? {
                payment_receiving_status: 'ACTIVE',
                cart_status: 'ENABLED',
                checkout_status: 'ENABLED',
                payment_activated_at:
                  merchant.payment_activated_at || new Date().toISOString(),
              }
            : {
                payment_receiving_status: 'PENDING_KEYS',
                cart_status: 'LOCKED',
                checkout_status: 'DISABLED',
                payment_activated_at:
                  merchant.payment_activated_at || new Date().toISOString(),
              }
        )
        .eq('id', tx.merchant_id);

      if (activationError) throw activationError;
    }

    if (
      tx.transaction_type === 'theme_purchase' &&
      tx.metadata?.theme_name
    ) {
      const { error } = await admin
        .from('merchants')
        .update({ theme_id: tx.metadata.theme_name })
        .eq('id', tx.merchant_id);

      if (error) throw error;
    }

    if (
      tx.transaction_type === 'maintenance_payment' &&
      tx.metadata?.frequency
    ) {
      const frequency = String(tx.metadata.frequency);
      const days = DAYS[frequency] || 30;

      const { error } = await admin
        .from('merchants')
        .update({
          maintenance_plan: frequency,
          maintenance_status: 'active',
          maintenance_expires_at: new Date(
            Date.now() + days * 24 * 60 * 60 * 1000
          ).toISOString(),
          payment_receiving_status: 'ACTIVE',
          cart_status: 'ENABLED',
          checkout_status: 'ENABLED',
        })
        .eq('id', tx.merchant_id);

      if (error) throw error;
    }

    return NextResponse.json({ transaction: tx });
  } catch (error: unknown) {
    console.error('Platform payment verification failed:', error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Payment verification failed.',
      },
      { status: 500 }
    );
  }
}
