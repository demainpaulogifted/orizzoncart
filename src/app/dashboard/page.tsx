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

  const status = merchant?.payment_receiving_status;

  const cards = [
    { label: "Today's Visitors", value: (visitors || 0).toString(), grad: 'from-blue-400 to-indigo-600' },
    { label: "Today's Orders", value: todayOrders.length.toString(), grad: 'from-green-400 to-teal-600' },
    { label: "Today's Sales (₦)", value: formatCurrency(todaySales), grad: 'from-purple-400 to-purple-600' },
    { label: 'Conversion Rate', value: `${conversion}%`, grad: 'from-orange-300 to-orange-500' },
  ];

  return (
    <div className="space-y-8">
      {(status === 'SUSPENDED' || status === 'HELD') && (
        <div className="bg-red-100 border border-red-300 rounded-xl px-6 py-4 text-center shadow-sm">
          <p className="font-bold text-red-800">🛑 Payments suspended — renew your maintenance plan to resume.</p>
          <Link href="/dashboard/settings/plans" className="text-sm font-bold text-red-700 underline">Renew now</Link>
        </div>
      )}

      {status === 'PENDING_KEYS' && (
        <div className="bg-blue-100 border border-blue-300 rounded-xl px-6 py-4 text-center shadow-sm">
          <p className="font-bold text-blue-800">🔑 Activation fee paid! Add your payment keys to go live.</p>
          <Link href="/dashboard/settings/payment" className="text-sm font-bold text-blue-700 underline">Complete Step 2</Link>
        </div>
      )}

      {status !== 'ACTIVE' && status !== 'PENDING_KEYS' && status !== 'SUSPENDED' && status !== 'HELD' && (
        <div className="bg-yellow-200/70 rounded-xl px-6 py-4 text-center shadow-sm">
          <p className="font-bold text-gray-900 text-base sm:text-lg">⚠️ Showcase Mode - Activate payment to enable cart</p>
          <Link href="/dashboard/settings/payment" className="text-sm font-bold text-purple-700 underline">Activate my store now</Link>
        </div>
      )}

      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
        Welcome back to {merchant?.store_name}!
      </h1>

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
          <p className="font-bold mt-2">{status === 'ACTIVE' ? 'Manage payments' : 'Activate payments'}</p>
          <p className="text-xs text-gray-500 mt-1">{status === 'ACTIVE' ? 'Update your gateway keys anytime.' : 'Pay fee, connect keys, go live.'}</p>
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