import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    const hash = crypto.createHmac('sha512', process.env.PLATFORM_PAYSTACK_SECRET_KEY!).update(body).digest('hex');
    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    if (event.event !== 'charge.success') {
      return NextResponse.json({ message: 'Ignored' }, { status: 200 });
    }

    const { reference, amount } = event.data;
    const admin = createAdminClient();

    const { data: tx } = await admin.from('platform_transactions').select('*').eq('payment_reference', reference).single();
    if (!tx) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    if (tx.status === 'paid') return NextResponse.json({ message: 'Already processed' }, { status: 200 });

    const paid = amount / 100;
    if (Math.abs(paid - tx.amount) > 1) {
      await admin.from('platform_transactions').update({ status: 'failed' }).eq('id', tx.id);
      return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
    }

    await admin.from('platform_transactions').update({ status: 'paid' }).eq('id', tx.id);

    if (tx.transaction_type === 'payment_activation') {
      await admin.from('merchants').update({
        payment_receiving_status: 'ACTIVE',
        cart_status: 'ENABLED',
        checkout_status: 'ENABLED',
        payment_activated_at: new Date().toISOString(),
      }).eq('id', tx.merchant_id);
    }

    if (tx.transaction_type === 'theme_purchase' && tx.metadata?.theme_name) {
      await admin.from('merchants').update({ theme_id: tx.metadata.theme_name }).eq('id', tx.merchant_id);
    }

    return NextResponse.json({ message: 'Processed' }, { status: 200 });
  } catch (e) {
    console.error('Webhook error:', e);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}