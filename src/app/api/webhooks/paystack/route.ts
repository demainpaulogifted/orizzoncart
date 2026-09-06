import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    // 1. Verify Webhook Signature (CRITICAL SECURITY STEP)
    const hash = crypto
      .createHmac('sha512', process.env.PLATFORM_PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);

    // 2. Handle Successful Charge
    if (event.event === 'charge.success') {
      const { reference, amount, metadata } = event.data;
      const supabase = createAdminClient();

      // Find our transaction
      const { data: transaction, error: txError } = await supabase
        .from('platform_transactions')
        .select('*')
        .eq('payment_reference', reference)
        .single();

      if (txError || !transaction) {
        return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
      }

      // Prevent double-processing (Idempotency)
      if (transaction.status === 'paid') {
        return NextResponse.json({ message: 'Already processed' }, { status: 200 });
      }

      // 3. Verify Amount (Prevent fraud)
      const paidAmount = amount / 100; // Convert kobo to Naira
      if (Math.abs(paidAmount - transaction.amount) > 1) { // Allow 1 Naira tolerance for rounding
        await supabase.from('platform_transactions').update({ 
          status: 'failed', 
          metadata: { ...transaction.metadata, fraud_alert: 'Amount mismatch' } 
        }).eq('id', transaction.id);
        return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
      }

      // 4. Mark Transaction as Paid & Activate Merchant
      await supabase.from('platform_transactions').update({ status: 'paid' }).eq('id', transaction.id);

      if (transaction.transaction_type === 'payment_activation') {
        await supabase.from('merchants').update({
          payment_receiving_status: 'ACTIVE',
          cart_status: 'ENABLED',
          checkout_status: 'ENABLED',
          payment_activated_at: new Date().toISOString(),
        }).eq('id', transaction.merchant_id);
      }

      return NextResponse.json({ message: 'Webhook processed successfully' }, { status: 200 });
    }

    return NextResponse.json({ message: 'Event ignored' }, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}

// CRITICAL: Disable body parsing so we can read raw text for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};