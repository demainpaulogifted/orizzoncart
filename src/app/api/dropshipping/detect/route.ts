import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const body = await request.json();
  const { orderId } = body;

  if (!orderId) {
    return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
  }

  const admin = createAdminClient();

  // Fetch the order with items
  const { data: order } = await admin
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderId)
    .single();

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  // Check if any items are dropshipped
  const dropshipItems = [];
  for (const item of order.order_items || []) {
    const { data: product } = await admin
      .from('products')
      .select('supplier, supplier_product_id, supplier_cost, supplier_shipping_cost')
      .eq('id', item.product_id)
      .maybeSingle();

    if (product?.supplier && product.supplier_product_id) {
      dropshipItems.push({
        ...item,
        supplier: product.supplier,
        supplier_product_id: product.supplier_product_id,
        supplier_cost: product.supplier_cost,
        supplier_shipping_cost: product.supplier_shipping_cost,
      });
    }
  }

  const hasDropship = dropshipItems.length > 0;

  // Update order
  await admin
    .from('orders')
    .update({
      has_dropship_products: hasDropship,
      supplier_fulfillment_status: hasDropship ? 'pending' : 'not_applicable',
    })
    .eq('id', orderId);

  return NextResponse.json({
    has_dropship_products: hasDropship,
    dropship_items: dropshipItems,
  });
}