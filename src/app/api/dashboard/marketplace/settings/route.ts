import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

  const admin = createAdminClient();
  const { data: merchant } = await admin
    .from('merchants')
    .select('is_on_marketplace, payment_mode, platform_subaccount_code')
    .eq('user_id', user.id)
    .maybeSingle();

  return NextResponse.json(merchant || {});
}

export async function POST(request: Request) {
  const body = await request.json();
  const { is_on_marketplace, platform_subaccount_code } = body;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

  const admin = createAdminClient();
  const { data: merchant } = await admin
    .from('merchants')
    .select('id, payment_mode')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!merchant) return NextResponse.json({ error: 'No store found' }, { status: 404 });

  // Validation
  if (is_on_marketplace && merchant.payment_mode === 'own_keys' && !platform_subaccount_code) {
    return NextResponse.json({ error: 'Subaccount code required for own keys' }, { status: 400 });
  }

  const { error } = await admin
    .from('merchants')
    .update({
      is_on_marketplace: is_on_marketplace,
      platform_subaccount_code: platform_subaccount_code || null
    })
    .eq('id', merchant.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}