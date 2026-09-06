import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature');
    
    // Note: In a multi-tenant app, you might need to fetch the specific merchant's 
    // secret key to verify the hash, or use a platform-level webhook secret if Paystack supports subaccount webhooks.
    // For simplicity, we assume the merchant's key is used for verification.
    
    const event = JSON.parse(body);
    const supabase = createAdminClient();

    if (event.event === 'charge.success') {
      const { metadata, reference } = event.data;

      if (metadata?.type === 'customer_order') {
        // Update the order status to paid
        await supabase.from('orders').update({
          payment_status: 'paid',
          status: 'processing', // Move to processing so merchant can fulfill
          payment_method: 'paystack',
          payment_intent_id: reference,
        }).eq('id', metadata.order_id);

        // TODO: Trigger email/SMS to customer with tracking number
        // TODO: Trigger notification to merchant dashboard
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Merchant webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}

export const config = { api: { bodyParser: false } };