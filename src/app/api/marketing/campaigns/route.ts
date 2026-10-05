import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

async function getMerchantId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data: merchant } = await admin
    .from('merchants')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  return merchant?.id || null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { platform, name, dailyBudget, productIds } = body;

    if (!platform || !dailyBudget || !productIds || productIds.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const merchantId = await getMerchantId();
    if (!merchantId) return NextResponse.json({ error: 'No store found' }, { status: 404 });

    const admin = createAdminClient();
    const { data, error } = await admin
      .from('ad_campaigns')
      .insert({
        merchant_id: merchantId,
        platform,
        name: name || `${platform.toUpperCase()} Campaign`,
        daily_budget: dailyBudget,
        product_ids: productIds,
        status: 'ready',
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, campaign: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET() {
  const merchantId = await getMerchantId();
  if (!merchantId) return NextResponse.json({ error: 'No store found' }, { status: 404 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('ad_campaigns')
    .select('*')
    .eq('merchant_id', merchantId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ campaigns: data || [] });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { campaignId, status } = body;

  if (!campaignId || !['ready', 'active', 'paused'].includes(status)) {
    return NextResponse.json({ error: 'Invalid update' }, { status: 400 });
  }

  const merchantId = await getMerchantId();
  if (!merchantId) return NextResponse.json({ error: 'No store found' }, { status: 404 });

  const admin = createAdminClient();
  const { error } = await admin
    .from('ad_campaigns')
    .update({ status })
    .eq('id', campaignId)
    .eq('merchant_id', merchantId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}