
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { attributeStoreActivation } from '@/lib/invite';

export const dynamic = 'force-dynamic';

function paymentPage(request: NextRequest, reference: string, error?: string) {
  const url = new URL('/payment/verify', request.url);
  url.searchParams.set('reference', reference);
  if (error) url.searchParams.set('payment_error', error);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get('reference');
  const orderId = request.nextUrl.searchParams.get('token');

  if (!reference || !orderId) {
    return NextResponse.json(
      { error: 'Missing PayPal transaction details.' },
      { status: 400 }
    );
  }

  try {
    const admin = createAdminClient();

    const { data: tx, error: txError } = await admin
      .from('platform_transactions')
      .select('*')
      .eq('payment_reference', reference)
      .maybeSingle();

    if (txError) throw txError;

    if (!tx) {
      return NextResponse.json({ error: 'Transaction not found.' }, { status: 404 });
    }

    if (tx.status === 'paid') {
      return paymentPage(request, reference);
    }

    if (
      tx.transaction_type !== 'payment_activation' ||
      tx.metadata?.activation_gateway !== 'paypal' ||
      tx.metadata?.paypal_order_id !== orderId ||
      String(tx.currency).toUpperCase() !== 'USD'
    ) {
      return NextResponse.json(
        { error: 'PayPal transaction details do not match.' },
        { status: 400 }
      );
    }

    const clientId = process.env.PLATFORM_PAYPAL_CLIENT_ID;
    const secret = process.env.PLATFORM_PAYPAL_SECRET;
    const baseUrl =
      process.env.PLATFORM_PAYPAL_BASE_URL ||
      'https://api-m.sandbox.paypal.com';

    if (!clientId || !secret) {
      return paymentPage(request, reference, 'PayPal is not configured.');
    }

    const tokenResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
      cache: 'no-store',
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      throw new Error('Could not authenticate with PayPal.');
    }

    const captureResponse = await fetch(
      `${baseUrl}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
        cache: 'no-store',
      }
    );

    const captureData = await captureResponse.json();

    // PayPal can return the existing capture when a return is retried.
    if (!captureResponse.ok && captureData?.name !== 'UNPROCESSABLE_ENTITY') {
      console.error('PayPal capture error:', captureData);
      throw new Error('PayPal could not complete this payment.');
    }

    const purchaseUnit = captureData.purchase_units?.[0];
    const capture =
      purchaseUnit?.payments?.captures?.find(
        (item: any) => item.status === 'COMPLETED'
      ) || purchaseUnit?.payments?.captures?.[0];

    const receivedAmount = Number(capture?.amount?.value);
    const receivedCurrency = String(
      capture?.amount?.currency_code || ''
    ).toUpperCase();

    const customId = purchaseUnit?.custom_id;
    const referenceId = purchaseUnit?.reference_id;

    if (
      capture?.status !== 'COMPLETED' ||
      receivedCurrency !== String(tx.currency).toUpperCase() ||
      Math.abs(receivedAmount - Number(tx.amount)) > 0.001 ||
      customId !== tx.merchant_id ||
      referenceId !== tx.merchant_id
    ) {
      console.error('PayPal capture validation failed:', {
        captureStatus: capture?.status,
        receivedAmount,
        expectedAmount: tx.amount,
        receivedCurrency,
        expectedCurrency: tx.currency,
        customId,
        referenceId,
        merchantId: tx.merchant_id,
      });

      return paymentPage(request, reference, 'PayPal payment could not be verified.');
    }

    const { error: updateError } = await admin
      .from('platform_transactions')
      .update({ status: 'paid' })
      .eq('id', tx.id)
      .eq('status', 'pending');

    if (updateError) throw updateError;

    const { data: updatedTx, error: readError } = await admin
      .from('platform_transactions')
      .select('status')
      .eq('id', tx.id)
      .single();

    if (readError) throw readError;

    if (updatedTx.status === 'paid') {
      try {
        await attributeStoreActivation(tx.merchant_id);
      } catch (error) {
        console.error('Invite activation attribution failed:', error);
      }

      const { data: merchant, error: merchantError } = await admin
        .from('merchants')
        .select('paystack_secret_key, flutterwave_secret_key, bank_name, account_number')
        .eq('id', tx.merchant_id)
        .single();

      if (merchantError) throw merchantError;

      const hasPaymentMethod = Boolean(
        merchant?.paystack_secret_key ||
        merchant?.flutterwave_secret_key ||
        (merchant?.bank_name && merchant?.account_number)
      );

      const now = new Date().toISOString();

      const { error: activationError } = await admin
        .from('merchants')
        .update(
          hasPaymentMethod
            ? {
                payment_receiving_status: 'ACTIVE',
                cart_status: 'ENABLED',
                checkout_status: 'ENABLED',
                payment_activated_at: now,
              }
            : {
                payment_receiving_status: 'PENDING_KEYS',
                cart_status: 'LOCKED',
                checkout_status: 'DISABLED',
                payment_activated_at: now,
              }
        )
        .eq('id', tx.merchant_id);

      if (activationError) throw activationError;
    }

    return paymentPage(request, reference);
  } catch (error: any) {
    console.error('PayPal return/capture error:', error);
    return paymentPage(
      request,
      reference,
      error.message || 'PayPal payment verification failed.'
    );
  }
}
