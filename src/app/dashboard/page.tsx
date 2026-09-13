import { createClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { cookies } from 'next/headers';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const cookieStore = await cookies();
  const activeId = cookieStore.get('active_merchant_id')?.value;

  const { data: merchants } = await supabase.from('merchants').select('*').eq('user_id', user?.id);
  const merchant = (merchants || []).find((m: any) => m.id === activeId) || (merchants || [])[0] || null;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const { data: orders } = merchant
    ? await supabase.from('orders').select('total_amount, payment_status, created_at').eq('merchant_id', merchant.id)
    : { data: [] };

  const { count: visitors } = merchant
    ? await supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('merchant_id', merchant.id)
    : { count: 0 };

  const paid = (orders || []).filter((o: any) => o.payment_status === 'paid');
  const todayOrders = paid.filter((o: any) => new Date(o.created_at) >= startOfToday);
  const todaySales = todayOrders.reduce((acc: number, o: any) => acc + o.total_amount, 0);
  const conversion = visitors ? ((paid.length / visitors) * 100).toFixed(1) : '0.0';

  const status = merchant?.payment_receiving_status;

  const cards = [
    { label: "Visitors", value: (visitors || 0).toString(), grad: 'from-blue-500 to-indigo-600' },
    { label: "Orders", value: todayOrders.length.toString(), grad: 'from-emerald-500 to-teal-600' },
    { label: "Sales", value: formatCurrency(todaySales), grad: 'from-purple-500 to-violet-600' },
    { label: "Conv.", value: `${conversion}%`, grad: 'from-orange-400 to-amber-500' },
  ];

  return (
    <div className="space-y-5">
      {/* Status Banners */}
      {(status === 'SUSPENDED' || status === 'HELD') && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-center shadow-sm">
          <p className="font-bold text-red-800 text-sm">🛑 Payments suspended</p>
          <Link href="/dashboard/settings/plans" className="text-xs font-bold text-red-700 underline">Renew now</Link>
        </div>
      )}

      {status === 'PENDING_KEYS' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-center shadow-sm">
          <p className="font-bold text-blue-800 text-sm">🏦 Add bank account to go live</p>
          <Link href="/dashboard/settings/payment" className="inline-block mt-1 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700">
            Add Bank Account
          </Link>
        </div>
      )}

      {status !== 'ACTIVE' && status !== 'PENDING_KEYS' && status !== 'SUSPENDED' && status !== 'HELD' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-center shadow-sm">
          <p className="font-bold text-gray-900 text-sm">⚠️ Showcase Mode — activate to sell</p>
          <Link href="/dashboard/settings/payment" className="inline-block mt-1 px-4 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700">
            Activate Store
          </Link>
        </div>
      )}

      <h1 className="text-xl font-extrabold text-gray-900 truncate">
        Welcome back, {merchant?.store_name?.split(' ')[0] || 'Merchant'}!
      </h1>

      {/* Compact Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className={`bg-gradient-to-br ${c.grad} rounded-2xl p-4 flex flex-col justify-center text-white shadow-md min-h-[90px]`}
          >
            <p className="text-[11px] font-semibold text-white/80 uppercase tracking-wide">{c.label}</p>
            <p className="text-2xl font-extrabold mt-1 leading-none">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Tight Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link href="/dashboard/products/add" className="bg-white rounded-xl border border-gray-200 p-4 hover:border-purple-400 hover:shadow-md transition-all flex items-start gap-3">
          <span className="text-xl mt-0.5">➕</span>
          <div>
            <p className="font-bold text-sm text-gray-900">Add Product</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Name, price, photo.</p>
          </div>
        </Link>
        
        <Link href="/dashboard/settings/payment" className="bg-white rounded-xl border border-gray-200 p-4 hover:border-purple-400 hover:shadow-md transition-all flex items-start gap-3">
          <span className="text-xl mt-0.5">🏦</span>
          <div>
            <p className="font-bold text-sm text-gray-900">{status === 'ACTIVE' ? 'Payouts' : 'Activate'}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">{status === 'ACTIVE' ? 'Manage bank account' : 'Pay fee & add bank'}</p>
          </div>
        </Link>

        <Link href="/dashboard/settings/theme" className="bg-white rounded-xl border border-gray-200 p-4 hover:border-purple-400 hover:shadow-md transition-all flex items-start gap-3">
          <span className="text-xl mt-0.5">🎨</span>
          <div>
            <p className="font-bold text-sm text-gray-900">Theme</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Change storefront look</p>
          </div>
        </Link>
      </div>
    </div>
  );
}