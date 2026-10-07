import { createClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from('profiles').select('role, email').eq('id', user?.id).single();
  if (profile?.role !== 'platform_admin') {
    return <div className="p-10 text-center text-red-600 font-bold">Access denied.</div>;
  }

  const isAdminEmail = user?.email === 'paulotubo9@gmail.com';

  // Fetch all stats
  const { data: merchants } = await supabase.from('merchants').select('*');
  const activeStores = (merchants || []).filter((m: any) => m.payment_receiving_status === 'ACTIVE').length;
  const pendingVerifications = (merchants || []).filter((m: any) => !m.is_verified && m.business_locations).length;
  
  const { data: orders } = await supabase.from('orders').select('total_amount, created_at, customer_name, merchants(store_name)').eq('payment_status', 'paid');
  const revenue = (orders || []).reduce((sum: number, o: any) => sum + Number(o.total_amount), 0);
  const platformFee = revenue * 0.05; // 5% platform cut

  const { data: products } = await supabase.from('products').select('id').eq('is_active', true);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-xl shadow-md">👑</span>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Platform Admin</h1>
          <p className="text-gray-500 text-xs">OrizzonS Inc. Control Center</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-4 text-white shadow-md">
          <p className="text-white/80 text-[11px] font-semibold uppercase">Businesses</p>
          <p className="text-2xl font-extrabold mt-1">{merchants?.length || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 text-white shadow-md">
          <p className="text-white/80 text-[11px] font-semibold uppercase">Active Stores</p>
          <p className="text-2xl font-extrabold mt-1">{activeStores}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-4 text-white shadow-md">
          <p className="text-white/80 text-[11px] font-semibold uppercase">Pending Verify</p>
          <p className="text-2xl font-extrabold mt-1">{pendingVerifications}</p>
        </div>
        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-4 text-white shadow-md">
          <p className="text-white/80 text-[11px] font-semibold uppercase">Orders</p>
          <p className="text-2xl font-extrabold mt-1">{orders?.length || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-4 text-white shadow-md">
          <p className="text-white/80 text-[11px] font-semibold uppercase">Products</p>
          <p className="text-2xl font-extrabold mt-1">{products?.length || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl p-4 text-white shadow-md">
          <p className="text-white/80 text-[11px] font-semibold uppercase">Platform Fee (5%)</p>
          <p className="text-2xl font-extrabold mt-1">{formatCurrency(platformFee)}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Action Required: Verifications */}
        <Link href="/admin/verifications" className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-300 p-4 hover:shadow-md transition-all flex items-start gap-3">
          <span className="text-2xl mt-0.5">⏳</span>
          <div className="flex-1">
            <p className="font-bold text-sm text-amber-900">Verification Queue</p>
            <p className="text-[11px] text-amber-700 mt-0.5 font-bold">{pendingVerifications} pending</p>
          </div>
        </Link>

        <Link href="/admin/merchants" className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-400 hover:shadow-md transition-all flex items-start gap-3">
          <span className="text-xl mt-0.5">🏢</span>
          <div>
            <p className="font-bold text-sm text-gray-900">All Businesses</p>
            <p className="text-[11px] text-gray-500 mt-0.5">View & manage merchants</p>
          </div>
        </Link>

        <Link href="/admin/orders" className="bg-white rounded-xl border border-gray-200 p-4 hover:border-purple-400 hover:shadow-md transition-all flex items-start gap-3">
          <span className="text-xl mt-0.5">📦</span>
          <div>
            <p className="font-bold text-sm text-gray-900">All Orders</p>
            <p className="text-[11px] text-gray-500 mt-0.5">GMV: {formatCurrency(revenue)}</p>
          </div>
        </Link>

        <Link href="/admin/settings/billing" className="bg-white rounded-xl border border-gray-200 p-4 hover:border-amber-400 hover:shadow-md transition-all flex items-start gap-3">
          <span className="text-xl mt-0.5">💰</span>
          <div>
            <p className="font-bold text-sm text-gray-900">Billing & Pricing</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Fees, discounts, plans</p>
          </div>
        </Link>

        {isAdminEmail && (
          <Link href="/admin/digital-catalog" className="bg-white rounded-xl border border-gray-200 p-4 hover:border-purple-400 hover:shadow-md transition-all flex items-start gap-3">
            <span className="text-xl mt-0.5">📚</span>
            <div>
              <p className="font-bold text-sm text-gray-900">Digital Catalog</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Admin-only products</p>
            </div>
          </Link>
        )}

        <Link href="/admin/platform-settings" className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-400 hover:shadow-md transition-all flex items-start gap-3">
          <span className="text-xl mt-0.5">⚙️</span>
          <div>
            <p className="font-bold text-sm text-gray-900">Platform Settings</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Global configuration</p>
          </div>
        </Link>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Businesses */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">Recent Businesses</h2>
            <Link href="/admin/merchants" className="text-xs text-purple-600 font-bold hover:underline">View all →</Link>
          </div>
          <div className="divide-y max-h-[400px] overflow-y-auto">
            {(!merchants || merchants.length === 0) ? (
              <p className="p-6 text-center text-gray-500 text-xs">No merchants yet.</p>
            ) : (
              (merchants || []).slice(0, 10).map((m: any) => (
                <Link key={m.id} href={`/admin/merchants/${m.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-gray-900 truncate">{m.store_name}</p>
                    <p className="text-[11px] text-gray-500 truncate">{m.store_slug}.orizzoncart.name.ng</p>
                  </div>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                    m.payment_receiving_status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                    m.payment_receiving_status === 'HELD' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {m.payment_receiving_status}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-purple-600 font-bold hover:underline">View all →</Link>
          </div>
          <div className="divide-y max-h-[400px] overflow-y-auto">
            {(!orders || orders.length === 0) ? (
              <p className="p-6 text-center text-gray-500 text-xs">No orders yet.</p>
            ) : (
              (orders || []).slice(0, 10).map((o: any, i: number) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-gray-900 truncate">{o.merchants?.store_name || 'Unknown'}</p>
                    <p className="text-[11px] text-gray-500 truncate">{o.customer_name} • {new Date(o.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right ml-2">
                    <p className="font-extrabold text-sm text-purple-700">{formatCurrency(Number(o.total_amount))}</p>
                    <p className="text-[10px] text-gray-400">{formatCurrency(Number(o.total_amount) * 0.05)} fee</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}