import { createClient } from '@/lib/supabase/server';
import { AnalyticsService } from '@/lib/services/analytics.service';
import { formatCurrency } from '@/lib/utils';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: merchant } = await supabase.from('merchants').select('*').eq('user_id', user?.id).single();
  
  // Mock stats for now (replace with real data later)
  const stats = {
    today_visitors: 124,
    today_orders: 12,
    today_sales: 45000,
    conversion_rate: 3.5,
  };

  const isShowcaseMode = merchant?.cart_status === 'LOCKED';

  return (
    <div className="space-y-8">
      {/* Showcase Mode Banner */}
      {isShowcaseMode && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <span className="text-2xl mr-3">⚠️</span>
            <div>
              <p className="font-bold">Showcase Mode</p>
              <p className="text-sm">Activate payment to enable cart and checkout.</p>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-display">Welcome back to {merchant?.store_name || 'Your Store'}!</h1>
        <p className="text-gray-600 mt-2">Here's what's happening with your store today.</p>
      </div>

      {/* Colorful Stat Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Today's Visitors" value={stats.today_visitors.toString()} bgClass="bg-card-blue" />
        <StatCard title="Today's Orders" value={stats.today_orders.toString()} bgClass="bg-card-green" />
        <StatCard title="Today's Sales (₦)" value={formatCurrency(stats.today_sales)} bgClass="bg-card-purple" />
        <StatCard title="Conversion Rate" value={`${stats.conversion_rate}%`} bgClass="bg-card-orange" />
      </div>
    </div>
  );
}

function StatCard({ title, value, bgClass }: { title: string; value: string; bgClass: string }) {
  return (
    <div className={`${bgClass} rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform duration-300`}>
      <p className="text-white/80 text-sm font-medium mb-2">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}