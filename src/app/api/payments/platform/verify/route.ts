import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

const DAYS: Record<string, number> = { monthly: 30, quarterly: 90, yearly: 365 };

export async function GET(request: NextRequest) {
  try {
    const reference = request.nextUrl.searchParams.get('reference');
    if (!reference) return NextResponse.json({ error: 'Missing reference' }, { status: 400 });

    const admin = createAdminClient();
    const { data: tx } = await admin.from('platform_transactions').select('*').eq('payment_reference', reference).single();
    if (!tx) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });

    if (tx.status !== 'paid') {
      const { data: keys } = await admin.from('platform_payment_keys').select('secret_key').eq('gateway', 'paystack').maybeSingle();
      const secret = keys?.secret_key || process.env.PLATFORM_PAYSTACK_SECRET_KEY;
      if (secret) {
        const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
          headers: { Authorization: `Bearer ${secret}` },
        });
        const ps = await res.json();

        if (ps.status && ps.data?.status === 'success') {
          await admin.from('platform_transactions').update({ status: 'paid' }).eq('id', tx.id);
          tx.status = 'paid';

          if (tx.transaction_type === 'payment_activation') {
            const { data: m } = await admin.from('merchants').select('paystack_secret_key, flutterwave_secret_key').eq('id', tx.merchant_id).single();
            const hasKeys = !!(m?.paystack_secret_key || m?.flutterwave_secret_key);
            const now = new Date().toISOString();
            await admin.from('merchants').update(
              hasKeys
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
        }
      }
    }

    return NextResponse.json({ transaction: tx });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Verification failed' }, { status: 500 });
  }
}