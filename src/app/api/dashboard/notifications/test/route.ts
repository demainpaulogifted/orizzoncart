import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

  const admin = createAdminClient();
  const { data: merchant } = await admin
    .from('merchants').select('*').eq('user_id', user.id).maybeSingle();
  
  if (!merchant?.whatsapp_number) {
    return NextResponse.json({ error: 'No WhatsApp number configured' }, { status: 400 });
  }

  const instance = process.env.ULTRAMSG_INSTANCE;
  const token = process.env.ULTRAMSG_TOKEN;
  
  if (!instance || !token) {
    return NextResponse.json({ error: 'UltraMsg not configured' }, { status: 500 });
  }

  const to = merchant.whatsapp_number.replace(/[^0-9]/g, '');
  const text = `✅ Test notification from ${merchant.store_name}\n\nOrder alerts will appear here when customers place orders.`;

  try {
    await fetch(`https://api.ultramsg.com/${instance}/messages/chat?token=${token}&to=${to}&body=${encodeURIComponent(text)}`);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}