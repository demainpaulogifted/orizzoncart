import { createClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: merchant } = await supabase.from('merchants').select('*').eq('user_id', user?.id).single();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const { data: orders } = await supabase
    .from('orders')
    .select('total_amount, payment_status, created_at')
    .eq('merchant_id', merchant?.id);

  const { count: visitors } = await supabase
    .from('analytics_events')
    .select('*', { count: 'exact', head: true })
    .eq('merchant_id', merchant?.id);

  const paid = (orders || []).filter((o: any) => o.payment_status === 'paid');
  const todayOrders = paid.filter((o: any) => new Date(o.created_at) >= startOfToday);
  const todaySales = todayOrders.reduce((acc: number, o: any) => acc + o.total_amount, 0);
  const conversion = visitors ? ((paid.length / visitors) * 100).toFixed(1) : '0.0';

  const isShowcaseMode = merchant?.cart_status === 'LOCKED';

  const cards = [
    { label: "Today's Visitors", value: (visitors || 0).toString(), grad: 'from-blue-400 to-indigo-600' },
    { label: "Today's Orders", value: todayOrders.length.toString(), grad: 'from-green-400 to-teal-600' },
    { label: "Today's Sales (₦)", value: formatCurrency(todaySales), grad: 'from-purple-400 to-purple-600' },
    { label: 'Conversion Rate', value: `${conversion}%`, grad: 'from-orange-300 to-orange-500' },
  ];

  return (
    <div className="space-y-8">
      {isShowcaseMode && (
        <div className="bg-yellow-200/70 rounded-xl px-6 py-4 text-center shadow-sm">
          <p className="font-bold text-gray-900 text-base sm:text-lg">
            ⚠️ Showcase Mode - Activate payment to enable cart
          </p>
        </div>
      )}

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
          Welcome back to {merchant?.store_name}!
        </h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {cards.map((c) => (
          <div
            key={c.label}
            className={`bg-gradient-to-br ${c.grad} rounded-3xl shadow-xl p-6 min-h-[150px] flex flex-col items-center justify-center text-center text-white transform hover:scale-[1.03] transition-transform`}
          >
            <p className="text-lg sm:text-xl font-bold leading-tight">{c.label}</p>
            <p className="text-3xl font-extrabold mt-2">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/dashboard/products/add" className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-purple-400 hover:shadow-md transition-all">
          <span className="text-2xl">➕</span>
          <p className="font-bold mt-2">Add a product</p>
          <p className="text-xs text-gray-500 mt-1">Name, price, photo. Done.</p>
        </Link>
        <Link href="/dashboard/settings/payment" className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-purple-400 hover:shadow-md transition-all">
          <span className="text-2xl">💳</span>
          <p className="font-bold mt-2">Activate payments</p>
          <p className="text-xs text-gray-500 mt-1">Connect Paystack & unlock checkout.</p>
        </Link>
        <Link href="/dashboard/settings/theme" className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-purple-400 hover:shadow-md transition-all">
          <span className="text-2xl">🎨</span>
          <p className="font-bold mt-2">Change theme</p>
          <p className="text-xs text-gray-500 mt-1">10 premium designer storefronts.</p>
        </Link>
      </div>
    </div>
  );
}