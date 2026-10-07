import { createClient as createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const admin = createAdminClient();
  const { data: orders } = await admin
    .from('orders')
    .select('*, merchants(store_name, store_slug)')
    .eq('payment_status', 'paid')
    .order('created_at', { ascending: false })
    .limit(100);

  const totalGMV = (orders || []).reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const platformFee = totalGMV * 0.05;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <Link href="/admin" className="text-purple-600 text-sm hover:underline">← Back to Admin</Link>
        <h1 className="text-2xl font-bold mt-2">📦 All Paid Orders</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <div className="bg-white border rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase">Orders</p>
          <p className="text-2xl font-extrabold">{orders?.length || 0}</p>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase">Total GMV</p>
          <p className="text-2xl font-extrabold">₦{totalGMV.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs text-amber-700 uppercase font-bold">Platform Fee (5%)</p>
          <p className="text-2xl font-extrabold text-amber-900">₦{platformFee.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="divide-y">
          {(orders || []).map((o) => (
            <div key={o.id} className="p-4 flex items-center justify-between gap-3 hover:bg-gray-50">
              <div>
                <p className="font-bold text-sm">{o.order_number}</p>
                <p className="text-xs text-gray-500">{o.merchants?.store_name} • {o.customer_name}</p>
                <p className="text-[10px] text-gray-400">{new Date(o.created_at).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="font-extrabold text-purple-700">₦{Number(o.total_amount).toLocaleString()}</p>
                <p className="text-[10px] text-gray-400">₦{Math.round(Number(o.total_amount) * 0.05).toLocaleString()} fee</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}