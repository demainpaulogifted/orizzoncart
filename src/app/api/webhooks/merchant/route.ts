import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    const event = JSON.parse(body);

    if (event.event !== 'charge.success' || event.data?.metadata?.type !== 'customer_order') {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const orderId = event.data.metadata.order_id;
    const reference = event.data.reference;

    if (!orderId || !reference) {
      return NextResponse.json({ error: 'Invalid payment event' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, merchant_id, total_amount, currency, payment_intent_id, payment_status')
      .eq('id', orderId)
      .maybeSingle();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.payment_status === 'paid') {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    if (order.payment_intent_id !== reference) {
      return NextResponse.json({ error: 'Payment reference mismatch' }, { status: 400 });
    }

    const { data: merchant, error: merchantError } = await supabase
      .from('merchants')
      .select('paystack_secret_key')
      .eq('id', order.merchant_id)
      .maybeSingle();

    const secret = merchant?.paystack_secret_key;

    if (merchantError || !secret) {
      return NextResponse.json({ error: 'Merchant payment key unavailable' }, { status: 401 });
    }

    const expected = createHmac('sha512', secret).update(body).digest('hex');
    const receivedBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expected, 'hex');

    if (
      receivedBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(receivedBuffer, expectedBuffer)
    ) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    const paidAmount = Number(event.data.amount);
    const expectedAmount = Math.round(Number(order.total_amount) * 100);
    const paidCurrency = String(event.data.currency || '').toUpperCase();
    const expectedCurrency = String(order.currency || '').toUpperCase();

    if (
      !Number.isFinite(paidAmount) ||
      paidAmount !== expectedAmount ||
      !expectedCurrency ||
      paidCurrency !== expectedCurrency
    ) {
      return NextResponse.json({ error: 'Payment amount or currency mismatch' }, { status: 400 });
    }

    const { data: updated, error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'processing',
        payment_method: 'paystack',
      })
      .eq('id', order.id)
      .neq('payment_status', 'paid')
      .select('id')
      .maybeSingle();

    if (updateError) {
      throw updateError;
    }

    if (updated) {
      const { data: dsOrder } = await supabase
        .from('orders')
        .select('id, has_dropship_products, auto_fulfill_enabled')
        .eq('id', order.id)
        .maybeSingle();

      if (dsOrder?.has_dropship_products && dsOrder.auto_fulfill_enabled !== false) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://orizzoncart.com.ng';
        fetch(`${appUrl}/api/dropshipping/fulfill`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: dsOrder.id }),
        }).catch((err) => console.error('Auto-fulfillment failed:', err));
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Merchant webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
