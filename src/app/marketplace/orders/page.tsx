import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getMarketplaceCustomer } from '@/lib/marketplace-auth';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export default async function MarketplaceOrdersPage() {
  const customer = await getMarketplaceCustomer();

  if (!customer) {
    redirect('/marketplace/login');
  }

  const admin = createAdminClient();
  
  // Fetch orders and join merchant details
  const { data: orders } = await admin
    .from('marketplace_orders')
    .select(`
      *,
      merchants:merchant_id (store_name, store_slug, logo_url)
    `)
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-24 max-w-3xl mx-auto">
      <Link href="/marketplace/profile" className="text-purple-600 text-sm hover:underline">← Back to Profile</Link>
      
      <h1 className="text-2xl font-extrabold mt-4 mb-6">📦 My Orders & Tracking</h1>

      {(!orders || orders.length === 0) ? (
        <div className="bg-white border rounded-2xl p-10 text-center">
          <div className="text-4xl mb-4">🛍️</div>
          <h2 className="text-xl font-bold mb-2">No orders yet</h2>
          <p className="text-gray-500 text-sm mb-6">When you buy from OrizzonCart stores, your tracking numbers will appear right here.</p>
          <Link href="/marketplace" className="inline-block px-6 py-3 bg-purple-600 text-white font-bold rounded-full hover:bg-purple-700">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => {
            const merchant = order.merchants;
            const statusColors: any = {
              processing: 'bg-yellow-100 text-yellow-800',
              shipped: 'bg-blue-100 text-blue-800',
              delivered: 'bg-green-100 text-green-800'
            };

            return (
              <div key={order.id} className="bg-white rounded-xl border p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {merchant?.logo_url ? (
                      <img src={merchant.logo_url} className="w-8 h-8 rounded-full object-cover" alt="" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs">🏪</div>
                    )}
                    <div>
                      <p className="font-bold text-sm">{merchant?.store_name || 'Unknown Store'}</p>
                      <p className="text-xs text-gray-500">Order #{order.order_number}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                    {order.status}
                  </span>
                </div>

                {order.tracking_number && (
                  <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 font-bold">Tracking Number</p>
                      <p className="text-sm font-mono font-bold">{order.tracking_number}</p>
                    </div>
                    {order.tracking_url && (
                      <a href={order.tracking_url} target="_blank" className="px-3 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700">
                        Track Package 📍
                      </a>
                    )}
                  </div>
                )}
                
                <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
                  <span>Placed on {new Date(order.created_at).toLocaleDateString()}</span>
                  <Link href={`https://${merchant?.store_slug}.orizzoncart.name.ng`} target="_blank" className="text-purple-600 font-bold hover:underline">
                    Visit Store →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}