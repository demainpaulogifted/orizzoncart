import Link from 'next/link';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { MarketplaceBottomNav } from '@/components/marketplace/MarketplaceBottomNav';

export const dynamic = 'force-dynamic';

const statusColor: any = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-yellow-100 text-yellow-800',
  shipped: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-600',
};

export default async function MyOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const params = await searchParams;
  const email = (params.email || '').trim().toLowerCase();

  let orders: any[] = [];
  const merchantsMap: Record<string, any> = {};

  if (email) {
    const admin = createAdminClient();
    const { data } = await admin
      .from('orders')
      .select('*')
      .ilike('customer_email', email)
      .order('created_at', { ascending: false })
      .limit(50);
    orders = data || [];

    const ids = [...new Set(orders.map((o) => o.merchant_id))];
    if (ids.length) {
      const { data: ms } = await admin
        .from('merchants')
        .select('id, store_name, store_slug, logo_url')
        .in('id', ids);
      (ms || []).forEach((m: any) => (merchantsMap[m.id] = m));
    }
  }

  const storesCount = new Set(orders.map((o) => o.merchant_id)).size;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-gradient-to-r from-purple-700 to-blue-700 text-white">
        <div className="max-w-3xl mx-auto px-4 py-5">
          <h1 className="text-xl font-extrabold">📦 My Order</h1>
          <p className="text-xs text-purple-100 mt-1">
            Every order you placed on any OrizzonCart store — one place, all tracking numbers.
          </p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-4 space-y-4">
        <form method="GET" className="bg-white border rounded-2xl p-4 space-y-3 shadow-sm">
          <label className="text-xs font-bold text-gray-600">
            Enter the email you used at checkout
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              name="email"
              required
              defaultValue={email}
              placeholder="you@example.com"
              className="flex-1 rounded-xl px-4 py-3 border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button className="px-5 py-3 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700">
              Find
            </button>
          </div>
          <p className="text-[10px] text-gray-400">
            No password needed. We simply gather the orders placed with this email.
          </p>
        </form>

        {email && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border rounded-xl p-4 text-center">
                <p className="text-2xl font-extrabold text-purple-600">{orders.length}</p>
                <p className="text-[10px] font-bold text-gray-500">ORDERS FOUND</p>
              </div>
              <div className="bg-white border rounded-xl p-4 text-center">
                <p className="text-2xl font-extrabold text-blue-600">{storesCount}</p>
                <p className="text-[10px] font-bold text-gray-500">STORES</p>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="bg-white border rounded-2xl p-10 text-center text-gray-500 text-sm">
                No orders found for <b>{email}</b>.
                <br />
                Shop from the marketplace and your orders will appear here automatically.
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((o) => {
                  const m = merchantsMap[o.merchant_id];
                  return (
                    <div key={o.id} className="bg-white border rounded-2xl p-4 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          {m?.logo_url ? (
                            <img src={m.logo_url} className="w-8 h-8 rounded-full object-cover" alt="" />
                          ) : (
                            <span className="w-8 h-8 rounded-full bg-gray-200 text-xs flex items-center justify-center">🏪</span>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-bold truncate">{m?.store_name || 'OrizzonCart Store'}</p>
                            <p className="text-[10px] text-gray-400">
                              Order #{o.order_number} • {new Date(o.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-[10px] font-extrabold uppercase ${statusColor[o.status] || 'bg-gray-100 text-gray-600'}`}>
                          {o.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">{o.customer_name}</span>
                        <span className="font-extrabold">₦{Number(o.total_amount).toLocaleString()}</span>
                      </div>

                      {(o as any).tracking_number ? (
                        <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-bold text-gray-400">TRACKING NUMBER</p>
                            <p className="text-sm font-mono font-bold">{(o as any).tracking_number}</p>
                          </div>
                          <Link
                            href="/track-order"
                            className="px-3 py-2 bg-purple-600 text-white text-xs font-bold rounded-lg"
                          >
                            Track 📍
                          </Link>
                        </div>
                      ) : (
                        <p className="text-[10px] text-gray-400">
                          Tracking number will appear here once the store ships your order.
                        </p>
                      )}

                      {m && (
                        <Link
                          href={`https://${m.store_slug}.orizzoncart.name.ng`}
                          target="_blank"
                          className="block text-center text-[11px] font-bold text-purple-600 hover:underline"
                        >
                          Visit {m.store_name} →
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      <MarketplaceBottomNav active="orders" />
    </div>
  );
}