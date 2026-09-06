import { createClient } from '@/lib/supabase/server';
import { AnalyticsService } from '@/lib/services/analytics.service';
import { formatCurrency } from '@/lib/utils';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: merchant } = await supabase.from('merchants').select('*').eq('user_id', user?.id).single();
  const stats = await AnalyticsService.getMerchantStats(merchant.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back to {merchant.store_name}</p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Today's Visitors" value={stats.today_visitors.toString()} icon="👁️" />
        <StatCard title="Today's Orders" value={stats.today_orders.toString()} icon="🛒" />
        <StatCard title="Today's Sales" value={formatCurrency(stats.today_sales)} icon="💰" />
        <StatCard title="Conversion Rate" value={`${stats.conversion_rate}%`} icon="📊" />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
    </div>
  );
}