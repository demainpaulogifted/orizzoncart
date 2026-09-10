import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const admin = createAdminClient();
  const { data } = await admin.from('platform_settings').select('id, vapid_public, vapid_private').limit(1).maybeSingle();

  if (data?.vapid_public && data?.vapid_private) {
    return NextResponse.json({ publicKey: data.vapid_public });
  }

  const keys = webpush.generateVAPIDKeys();
  if (data) {
    await admin.from('platform_settings').update({ vapid_public: keys.publicKey, vapid_private: keys.privateKey }).eq('id', data.id);
  } else {
    await admin.from('platform_settings').insert({ vapid_public: keys.publicKey, vapid_private: keys.privateKey });
  }
  return NextResponse.json({ publicKey: keys.publicKey });
}