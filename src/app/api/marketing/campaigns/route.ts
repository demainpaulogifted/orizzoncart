import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { platform, name, dailyBudget, productIds } = body;

    if (!platform || !dailyBudget || !productIds || productIds.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

    const admin = createAdminClient();
    const { data: merchant } = await admin
      .from('merchants')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!merchant) return NextResponse.json({ error: 'No store found' }, { status: 404 });

    // Save the campaign to the database
    const { data, error } = await admin
      .from('ad_campaigns')
      .insert({
        merchant_id: merchant.id,
        platform: platform, // 'google', 'meta', or 'tiktok'
        name: name || `${platform.toUpperCase()} Campaign`,
        daily_budget: dailyBudget,
        product_ids: productIds,
        status: 'ready' // Ready to be launched by the API in the next commit
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, campaign: data });

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

  const admin = createAdminClient();
  const { data: merchant } = await admin.from('merchants').select('id').eq('user_id', user.id).maybeSingle();
  if (!merchant) return NextResponse.json({ error: 'No store found' }, { status: 404 });

  const { data: campaigns, error } = await admin
    .from('ad_campaigns')
    .select('*')
    .eq('merchant_id', merchant.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ campaigns: campaigns || [] });
}