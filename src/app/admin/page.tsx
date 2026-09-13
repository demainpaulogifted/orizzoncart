import { createClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single();
  if (profile?.role !== 'platform_admin') {
    return <div className="p-10 text-center text-red-600 font-bold">Access denied.</div>;
  }

  const { data: merchants } = await supabase.from('merchants').select('*');
  const activeStores = (merchants || []).filter((m: any) => m.payment_receiving_status === 'ACTIVE').length;
  
  const { data: orders } = await supabase.from('orders').select('total_amount').eq('payment_status', 'paid');
  const revenue = (orders || []).reduce((sum: number, o: any) => sum + Number(o.total_amount), 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-xl shadow-md">👑</span>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Platform Admin</h1>
          <p className="text-gray-500 text-xs">OrizzonS Inc. Control Center</p>
        </div>
      </div>

      {/* Compact Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-4 text-white shadow-md">
          <p className="text-white/80 text-[11px] font-semibold uppercase">Businesses</p>
          <p className="text-2xl font-extrabold mt-1">{merchants?.length || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 text-white shadow-md">
          <p className="text-white/80 text-[11px] font-semibold uppercase">Active Stores</p>
          <p className="text-2xl font-extrabold mt-1">{activeStores}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl p-4 text-white shadow-md">
          <p className="text-white/80 text-[11px] font-semibold uppercase">Revenue</p>
          <p className="text-2xl font-extrabold mt-1">{formatCurrency(revenue)}</p>
        </div>
      </div>

      {/* Tight Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <Link href="/admin/settings/billing" className="bg-white rounded-xl border border-gray-200 p-4 hover:border-amber-400 hover:shadow-md transition-all flex items-start gap-3">
          <span className="text-xl mt-0.5">💰</span>
          <div>
            <p className="font-bold text-sm text-gray-900">Billing & Pricing</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Fees, discounts, plans</p>
          </div>
        </Link>

        <Link href="/admin/digital-catalog" className="bg-white rounded-xl border border-gray-200 p-4 hover:border-purple-400 hover:shadow-md transition-all flex items-start gap-3">
          <span className="text-xl mt-0.5">📚</span>
          <div>
            <p className="font-bold text-sm text-gray-900">Digital Catalog</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Manage products & content</p>
          </div>
        </Link>

        <Link href="/admin/businesses" className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-400 hover:shadow-md transition-all flex items-start gap-3">
          <span className="text-xl mt-0.5">🏢</span>
          <div>
            <p className="font-bold text-sm text-gray-900">All Businesses</p>
            <p className="text-[11px] text-gray-500 mt-0.5">View & manage merchants</p>
          </div>
        </Link>
      </div>

      {/* Recent Merchants List */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50">
          <h2 className="text-sm font-bold text-gray-900">Recent Businesses</h2>
        </div>
        <div className="divide-y max-h-[300px] overflow-y-auto">
          {(!merchants || merchants.length === 0) ? (
            <p className="p-6 text-center text-gray-500 text-xs">No merchants yet.</p>
          ) : (
            (merchants || []).slice(0, 10).map((m: any) => (
              <Link key={m.id} href={`/admin/merchants/${m.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm text-gray-900 truncate">{m.store_name}</p>
                  <p className="text-[11px] text-gray-500 truncate">{m.store_slug}</p>
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
    </div>
  );
}