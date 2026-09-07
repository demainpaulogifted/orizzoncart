import { createClient } from '@/lib/supabase/server';
import { formatCurrency, formatDate } from '@/lib/utils';

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: merchant } = await supabase.from('merchants').select('id').eq('user_id', user?.id).single();
  const { data: orders } = await supabase.from('orders').select('*').eq('merchant_id', merchant?.id).order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-gray-600 text-sm">{orders?.length || 0} total orders</p>
      </div>

      {(!orders || orders.length === 0) ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-16 text-center">
          <p className="text-5xl mb-4">🛒</p>
          <h2 className="text-xl font-bold mb-2">No orders yet</h2>
          <p className="text-gray-600">When customers buy from your store, their orders will appear here with tracking numbers.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Order</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Payment</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((o: any) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-xs">{o.order_number}</td>
                  <td className="px-6 py-4">{o.customer_name}</td>
                  <td className="px-6 py-4 font-bold">{formatCurrency(o.total_amount)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${o.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {o.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{formatDate(o.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}