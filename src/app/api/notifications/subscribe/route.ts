import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const admin = createAdminClient();
  const { data: merchant } = await admin.from('merchants').select('id').eq('user_id', user.id).single();
  if (!merchant) return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });

  const { error } = await admin.from('push_subscriptions').upsert(
    { merchant_id: merchant.id, endpoint: body.endpoint, p256dh: body.keys.p256dh, auth: body.keys.auth },
    { onConflict: 'endpoint' }
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}