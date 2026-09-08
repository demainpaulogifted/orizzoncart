import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const type = body.type === 'theme_purchase' ? 'theme_purchase' : 'payment_activation';
    const themeName = body.theme_name;

    const admin = createAdminClient();
    const { data: merchant } = await admin.from('merchants').select('*').eq('user_id', user.id).single();
    if (!merchant) return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });

    let amount = 0;
    const metadata: any = { merchant_id: merchant.id, transaction_type: type };

    if (type === 'payment_activation') {
      if (merchant.payment_receiving_status === 'ACTIVE') {
        return NextResponse.json({ error: 'Store is already activated' }, { status: 400 });
      }
      // ENFORCEMENT: merchant must connect their gateway keys before activation
      const hasKeys = merchant.paystack_secret_key || merchant.flutterwave_secret_key;
      if (!hasKeys) {
        return NextResponse.json({ error: 'Connect your Paystack or Flutterwave secret key first.' }, { status: 400 });
      }
      const { data: settings } = await admin.from('platform_settings').select('activation_fee, activation_discount_percent').single();
      const base = settings?.activation_fee ?? 5000;
      const disc = settings?.activation_discount_percent ?? 0;
      amount = base - (base * disc / 100);
    } else {
      if (!themeName) return NextResponse.json({ error: 'Theme name is required' }, { status: 400 });
      const { data: tp } = await admin.from('platform_theme_prices').select('price').eq('theme_name', themeName).single();
      if (!tp) return NextResponse.json({ error: 'Theme price not found' }, { status: 404 });
      amount = tp.price;
      metadata.theme_name = themeName;
    }

    const reference = `ORZ-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const { data: tx, error: txErr } = await admin.from('platform_transactions').insert({
      merchant_id: merchant.id,
      transaction_type: type,
      amount,
      currency: 'NGN',
      status: 'pending',
      payment_reference: reference,
      metadata,
    }).select().single();
    if (txErr) throw txErr;

    // PLATFORM Paystack keys — money goes to OrizzonCart
    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PLATFORM_PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        amount: Math.round(amount * 100),
        reference,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/payment?ref=${reference}`,
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