import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const body = await request.json();
  const { orderId } = body;

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
    .select('merchant_id, total_amount')
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

  // Get order items to calculate total supplier cost
  const { data: items } = await admin
    .from('order_items')
    .select('*, products(supplier_cost, supplier_shipping_cost)')
    .eq('order_id', orderId);

  let totalCost = 0;
  for (const item of items || []) {
    totalCost += (item.products?.supplier_cost || 0) * item.quantity;
    totalCost += (item.products?.supplier_shipping_cost || 0) * item.quantity;
  }

  const profit = order.total_amount - totalCost;

  // Mark as paid
  const { error } = await admin
    .from('orders')
    .update({
      supplier_paid: true,
      supplier_paid_at: new Date().toISOString(),
      profit_amount: profit,
    })
    .eq('id', orderId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, profit });
}