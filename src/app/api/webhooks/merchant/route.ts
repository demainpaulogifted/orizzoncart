import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const event = JSON.parse(body);
    const supabase = createAdminClient();

    if (event.event === 'charge.success') {
      const { metadata } = event.data;

      // Check if this is a customer order payment
      if (metadata?.type === 'customer_order') {
        // Update the order status to paid
        await supabase.from('orders').update({
          payment_status: 'paid',
          status: 'processing',
          payment_method: 'paystack',
          payment_intent_id: event.data.reference,
        }).eq('id', metadata.order_id);

        // 📦 DROPSHIPPING AUTO-FULFILLMENT
        const { data: dsOrder } = await supabase
          .from('orders')
          .select('id, has_dropship_products, auto_fulfill_enabled')
          .eq('id', metadata.order_id)
          .maybeSingle();

        if (dsOrder?.has_dropship_products && dsOrder?.auto_fulfill_enabled !== false) {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://orizzoncart.name.ng';
          fetch(`${appUrl}/api/dropshipping/fulfill`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: dsOrder.id }),
          }).catch((err) => console.error('Auto-fulfillment failed:', err));
        }
        // -------------------------------
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Merchant webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}