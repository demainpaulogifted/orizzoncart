import { createClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils';

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: merchant } = await supabase.from('merchants').select('id').eq('user_id', user?.id).single();
  const { data: orders } = await supabase.from('orders').select('total_amount, payment_status').eq('merchant_id', merchant?.id);
  const { count: visitors } = await supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('merchant_id', merchant?.id);

  const paidOrders = orders?.filter((o: any) => o.payment_status === 'paid') || [];
  const revenue = paidOrders.reduce((acc: number, o: any) => acc + o.total_amount, 0);
  const conversion = visitors ? ((paidOrders.length / visitors) * 100).toFixed(1) : '0.0';

  const cards = [
    { label: 'Total Visitors', value: (visitors || 0).toString(), icon: '👁️', bg: 'from-blue-500 to-indigo-500' },
    { label: 'Paid Orders', value: paidOrders.length.toString(), icon: '🛒', bg: 'from-green-500 to-emerald-600' },
    { label: 'Total Revenue', value: formatCurrency(revenue), icon: '💰', bg: 'from-purple-500 to-fuchsia-600' },
    { label: 'Conversion Rate', value: `${conversion}%`, icon: '📊', bg: 'from-orange-400 to-red-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-gray-600 text-sm">Real performance data for your store.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((c) => (
          <div key={c.label} className={`bg-gradient-to-br ${c.bg} rounded-2xl p-6 text-white shadow-lg`}>
            <div className="flex items-center justify-between">
              <p className="text-white/80 text-sm font-medium">{c.label}</p>
              <span className="text-2xl">{c.icon}</span>
            </div>
            <p className="text-3xl font-extrabold mt-2">{c.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        💡 Visitor counting is active on your storefront. Every page view is recorded automatically.
      </div>
    </div>
  );
}