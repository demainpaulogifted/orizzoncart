
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { sendOrderAlert } from '@/lib/notify';
import { attributeStoreActivation } from '@/lib/invite';

const DAYS: Record<string, number> = {
  monthly: 30,
  quarterly: 90,
  yearly: 365,
};

function minorUnits(amount: number, currency: string) {
  const zeroDecimal = ['JPY', 'KRW', 'XAF', 'XOF', 'CLP', 'VND'];
  return Math.round(
    amount * (zeroDecimal.includes(currency) ? 1 : 100)
  );
}

function validSignature(body: string, signature: string | null, secret: string) {
  if (!signature) return false;

  const expected = crypto
    .createHmac('sha512', secret)
    .update(body)
    .digest('hex');

  const expectedBuffer = Buffer.from(expected, 'hex');
  const receivedBuffer = Buffer.from(signature, 'hex');

  return (
    expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

export async function GET(request: NextRequest) {
  const reference =
    request.nextUrl.searchParams.get('reference') ||
    request.nextUrl.searchParams.get('trxref');

  const url = new URL('/payment/verify', request.url);

  if (reference) {
    url.searchParams.set('reference', reference);
  }

  return NextResponse.redirect(url);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature');
    const admin = createAdminClient();

    const { data: keys } = await admin
      .from('platform_payment_keys')
      .select('secret_key')
      .eq('gateway', 'paystack')
      .maybeSingle();

    const platformSecret =
      keys?.secret_key ||
      process.env.PLATFORM_PAYSTACK_SECRET_KEY;

    const orizzonSecret = process.env.ORIZZONCART_PAY_SECRET_KEY;

    const candidates = [
      platformSecret,
      orizzonSecret,
    ].filter(Boolean) as string[];

    let verified = candidates.some((secret) =>
      validSignature(body, signature, secret)
    );

    let event: any;

    try {
      event = JSON.parse(body);
    } catch {
      return NextResponse.json(
        { error: 'Invalid webhook payload' },
        { status: 400 }
      );
    }

    if (event.event !== 'charge.success') {
      return NextResponse.json(
        { message: 'Ignored' },
        { status: 200 }
      );
    }

    const { reference, amount, currency } = event.data || {};

    if (!reference || !Number.isFinite(Number(amount))) {
      return NextResponse.json(
        { error: 'Invalid payment details' },
        { status: 400 }
      );
    }

    // Verify merchant-owned Paystack webhook signatures for customer orders.
    if (!verified) {
      const { data: order } = await admin
        .from('orders')
        .select('merchant_id')
        .eq('payment_intent_id', reference)
        .maybeSingle();

      if (order) {
        const { data: merchant } = await admin
          .from('merchants')
          .select('paystack_secret_key')
          .eq('id', order.merchant_id)
          .maybeSingle();

        if (
          merchant?.paystack_secret_key &&
          validSignature(
            body,
            signature,
            merchant.paystack_secret_key
          )
        ) {
          verified = true;
        }
      }
    }

    if (!verified) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // 1. PLATFORM TRANSACTIONS
    const { data: tx, error: txError } = await admin
      .from('platform_transactions')
      .select('*')
      .eq('payment_reference', reference)
      .maybeSingle();

    if (txError) throw txError;

    if (tx) {
      if (tx.status === 'paid') {
        return NextResponse.json(
          { message: 'Already processed' },
          { status: 200 }
        );
      }

      const expectedCurrency = String(
        tx.currency || 'NGN'
      ).toUpperCase();

      const receivedCurrency = String(
        currency || ''
      ).toUpperCase();

      const expectedAmount = minorUnits(
        Number(tx.amount),
        expectedCurrency
      );

      const receivedAmount = Number(amount);

      if (
        !Number.isFinite(expectedAmount) ||
        receivedAmount !== expectedAmount ||
        receivedCurrency !== expectedCurrency
      ) {
        console.error('Platform payment webhook mismatch:', {
          reference,
          expectedAmount,
          receivedAmount,
          expectedCurrency,
          receivedCurrency,
        });

        await admin
          .from('platform_transactions')
          .update({ status: 'failed' })
          .eq('id', tx.id)
          .eq('status', 'pending');

        return NextResponse.json(
          { error: 'Payment amount or currency mismatch' },
          { status: 400 }
        );
      }

      const { error: updateError } = await admin
        .from('platform_transactions')
        .update({ status: 'paid' })
        .eq('id', tx.id)
        .eq('status', 'pending');

      if (updateError) throw updateError;

      if (tx.transaction_type === 'payment_activation') {
        try {
          await attributeStoreActivation(tx.merchant_id);
        } catch (error) {
          console.error('Invite activation attribution failed:', error);
        }

        const { data: merchant, error: merchantError } = await admin
          .from('merchants')
          .select(
            'paystack_secret_key, flutterwave_secret_key, bank_name, account_number'
          )
          .eq('id', tx.merchant_id)
          .single();

        if (merchantError) throw merchantError;

        const hasPaymentMethod = Boolean(
          merchant?.paystack_secret_key ||
          merchant?.flutterwave_secret_key ||
          (merchant?.bank_name && merchant?.account_number)
        );

        const now = new Date().toISOString();

        const { error } = await admin
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

        if (error) throw error;
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

      return NextResponse.json(
        { message: 'Processed' },
        { status: 200 }
      );
    }

    // 2. CUSTOMER ORDERS
    const { data: order, error: orderError } = await admin
      .from('orders')
      .select('*')
      .eq('payment_intent_id', reference)
      .maybeSingle();

    if (orderError) throw orderError;

    if (!order) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    if (order.payment_status === 'paid') {
      return NextResponse.json(
        { message: 'Already processed' },
        { status: 200 }
      );
    }

    const expectedCurrency = String(
      order.currency || 'NGN'
    ).toUpperCase();

    const receivedCurrency = String(
      currency || ''
    ).toUpperCase();

    const expectedAmount = minorUnits(
      Number(order.total_amount),
      expectedCurrency
    );

    if (
      Number(amount) !== expectedAmount ||
      receivedCurrency !== expectedCurrency ||
      reference !== order.payment_intent_id
    ) {
      console.error('Customer order payment validation failed:', {
        orderId: order.id,
        expectedAmount,
        receivedAmount: amount,
        expectedCurrency,
        receivedCurrency,
      });

      return NextResponse.json(
        { error: 'Payment amount or currency mismatch' },
        { status: 400 }
      );
    }

    const { error: orderUpdateError } = await admin
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'processing',
        payment_method: 'paystack',
      })
      .eq('id', order.id)
      .neq('payment_status', 'paid');

    if (orderUpdateError) throw orderUpdateError;

    // DROPSHIPPING AUTO-FULFILLMENT
    const { data: dropshipOrder } = await admin
      .from('orders')
      .select('has_dropship_products, auto_fulfill_enabled')
      .eq('id', order.id)
      .single();

    if (
      dropshipOrder?.has_dropship_products &&
      dropshipOrder?.auto_fulfill_enabled !== false
    ) {
      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        'https://orizzoncart.com.ng';

      fetch(`${appUrl}/api/dropshipping/fulfill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      }).catch((error) =>
        console.error('Auto-fulfillment failed:', error)
      );
    }

    const { data: items } = await admin
      .from('order_items')
      .select('product_name, quantity')
      .eq('order_id', order.id);

    const itemList = (items || [])
      .map((item: any) => `${item.product_name} x${item.quantity}`)
      .join(', ');

    sendOrderAlert(order.merchant_id, order, itemList).catch(() => {});

    return NextResponse.json(
      { message: 'Processed' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Webhook error:', error);

    return NextResponse.json(
      { error: 'Webhook failed' },
      { status: 500 }
    );
  }
}
