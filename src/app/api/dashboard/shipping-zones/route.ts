import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

  const admin = createAdminClient();
  const { data: merchant } = await admin
    .from('merchants')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!merchant) return NextResponse.json({ error: 'No store' }, { status: 404 });

  const { data: zones } = await admin
    .from('shipping_zones')
    .select('*')
    .eq('merchant_id', merchant.id)
    .order('created_at', { ascending: true });

  return NextResponse.json({ zones: zones || [] });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { zone_name, states, flat_fee, free_shipping_threshold, is_default } = body;

  if (!zone_name || !Array.isArray(states)) {
    return NextResponse.json({ error: 'Zone name and states array required' }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

  const admin = createAdminClient();
  const { data: merchant } = await admin
    .from('merchants')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!merchant) return NextResponse.json({ error: 'No store' }, { status: 404 });

  // If this is set as default, unset any other default zones
  if (is_default) {
    await admin
      .from('shipping_zones')
      .update({ is_default: false })
      .eq('merchant_id', merchant.id);
  }

  const { data, error } = await admin
    .from('shipping_zones')
    .upsert(
      {
        merchant_id: merchant.id,
        zone_name,
        states,
        flat_fee: Number(flat_fee) || 0,
        free_shipping_threshold: free_shipping_threshold ? Number(free_shipping_threshold) : null,
        is_default: is_default || false,
      },
      { onConflict: 'merchant_id,zone_name' }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, zone: data });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const zoneId = searchParams.get('id');

  if (!zoneId) return NextResponse.json({ error: 'Zone ID required' }, { status: 400 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

  const admin = createAdminClient();
  const { data: merchant } = await admin
    .from('merchants')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!merchant) return NextResponse.json({ error: 'No store' }, { status: 404 });

  const { error } = await admin
    .from('shipping_zones')
    .delete()
    .eq('id', zoneId)
    .eq('merchant_id', merchant.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}