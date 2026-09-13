import { createClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Verify platform admin role
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single();
  if (profile?.role !== 'platform_admin') {
    return <div className="p-10 text-center text-red-600 font-bold">Access denied. Platform admin only.</div>;
  }

  // Fetch stats
  const { data: merchants } = await supabase.from('merchants').select('*');
  const activeStores = (merchants || []).filter((m: any) => m.payment_receiving_status === 'ACTIVE').length;
  
  // Calculate platform revenue from paid orders
  const { data: orders } = await supabase.from('orders').select('total_amount').eq('payment_status', 'paid');
  const revenue = (orders || []).reduce((sum: number, o: any) => sum + Number(o.total_amount), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-2xl shadow-md">👑</span>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Platform Admin</h1>
          <p className="text-gray-600 text-sm">Super admin control center — OrizzonS Inc.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-400 to-indigo-600 rounded-3xl p-6 text-white shadow-lg">
          <p className="text-white/80 text-sm font-medium">Total Businesses</p>
          <p className="text-3xl font-extrabold mt-1">{merchants?.length || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-green-400 to-emerald-600 rounded-3xl p-6 text-white shadow-lg">
          <p className="text-white/80 text-sm font-medium">Active Stores</p>
          <p className="text-3xl font-extrabold mt-1">{activeStores}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-3xl p-6 text-white shadow-lg">
          <p className="text-white/80 text-sm font-medium">Platform Revenue</p>
          <p className="text-3xl font-extrabold mt-1">{formatCurrency(revenue)}</p>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/admin/settings/billing" className="block bg-white rounded-2xl border border-gray-200 p-5 hover:border-amber-400 hover:shadow-md transition-all">
          <span className="text-2xl">💰</span>
          <p className="font-bold mt-2">Billing & Pricing</p>
          <p className="text-xs text-gray-500 mt-1">Activation fee, discounts, recurring plans.</p>
        </Link>

        {/* NEW: Digital Catalog Management Button */}
        <Link href="/admin/digital-catalog" className="block bg-white rounded-2xl border border-gray-200 p-5 hover:border-purple-400 hover:shadow-md transition-all">
          <span className="text-2xl">📚</span>
          <p className="font-bold mt-2">Digital Catalog</p>
          <p className="text-xs text-gray-500 mt-1">Manage platform digital products, prices & content.</p>
        </Link>

        <Link href="/admin/businesses" className="block bg-white rounded-2xl border border-gray-200 p-5 hover:border-blue-400 hover:shadow-md transition-all">
          <span className="text-2xl">🏢</span>
          <p className="font-bold mt-2">All Businesses</p>
          <p className="text-xs text-gray-500 mt-1">View, edit, or delete merchant accounts.</p>
        </Link>
      </div>

      {/* Recent Merchants List */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="p-5 border-b">
          <h2 className="text-lg font-bold">Recent Businesses</h2>
        </div>
        {(!merchants || merchants.length === 0) ? (
          <p className="p-8 text-center text-gray-500 text-sm">No merchants yet. They will appear here when they sign up.</p>
        ) : (
          <div className="divide-y">
            {(merchants || []).slice(0, 10).map((m: any) => (
              <Link key={m.id} href={`/admin/merchants/${m.id}`} className="flex items-center justify-between p-4 hover:bg-gray-50">
                <div>
                  <p className="font-bold text-gray-900">{m.store_name}</p>
                  <p className="text-xs text-gray-500">{m.business_name} • {m.store_slug}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  m.payment_receiving_status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                  m.payment_receiving_status === 'HELD' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {m.payment_receiving_status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}