
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { MerchantStats } from '@/types/database';

function isQualifyingSale(order: any) {
  return (
    order.payment_status === 'paid' &&
    order.status !== 'cancelled' &&
    order.status !== 'refunded'
  );
}

export class AnalyticsService {
  static async getMerchantStats(
    merchantId: string
  ): Promise<MerchantStats> {
    const supabase = createAdminClient();

    const [
      { data: orders, error: orderError },
      { count: visitors, error: visitorError },
    ] = await Promise.all([
      supabase
        .from('orders')
        .select('total_amount, status, payment_status, created_at')
        .eq('merchant_id', merchantId),

      supabase
        .from('store_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('merchant_id', merchantId),
    ]);

    if (orderError) throw orderError;
    if (visitorError) throw visitorError;

    const allOrders = orders || [];

    const salesOrders = allOrders.filter(isQualifyingSale);

    const totalSales = salesOrders.reduce(
      (total: number, order: any) =>
        total + Number(order.total_amount || 0),
      0
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = allOrders.filter(
      (order: any) => new Date(order.created_at) >= today
    );

    const todaySales = todayOrders
      .filter(isQualifyingSale)
      .reduce(
        (total: number, order: any) =>
          total + Number(order.total_amount || 0),
        0
      );

    const totalVisitors = visitors || 0;

    return {
      total_visitors: totalVisitors,
      total_orders: allOrders.length,
      total_sales: totalSales,

      conversion_rate: totalVisitors
        ? Number(
            ((allOrders.length / totalVisitors) * 100).toFixed(2)
          )
        : 0,

      today_visitors: 0,
      today_orders: todayOrders.length,
      today_sales: todaySales,
    };
  }
}
