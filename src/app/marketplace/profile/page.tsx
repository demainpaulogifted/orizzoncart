import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getMarketplaceCustomer } from '@/lib/marketplace-auth';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function MarketplaceProfilePage() {
  const customer = await getMarketplaceCustomer();
  const supabase = await createClient();

  if (!customer) {
    redirect('/marketplace/login');
  }

  const admin = createAdminClient();
  
  // Fetch all orders for this customer to calculate stats
  const { data: orders } = await admin
    .from('marketplace_orders')
    .select('merchant_id, merchant_order_id, status')
    .eq('customer_id', customer.id);

  const totalOrders = orders?.length || 0;
  const uniqueStores = new Set(orders?.map(o => o.merchant_id) || []).size;

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-24 max-w-3xl mx-auto">
      <Link href="/marketplace" className="text-purple-600 text-sm hover:underline">← Back to Marketplace</Link>
      
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white mt-4 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
            {customer.full_name?.[0]?.toUpperCase() || '👤'}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">{customer.full_name || 'Shopper'}</h1>
            <p className="text-purple-100 text-sm">{customer.email}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-white p-4 rounded-xl border shadow-sm text-center">
          <p className="text-3xl font-extrabold text-purple-600">{totalOrders}</p>
          <p className="text-xs text-gray-500 font-semibold mt-1">Total Orders</p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm text-center">
          <p className="text-3xl font-extrabold text-blue-600">{uniqueStores}</p>
          <p className="text-xs text-gray-500 font-semibold mt-1">Stores Shopped</p>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <h2 className="font-bold text-lg">Account Settings</h2>
        <div className="bg-white rounded-xl border divide-y">
          <Link href="/marketplace/orders" className="flex items-center justify-between p-4 hover:bg-gray-50">
            <span className="flex items-center gap-3 font-medium text-sm">📦 My Orders & Tracking</span>
            <span className="text-gray-400">→</span>
          </Link>
          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 text-left">
            <span className="flex items-center gap-3 font-medium text-sm">📍 Saved Addresses</span>
            <span className="text-gray-400">→</span>
          </button>
          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 text-left">
            <span className="flex items-center gap-3 font-medium text-sm">🔔 Notifications</span>
            <span className="text-gray-400">→</span>
          </button>
        </div>

        <form action={async () => {
          'use server';
          const { createClient } = await import('@/lib/supabase/server');
          const sb = await createClient();
          await sb.auth.signOut();
          redirect('/marketplace');
        }}>
          <button type="submit" className="w-full mt-4 py-3 bg-white border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50">
            Log Out
          </button>
        </form>
      </div>
    </div>
  );
}