
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const EMPTY_ANALYTICS = {
  visitors: 0,
  pageviews: 0,
  avg_duration: 0,
  sources: [],
  orders: 0,
  paid_orders: 0,
  pending_orders: 0,
  completed_orders: 0,
  cancelled_orders: 0,
  refunded_orders: 0,
  revenue: 0,
  today_orders: 0,
  today_revenue: 0,
  week_orders: 0,
  week_revenue: 0,
  month_orders: 0,
  month_revenue: 0,
  conversion_rate: 0,
};

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function startOfWeek() {
  const date = startOfToday();
  const day = date.getDay();
  date.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
  return date;
}

function startOfMonth() {
  const date = startOfToday();
  date.setDate(1);
  return date;
}

function isQualifyingSale(order: any) {
  return (
    order.payment_status === 'paid' &&
    order.status !== 'cancelled' &&
    order.status !== 'refunded' &&
    order.payment_status !== 'refunded'
  );
}

function sumRevenue(orders: any[]) {
  return orders
    .filter(isQualifyingSale)
    .reduce(
      (total, order) => total + Number(order.total_amount || 0),
      0
    );
}

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();
    const activeId = cookieStore.get('active_merchant_id')?.value;

    const admin = createAdminClient();

    const { data: merchants, error: merchantError } = await admin
      .from('merchants')
      .select('id')
      .eq('user_id', user.id);

    if (merchantError) throw merchantError;

    const merchantList = merchants || [];

    const active =
      merchantList.find((merchant: any) => merchant.id === activeId) ||
      merchantList[0];

    if (!active) {
      return NextResponse.json(EMPTY_ANALYTICS);
    }

    const since = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000
    ).toISOString();

    const [
      { data: sessions, error: sessionError },
      { data: orders, error: orderError },
    ] = await Promise.all([
      admin
        .from('store_sessions')
        .select('source, pages_viewed, duration_sec')
        .eq('merchant_id', active.id)
        .gte('created_at', since),

      admin
        .from('orders')
        .select('total_amount, created_at, status, payment_status')
        .eq('merchant_id', active.id)
        .order('created_at', { ascending: false }),
    ]);

    if (sessionError) throw sessionError;
    if (orderError) throw orderError;

    const sess = sessions || [];
    const allOrders = orders || [];

    // Real visitor statistics for the last 30 days.
    const visitors = sess.length;

    const pageviews = sess.reduce(
      (total: number, session: any) =>
        total + Number(session.pages_viewed || 1),
      0
    );

    const avg_duration = visitors
      ? Math.round(
          sess.reduce(
            (total: number, session: any) =>
              total + Number(session.duration_sec || 0),
            0
          ) / visitors
        )
      : 0;

    const sourceMap = new Map<string, number>();

    for (const session of sess) {
      const source = session.source || 'Direct';
      sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
    }

    const sources = Array.from(sourceMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Every successfully created order counts,
    // regardless of payment status.
    const totalOrders = allOrders.length;

    // Only paid, non-cancelled and non-refunded orders
    // contribute to revenue.
    const qualifyingOrders = allOrders.filter(isQualifyingSale);

    const revenue = sumRevenue(allOrders);

    const todayStart = startOfToday();
    const weekStart = startOfWeek();
    const monthStart = startOfMonth();

    const todayOrders = allOrders.filter(
      (order: any) => new Date(order.created_at) >= todayStart
    );

    const weekOrders = allOrders.filter(
      (order: any) => new Date(order.created_at) >= weekStart
    );

    const monthOrders = allOrders.filter(
      (order: any) => new Date(order.created_at) >= monthStart
    );

    const pendingOrders = allOrders.filter(
      (order: any) => order.payment_status === 'pending'
    );

    const completedOrders = allOrders.filter(
      (order: any) => order.status === 'delivered'
    );

    const cancelledOrders = allOrders.filter(
      (order: any) => order.status === 'cancelled'
    );

    const refundedOrders = allOrders.filter(
      (order: any) =>
        order.status === 'refunded' ||
        order.payment_status === 'refunded'
    );

    // Conversion uses orders created in the same 30-day
    // reporting period as the visitor statistics.
    const thirtyDayStart = new Date(since);

    const recentOrders = allOrders.filter(
      (order: any) => new Date(order.created_at) >= thirtyDayStart
    );

    const conversion_rate = visitors
      ? Number(((recentOrders.length / visitors) * 100).toFixed(2))
      : 0;

    return NextResponse.json(
      {
        visitors,
        pageviews,
        avg_duration,
        sources,

        orders: totalOrders,
        paid_orders: qualifyingOrders.length,
        pending_orders: pendingOrders.length,
        completed_orders: completedOrders.length,
        cancelled_orders: cancelledOrders.length,
        refunded_orders: refundedOrders.length,

        revenue,

        today_orders: todayOrders.length,
        today_revenue: sumRevenue(todayOrders),

        week_orders: weekOrders.length,
        week_revenue: sumRevenue(weekOrders),

        month_orders: monthOrders.length,
        month_revenue: sumRevenue(monthOrders),

        conversion_rate,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Analytics API error:', error);

    return NextResponse.json(
      { error: 'Unable to load analytics.' },
      { status: 500 }
    );
  }
}
