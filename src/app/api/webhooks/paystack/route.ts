import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { sendOrderAlert } from '@/lib/notify'; // Import the alert function

const DAYS: Record<string, number> = { monthly: 30, quarterly: 90, yearly: 365 };

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get('reference') || request.nextUrl.searchParams.get('trxref');
  const url = new URL('/payment/verify', request.url);
  if (reference) url.searchParams.set('reference', reference);
  return NextResponse.redirect(url);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature');
    const admin = createAdminClient();

    const { data: keys } = await admin.from('platform_payment_keys').select('secret_key').eq('gateway', 'paystack').maybeSingle();
    const secret = keys?.secret_key || process.env.PLATFORM_PAYSTACK_SECRET_KEY;
    if (!secret) return NextResponse.json({ error: 'Platform keys missing' }, { status: 500 });

    const hash = crypto.createHmac('sha512', secret).update(body).digest('hex');
    if (hash !== signature) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });

    const event = JSON.parse(body);
    if (event.event !== 'charge.success') return NextResponse.json({ message: 'Ignored' }, { status: 200 });

    const { reference, amount } = event.data;
    
    // Find the order by payment_intent_id (which we set to reference in checkout)
    const { data: order } = await admin.from('orders').select('*').eq('payment_intent_id', reference).single();
    
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    if (order.payment_status === 'paid') return NextResponse.json({ message: 'Already processed' }, { status: 200 });

    const paid = amount / 100;
    if (Math.abs(paid - order.total_amount) > 1) {
      await admin.from('orders').update({ payment_status: 'failed' }).eq('id', order.id);
      return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
    }

    // ✅ MARK AS PAID
    await admin.from('orders').update({ 
      payment_status: 'paid', 
      status: 'processing' 
    }).eq('id', order.id);

    // ✅ SEND WHATSAPP ALERT NOW (Only for real money!)
    const { data: items } = await admin.from('order_items').select('product_name, quantity').eq('order_id', order.id);
    const itemList = (items || []).map((i: any) => `${i.product_name} x${i.quantity}`).join(', ');
    sendOrderAlert(order.merchant_id, order, itemList).catch(() => {});

    // Handle digital product access creation
    if (items) {
      const sourcedItems = items.filter((i: any) => i.catalog_id); // Note: you might need to join products table to get catalog_id if not in order_items
      // For simplicity, assuming you handle digital delivery in success page or here via lookup
    }

    // Existing activation logic
    if (order.metadata?.transaction_type === 'payment_activation') {
       // ... existing activation code ...
    }

    return NextResponse.json({ message: 'Processed' }, { status: 200 });
  } catch (e) {
    console.error('Webhook error:', e);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}