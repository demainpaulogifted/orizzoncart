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
          status: 'processing', // Move to processing so merchant can fulfill
          payment_method: 'paystack',
          payment_intent_id: event.data.reference,
        }).eq('id', metadata.order_id);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Merchant webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}

// CRITICAL: This tells Next.js not to parse the body, so we can read the raw text for security
export const config = {
  api: {
    bodyParser: false,
  },
};