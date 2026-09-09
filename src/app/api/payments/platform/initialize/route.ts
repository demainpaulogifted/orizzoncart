import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const type = body.type === 'theme_purchase' ? 'theme_purchase' : body.type === 'maintenance_payment' ? 'maintenance_payment' : 'payment_activation';

    const admin = createAdminClient();
    const { data: keys } = await admin.from('platform_payment_keys').select('*').eq('gateway', 'paystack').maybeSingle();
    const platformSecret = keys?.secret_key || process.env.PLATFORM_PAYSTACK_SECRET_KEY;
    if (!platformSecret) return NextResponse.json({ error: 'Platform Paystack keys are not configured yet.' }, { status: 500 });

    const { data: merchant } = await admin.from('merchants').select('*').eq('user_id', user.id).single();
    if (!merchant) return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });

    let amount = 0;
    const metadata: any = { merchant_id: merchant.id, transaction_type: type };

    if (type === 'payment_activation') {
      if (merchant.payment_receiving_status === 'ACTIVE' || merchant.payment_receiving_status === 'PENDING_KEYS') {
        return NextResponse.json({ error: 'Activation fee already paid' }, { status: 400 });
      }
      const { data: s } = await admin.from('platform_settings').select('activation_fee, activation_discount_percent').limit(1).maybeSingle();
      const base = s?.activation_fee ?? 5000;
      const disc = s?.activation_discount_percent ?? 0;
      amount = base - (base * disc / 100);
    } else if (type === 'theme_purchase') {
      const { data: tp } = await admin.from('platform_theme_prices').select('price').eq('theme_name', body.theme_name).single();
      if (!tp) return NextResponse.json({ error: 'Theme price not found' }, { status: 404 });
      amount = tp.price;
      metadata.theme_name = body.theme_name;
    } else {
      const { data: plan } = await admin.from('maintenance_plans').select('*').eq('frequency', body.plan).eq('is_active', true).single();
      if (!plan) return NextResponse.json({ error: 'Plan not available' }, { status: 404 });
      amount = plan.base_price - (plan.base_price * (plan.discount_percent / 100));
      metadata.frequency = plan.frequency;
    }

    const reference = `ORZ-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const { data: tx, error: txErr } = await admin.from('platform_transactions').insert({
      merchant_id: merchant.id, transaction_type: type, amount, currency: 'NGN', status: 'pending', payment_reference: reference, metadata,
    }).select().single();
    if (txErr) throw txErr;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://orizzoncart.vercel.app';

    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: { Authorization: `Bearer ${platformSecret}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        amount: Math.round(amount * 100),
        reference,
        callback_url: `${appUrl}/payment/verify?reference=${reference}`,
        metadata: { ...metadata, transaction_id: tx.id },
      }),
    });
    const ps = await res.json();
    if (!ps.status) throw new Error(ps.message || 'Paystack initialization failed');

    return NextResponse.json({ authorization_url: ps.data.authorization_url, reference });
  } catch (e: any) {
    console.error('Platform payment init error:', e);
    return NextResponse.json({ error: e.message || 'Failed to initialize payment' }, { status: 500 });
  }
}