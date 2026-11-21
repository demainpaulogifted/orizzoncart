import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('order');
  if (!id) {
    return NextResponse.json({ error: 'Missing order' }, { status: 400 });
  }

  const admin = createAdminClient();

  let { data: order, error } = await admin
    .from('orders')
    .select('*, order_items(*), merchants(store_name, store_slug, preferred_gateway, payout_method, paystack_secret_key, flutterwave_secret_key, bank_name, account_number)')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Order receipt lookup failed:', error);
    return NextResponse.json({ error: 'Could not retrieve order.' }, { status: 500 });
  }

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const merchant = Array.isArray(order.merchants)
    ? order.merchants[0]
    : order.merchants;

  if (order.payment_status !== 'paid' && order.payment_intent_id && merchant) {
    const hasOwn = !!(merchant.paystack_secret_key || merchant.flutterwave_secret_key);
    const hasBank = !!(merchant.bank_name && merchant.account_number);
    const platformSecret =
      process.env.ORIZZONCART_PAY_SECRET_KEY ||
      process.env.PLATFORM_PAYSTACK_SECRET_KEY;

    const method =
      merchant.payout_method ||
      (hasOwn ? 'own_keys' : hasBank ? 'orizzonpay' : null);

    let secret: string | null = null;

    if (method === 'own_keys' && hasOwn) {
      // This checkout currently initializes Paystack only.
      if (
        merchant.preferred_gateway !== 'flutterwave' ||
        !merchant.flutterwave_secret_key
      ) {
        secret = merchant.paystack_secret_key || null;
      }
    } else if (hasBank && platformSecret) {
      // Retain the existing Nigerian OrizzonPay/Paystack split arrangement.
      secret = platformSecret;
    } else if (hasOwn) {
      secret = merchant.paystack_secret_key || null;
    }

    if (secret) {
      try {
        const response = await fetch(
          `https://api.paystack.co/transaction/verify/${encodeURIComponent(order.payment_intent_id)}`,
          {
            headers: { Authorization: `Bearer ${secret}` },
            cache: 'no-store',
          }
        );

        const result = await response.json();
        const transaction = result?.data;
        const expectedAmount = Math.round(Number(order.total_amount) * 100);
        const expectedCurrency = String(order.currency || 'NGN').toUpperCase();

        const valid =
          response.ok &&
          result?.status === true &&
          transaction?.status === 'success' &&
          transaction?.reference === order.payment_intent_id &&
          Number(transaction?.amount) === expectedAmount &&
          String(transaction?.currency || '').toUpperCase() === expectedCurrency;

        if (valid) {
          const { error: updateError } = await admin
            .from('orders')
            .update({
              payment_status: 'paid',
              status: 'processing',
              payment_method: 'paystack',
            })
            .eq('id', order.id)
            .neq('payment_status', 'paid');

          if (updateError) {
            console.error('Could not update verified order:', updateError);
          } else {
            order = { ...order, payment_status: 'paid', status: 'processing' };

            const { data: dsOrder } = await admin
              .from('orders')
              .select('has_dropship_products, auto_fulfill_enabled')
              .eq('id', order.id)
              .single();

            if (dsOrder?.has_dropship_products && dsOrder?.auto_fulfill_enabled !== false) {
              const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://orizzoncart.com.ng';
              fetch(`${appUrl}/api/dropshipping/fulfill`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: order.id }),
              }).catch((err) => console.error('Auto-fulfillment failed:', err));
            }
          }
        }
      } catch (error) {
        console.error('Paystack order verification failed:', error);
      }
    }
  }

  const { merchants, ...safe } = order as any;

  return NextResponse.json({
    order: {
      ...safe,
      store_name: merchant?.store_name,
      store_slug: merchant?.store_slug,
    },
  });
}
