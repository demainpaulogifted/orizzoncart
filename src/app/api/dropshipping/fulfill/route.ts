import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

function signCJRequest(params: Record<string, string>, secret: string): string {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  return crypto.createHash('md5').update(sorted + secret).digest('hex');
}

async function placeCJOrder(
  apiKey: string,
  apiSecret: string,
  order: any,
  dropshipItems: any[]
) {
  // Build order items for CJ
  const items = dropshipItems.map((item) => ({
    productId: item.supplier_product_id,
    quantity: item.quantity,
    variantId: item.variant_id || '', // If you store variants
  }));

  const params: Record<string, string> = {
    method: 'cjdropshipping.order.create',
    app_key: apiKey,
    timestamp: Math.floor(Date.now() / 1000).toString(),
    // Customer shipping details
    receiver_name: order.customer_name,
    receiver_phone: order.customer_phone,
    receiver_email: order.customer_email,
    receiver_country: order.shipping_country || 'Nigeria',
    receiver_state: order.shipping_state,
    receiver_city: order.shipping_city,
    receiver_address: order.shipping_address,
    receiver_zip: order.shipping_postal_code || '',
    // Order metadata
    order_number: order.order_number,
    items: JSON.stringify(items),
  };

  params.sign = signCJRequest(params, apiSecret);

  const res = await fetch('https://api.cjdropshipping.com/api/router.do', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params),
  });

  const data = await res.json();

  if (!res.ok || data.code !== 200) {
    throw new Error(data.message || 'CJ order placement failed');
  }

  return {
    supplier_order_id: data.data?.orderId,
    status: 'forwarded_to_supplier',
  };
}

export async function POST(request: Request) {
  const body = await request.json();
  const { orderId } = body;

  if (!orderId) {
    return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
  }

  const admin = createAdminClient();

  // Fetch order with merchant and items
  const { data: order } = await admin
    .from('orders')
    .select('*, merchants(*), order_items(*)')
    .eq('id', orderId)
    .single();

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  // Get dropship items details
  const dropshipItems = [];
  for (const item of order.order_items || []) {
    const { data: product } = await admin
      .from('products')
      .select('supplier, supplier_product_id')
      .eq('id', item.product_id)
      .maybeSingle();

    if (product?.supplier && product.supplier_product_id) {
      dropshipItems.push({ ...item, ...product });
    }
  }

  if (dropshipItems.length === 0) {
    return NextResponse.json({ error: 'No dropship items in order' }, { status: 400 });
  }

  // Get supplier connection
  const { data: connection } = await admin
    .from('dropshipping_connections')
    .select('*')
    .eq('merchant_id', order.merchant_id)
    .eq('supplier', dropshipItems[0].supplier)
    .eq('status', 'connected')
    .maybeSingle();

  if (!connection) {
    return NextResponse.json(
      { error: 'Supplier not connected or disconnected' },
      { status: 400 }
    );
  }

  try {
    let result;

    if (dropshipItems[0].supplier === 'cj') {
      result = await placeCJOrder(
        connection.api_key,
        connection.api_secret || '',
        order,
        dropshipItems
      );
    } else {
      return NextResponse.json(
        { error: 'Supplier fulfillment not supported yet' },
        { status: 400 }
      );
    }

    // Update order with supplier order ID
    await admin
      .from('orders')
      .update({
        supplier_fulfillment_status: result.status,
        supplier_order_id: result.supplier_order_id,
      })
      .eq('id', orderId);

    return NextResponse.json({ success: true, ...result });
  } catch (e: any) {
    // Mark as failed
    await admin
      .from('orders')
      .update({
        supplier_fulfillment_status: 'failed',
      })
      .eq('id', orderId);

    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}