import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

const DAYS: Record<string, number> = { monthly: 30, quarterly: 90, yearly: 365 };

// SAFETY NET: if a human browser ever lands here (misconfigured callback),
// bounce them to the beautiful receipt/verify page instead of showing an error
export async function GET(request: NextRequest) {
  const reference =
    request.nextUrl.searchParams.get('reference') ||
    request.nextUrl.searchParams.get('trxref');
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

    const hash = crypto.createHmac('sha512', secret).update(body).update(body).digest('hex');
    if (hash !== signature) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });

    const event = JSON.parse(body);
    if (event.event !== 'charge.success') return NextResponse.json({ message: 'Ignored' }, { status: 200 });

    const { reference, amount } = event.data;
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
      const { data: m } = await admin
        .from('merchants')
        .select('paystack_secret_key, flutterwave_secret_key, bank_name, account_number')
        .eq('id', tx.merchant_id)
        .single();
      const hasKeys = !!(m?.paystack_secret_key || m?.flutterwave_secret_key);
      const hasBank = !!(m?.bank_name && m?.account_number);
      const now = new Date().toISOString();
      await admin.from('merchants').update(
        hasKeys || hasBank
          ? { payment_receiving_status: 'ACTIVE', cart_status: 'ENABLED', checkout_status: 'ENABLED', payment_activated_at: now }
          : { payment_receiving_status: 'PENDING_KEYS', cart_status: 'LOCKED', checkout_status: 'DISABLED', payment_activated_at: now }
      ).eq('id', tx.merchant_id);
    }

    if (tx.transaction_type === 'theme_purchase' && tx.metadata?.theme_name) {
      await admin.from('merchants').update({ theme_id: tx.metadata.theme_name }).eq('id', tx.merchant_id);
    }

    if (tx.transaction_type === 'maintenance_payment' && tx.metadata?.frequency) {
      const days = DAYS[tx.metadata.frequency] || 30;
      await admin.from('merchants').update({
        maintenance_plan: tx.metadata.frequency,
        maintenance_status: 'active',
        maintenance_expires_at: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString(),
        payment_receiving_status: 'ACTIVE',
        cart_status: 'ENABLED',
        checkout_status: 'ENABLED',
      }).eq('id', tx.merchant_id);
    }

    return NextResponse.json({ message: 'Processed' }, { status: 200 });
  } catch (e) {
    console.error('Webhook error:', e);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}