import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || 'https://orizzoncart.name.ng';

const ALLOWED_PLATFORMS = [
  'google_merchant_center',
  'meta_commerce_catalog',
  'tiktok_catalog',
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const platform = body?.platform;
    const action = body?.action;

    if (!platform || !ALLOWED_PLATFORMS.includes(platform)) {
      return NextResponse.json({ error: 'Invalid platform' }, { status: 400 });
    }

    if (!action || !['confirm', 'disconnect'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
    }

    const admin = createAdminClient();

    const { data: merchant } = await admin
      .from('merchants')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!merchant) {
      return NextResponse.json(
        { error: 'Merchant account not found' },
        { status: 404 }
      );
    }

    if (action === 'disconnect') {
      await admin
        .from('marketing_connections')
        .delete()
        .eq('merchant_id', merchant.id)
        .eq('platform', platform);

      return NextResponse.json({ success: true, status: 'not_connected' });
    }

    const feedUrl = `${BASE_URL}/api/marketing/feed?merchant_id=${merchant.id}&platform=google`;

    const { error } = await admin
      .from('marketing_connections')
      .upsert(
        {
          merchant_id: merchant.id,
          platform,
          status: 'connected',
          feed_url: feedUrl,
          connected_at: new Date().toISOString(),
        },
        { onConflict: 'merchant_id,platform' }
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, status: 'connected' });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Server error' },
      { status: 500 }
    );
  }
}