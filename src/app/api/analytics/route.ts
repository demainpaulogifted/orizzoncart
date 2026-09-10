import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();
  const { data: merchants } = await admin.from('merchants').select('id').eq('user_id', user.id);
  const ids = (merchants || []).map((m: any) => m.id);
  if (!ids.length) return NextResponse.json({ visitors: 0, pageviews: 0, avg_duration: 0, sources: [], orders: 0, revenue: 0, today_orders: 0, today_revenue: 0 });

  const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
  const { data: sessions } = await admin.from('store_sessions').select('source, pages_viewed, duration_sec').in('merchant_id', ids).gte('created_at', since);
  const { data: orders } = await admin.from('orders').select('total_amount, created_at').in('merchant_id', ids).eq('payment_status', 'paid');

  const s = sessions || [];
  const visitors = s.length;
  const pageviews = s.reduce((a: number, x: any) => a + (x.pages_viewed || 1), 0);
  const avg_duration = visitors ? Math.round(s.reduce((a: number, x: any) => a + (x.duration_sec || 0), 0) / visitors) : 0;
  const srcMap: Record<string, number> = {};
  s.forEach((x: any) => { srcMap[x.source || 'Direct'] = (srcMap[x.source || 'Direct'] || 0) + 1; });
  const sources = Object.entries(srcMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 6);

  const o = orders || [];
  const today = new Date().toDateString();
  const todayOrders = o.filter((x: any) => new Date(x.created_at).toDateString() === today);

  return NextResponse.json({
    visitors, pageviews, avg_duration, sources,
    orders: o.length,
    revenue: o.reduce((a: number, x: any) => a + Number(x.total_amount), 0),
    today_orders: todayOrders.length,
    today_revenue: todayOrders.reduce((a: number, x: any) => a + Number(x.total_amount), 0),
  });
}