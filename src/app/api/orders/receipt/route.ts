import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('order');
  if (!id) return NextResponse.json({ error: 'Missing order' }, { status: 400 });

  const admin = createAdminClient();
  let { data: order } = await admin
    .from('orders')
    .select('*, order_items(*), merchants(store_name, store_slug, preferred_gateway, paystack_secret_key, flutterwave_secret_key)')
    .eq('id', id)
    .maybeSingle();

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  // Self-verify with Paystack if not yet marked paid
  if (order.payment_status !== 'paid' && order.payment_intent_id) {
    const secret = order.merchants?.preferred_gateway === 'paystack' ? order.merchants?.paystack_secret_key : order.merchants?.flutterwave_secret_key;
    if (secret) {
      try {
        const res = await fetch(`https://api.paystack.co/transaction/verify/${order.payment_intent_id}`, {
          headers: { Authorization: `Bearer ${secret}` },
        });
        const ps = await res.json();
        if (ps.status && ps.data?.status === 'success') {
          await admin.from('orders').update({ payment_status: 'paid', status: 'processing', payment_method: order.merchants.preferred_gateway }).eq('id', order.id);
          order = { ...order, payment_status: 'paid', status: 'processing' };
        }
      } catch {}
    }
  }

  const { merchants, ...safe } = order as any;
  return NextResponse.json({
    order: { ...safe, store_name: merchants?.store_name, store_slug: merchants?.store_slug },
  });
}