import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const cookieStore = await cookies();
  const activeId = cookieStore.get('active_merchant_id')?.value;

  const admin = createAdminClient();
  const { data: merchants } = await admin.from('merchants').select('id').eq('user_id', user.id);
  const all = merchants || [];
  const active = all.find((m: any) => m.id === activeId) || all[0];
  const ids = active ? [active.id] : [];

  const empty = { visitors: 0, pageviews: 0, avg_duration: 0, sources: [], orders: 0, revenue: 0, today_orders: 0, today_revenue: 0 };
  if (!ids.length) return NextResponse.json(empty);

  const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
  const { data: sessions } = await admin.from('store_sessions').select('source, pages_viewed, duration_sec').in('merchant_id', ids).gte('created_at', since);
  const { data: orders } = await admin.from('orders').select('total_amount, created_at').in('merchant_id', ids).eq('payment_status', 'paid');

  const sess = sessions || [];
  const visitors = sess.length;
  const pageviews = sess.reduce((a: number, s: any) => a + (s.pages_viewed || 1), 0);
  const avg_duration = sess.length ? Math.round(sess.reduce((a: number, s: any) => a + (s.duration_sec || 0), 0) / sess.length) : 0;

  const sourceMap = new Map<string, number>();
  for (const s of sess) {
    const name = s.source || 'Direct';
    sourceMap.set(name, (sourceMap.get(name) || 0) + 1);
  }
  const sources = Array.from(sourceMap.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

  const ords = orders || [];
  const revenue = ords.reduce((a: number, o: any) => a + Number(o.total_amount || 0), 0);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const today = ords.filter((o: any) => new Date(o.created_at) >= startOfToday);
  const today_revenue = today.reduce((a: number, o: any) => a + Number(o.total_amount || 0), 0);

  return NextResponse.json({
    visitors,
    pageviews,
    avg_duration,
    sources,
    orders: ords.length,
    revenue,
    today_orders: today.length,
    today_revenue,
  });
}