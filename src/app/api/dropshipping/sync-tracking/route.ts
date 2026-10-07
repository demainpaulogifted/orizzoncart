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

async function getCJTracking(apiKey: string, apiSecret: string, supplierOrderId: string) {
  const params: Record<string, string> = {
    method: 'cjdropshipping.order.query',
    app_key: apiKey,
    timestamp: Math.floor(Date.now() / 1000).toString(),
    orderId: supplierOrderId,
  };

  params.sign = signCJRequest(params, apiSecret);

  const res = await fetch('https://api.cjdropshipping.com/api/router.do', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params),
  });

  const data = await res.json();

  if (!res.ok || data.code !== 200) {
    throw new Error(data.message || 'Failed to fetch tracking');
  }

  return {
    tracking_number: data.data?.trackingNumber || null,
    tracking_url: data.data?.trackingUrl || null,
    status: data.data?.status || 'processing',
    shipped_at: data.data?.shippedTime || null,
  };
}

export async function POST(request: Request) {
  const body = await request.json();
  const { orderId } = body;

  if (!orderId) {
    return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: order } = await admin
    .from('orders')
    .select('*, merchants(*), dropshipping_connections!inner(*)')
    .eq('id', orderId)
    .single();

  if (!order || !order.supplier_order_id) {
    return NextResponse.json({ error: 'No supplier order ID' }, { status: 400 });
  }

  const { data: connection } = await admin
    .from('dropshipping_connections')
    .select('*')
    .eq('merchant_id', order.merchant_id)
    .eq('supplier', 'cj')
    .maybeSingle();

  if (!connection) {
    return NextResponse.json({ error: 'Supplier connection not found' }, { status: 400 });
  }

  try {
    const tracking = await getCJTracking(
      connection.api_key,
      connection.api_secret || '',
      order.supplier_order_id
    );

    // Update order with tracking info
    const updateData: any = {
      supplier_tracking_number: tracking.tracking_number,
      supplier_tracking_url: tracking.tracking_url,
    };

    if (tracking.tracking_number) {
      updateData.supplier_fulfillment_status = 'shipped';
      updateData.supplier_shipped_at = tracking.shipped_at || new Date().toISOString();
      updateData.tracking_number = tracking.tracking_number; // Also update main tracking field
    }

    if (tracking.status === 'delivered') {
      updateData.supplier_fulfillment_status = 'delivered';
      updateData.supplier_delivered_at = new Date().toISOString();
    }

    await admin.from('orders').update(updateData).eq('id', orderId);

    return NextResponse.json({ success: true, tracking });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}