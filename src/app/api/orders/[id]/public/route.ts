
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ref = request.nextUrl.searchParams.get('ref') || '';
  const admin = createAdminClient();

  const { data: order, error } = await admin
    .from('orders')
    .select(
      'id, order_number, total_amount, payment_status, payment_intent_id, tracking_number, customer_name, order_items(product_id, product_name, quantity, total_price, products(is_digital, digital_file_url, digital_file_name)), merchants(store_name, store_slug)'
    )
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Could not fetch public order:', error);
    return NextResponse.json(
      { error: 'Could not retrieve order.' },
      { status: 500 }
    );
  }

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  if (order.payment_status !== 'paid') {
    return NextResponse.json({ error: 'Order not paid' }, { status: 403 });
  }

  if (
    order.payment_intent_id &&
    ref !== order.payment_intent_id
  ) {
    return NextResponse.json({ error: 'Invalid reference' }, { status: 403 });
  }

  const orderItems = (order.order_items || []) as any[];

  const digitalFiles = orderItems
    .filter(
      (item) =>
        item.products?.is_digital && item.products?.digital_file_url
    )
    .map((item) => ({
      name: item.products.digital_file_name || item.product_name,
      url: item.products.digital_file_url,
    }));

  const merchantData = Array.isArray(order.merchants)
    ? order.merchants[0]
    : order.merchants;

  return NextResponse.json({
    order_number: order.order_number,
    store_name: merchantData?.store_name || '',
    store_slug: merchantData?.store_slug || '',
    customer_name: order.customer_name,
    total_amount: order.total_amount,
    tracking_number: order.tracking_number,
    items: orderItems.map((item) => ({
      product_id: item.product_id,
      name: item.product_name,
      quantity: item.quantity,
      total: item.total_price,
    })),
    digital_files: digitalFiles,
  });
}
