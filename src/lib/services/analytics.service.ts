import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { MerchantStats } from '@/types/database';

export class AnalyticsService {
  static async getMerchantStats(merchantId: string): Promise<MerchantStats> {
    const supabase = createAdminClient();
    // Simplified mock for now, replace with actual RPC later
    const { data: orders } = await supabase.from('orders').select('total_amount, status').eq('merchant_id', merchantId);
    const totalSales = orders?.reduce((acc, curr) => acc + curr.total_amount, 0) || 0;
    
    return {
      total_visitors: 120,
      total_orders: orders?.length || 0,
      total_sales: totalSales,
      conversion_rate: 2.5,
      today_visitors: 15,
      today_orders: 2,
      today_sales: 15000,
    };
  }
}