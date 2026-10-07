import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get('orderId');

  if (!orderId) {
    return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

  const admin = createAdminClient();

  const { data: order } = await admin
    .from('orders')
    .select('merchant_id')
    .eq('id', orderId)
    .single();

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  // Verify merchant owns this order
  const { data: merchant } = await admin
    .from('merchants')
    .select('id')
    .eq('id', order.merchant_id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!merchant) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  // Fetch order items with product details
  const { data: items } = await admin
    .from('order_items')
    .select('*, products(supplier_cost, supplier_shipping_cost)')
    .eq('order_id', orderId);

  const enriched = (items || []).map((item: any) => ({
    ...item,
    supplier_cost: item.products?.supplier_cost || 0,
    supplier_shipping_cost: item.products?.supplier_shipping_cost || 0,
  }));

  return NextResponse.json({ items: enriched });
}