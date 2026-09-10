import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { merchant_id, session_id, path, source, referrer, device, duration, type } = body;
    if (!merchant_id || !session_id) return NextResponse.json({ ok: false }, { status: 400 });

    const ua = request.headers.get('user-agent') || '';
    if (/bot|crawl|spider|lighthouse|preview/i.test(ua)) return NextResponse.json({ ok: true });

    const admin = createAdminClient();
    const { data: existing } = await admin.from('store_sessions').select('id, pages_viewed').eq('session_id', session_id).maybeSingle();

    if (existing) {
      await admin.from('store_sessions').update({
        pages_viewed: type === 'pageview' ? existing.pages_viewed + 1 : existing.pages_viewed,
        duration_sec: duration || 0,
        last_seen: new Date().toISOString(),
        path,
      }).eq('id', existing.id);
    } else if (type === 'pageview') {
      await admin.from('store_sessions').insert({
        merchant_id, session_id, path, source, referrer, device, duration_sec: duration || 0,
      });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}