import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ref = request.nextUrl.searchParams.get('ref') || '';
  const admin = createAdminClient();

  const { data: order } = await admin
    .from('orders')
    .select('id, order_number, total_amount, payment_status, payment_intent_id, tracking_number, customer_name, order_items(product_name, quantity, total_price, products(is_digital, digital_file_url, digital_file_name)), merchants(store_name)')
    .eq('id', id)
    .maybeSingle();

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  if (order.payment_status !== 'paid') return NextResponse.json({ error: 'Order not paid' }, { status: 403 });
  if (ref && order.payment_intent_id && ref !== order.payment_intent_id) {
    return NextResponse.json({ error: 'Invalid reference' }, { status: 403 });
  }

  const digitalFiles = (order.order_items || [])
    .filter((i: any) => i.products?.is_digital && i.products?.digital_file_url)
    .map((i: any) => ({ name: i.products.digital_file_name || i.product_name, url: i.products.digital_file_url }));

  // Fix: merchants might be an array from the join
  const merchantData = Array.isArray(order.merchants) ? order.merchants[0] : order.merchants;

  return NextResponse.json({
    order_number: order.order_number,
    store_name: merchantData?.store_name || '',
    customer_name: order.customer_name,
    total_amount: order.total_amount,
    tracking_number: order.tracking_number,
    items: (order.order_items || []).map((i: any) => ({
      name: i.product_name,
      quantity: i.quantity,
      total: i.total_price,
    })),
    digital_files: digitalFiles,
  });
}