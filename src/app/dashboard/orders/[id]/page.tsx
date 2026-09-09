'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function OrderDetailPage({ params }: { params: any }) {
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*), merchants(store_name)')
        .eq('id', params.id)
        .single();
      setOrder(data);
      setLoading(false);
    };
    load();
  }, [params.id]);

  const updateStatus = async (status: string) => {
    setUpdating(true);
    const supabase = createClient();
    const { error } = await supabase.from('orders').update({ status }).eq('id', params.id);
    if (error) alert('Failed to update status');
    else {
      setOrder({ ...order, status });
      alert('Status updated!');
    }
    setUpdating(false);
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!order) return <div className="p-10 text-center">Order not found</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/orders" className="text-sm text-purple-600 hover:underline mb-2 inline-block">← Back to Orders</Link>
          <h1 className="text-2xl font-bold">Order {order.order_number}</h1>
          <p className="text-gray-600 text-sm">{formatDate(order.created_at)}</p>
        </div>
        <div className="flex gap-2">
          {order.status === 'pending' && (
            <button onClick={() => updateStatus('processing')} disabled={updating} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 disabled:opacity-50">
              {updating ? '...' : 'Mark Processing'}
            </button>
          )}
          {order.status === 'processing' && (
            <button onClick={() => updateStatus('shipped')} disabled={updating} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50">
              {updating ? '...' : 'Mark Shipped'}
            </button>
          )}
          {order.status === 'shipped' && (
            <button onClick={() => updateStatus('delivered')} disabled={updating} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 disabled:opacity-50">
              {updating ? '...' : 'Mark Delivered'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Info */}
        <div className="bg-white rounded-2xl border p-6 space-y-3">
          <h2 className="text-lg font-bold">👤 Customer</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="font-bold">{order.customer_name}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="font-bold">{order.customer_email}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Phone</span><span className="font-bold">{order.customer_phone}</span></div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-white rounded-2xl border p-6 space-y-3">
          <h2 className="text-lg font-bold">💳 Payment</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Status</span><span className={`font-bold ${order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>{order.payment_status.toUpperCase()}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Method</span><span className="font-bold">{order.payment_method || 'Paystack'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Reference</span><span className="font-mono text-xs">{order.payment_intent_id || 'N/A'}</span></div>
            <div className="flex justify-between border-t pt-2"><span className="font-bold text-gray-800">Total</span><span className="font-extrabold text-lg">{formatCurrency(order.total_amount)}</span></div>
          </div>
        </div>

        {/* Shipping Info */}
        <div className="bg-white rounded-2xl border p-6 space-y-3 md:col-span-2">
          <h2 className="text-lg font-bold">🚚 Shipping</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Status</span><span className={`font-bold ${
              order.status === 'delivered' ? 'text-green-600' :
              order.status === 'shipped' ? 'text-blue-600' :
              order.status === 'processing' ? 'text-purple-600' :
              'text-gray-600'
            }`}>{order.status.toUpperCase()}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Tracking Number</span><span className="font-mono font-bold">{order.tracking_number}</span></div>
            {order.shipping_address && (
              <>
                <div className="flex justify-between"><span className="text-gray-500">Address</span><span className="font-bold text-right">{order.shipping_address.address_line1}, {order.shipping_address.city}, {order.shipping_address.state}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Shipping Cost</span><span className="font-bold">{formatCurrency(order.shipping_cost)}</span></div>
              </>
            )}
            {!order.shipping_address && (
              <p className="text-gray-500 italic">Digital product — no shipping required</p>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-2xl border p-6 space-y-3 md:col-span-2">
          <h2 className="text-lg font-bold">📦 Items ({order.order_items?.length || 0})</h2>
          <div className="space-y-3">
            {order.order_items?.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{item.product_name}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity} × {formatCurrency(item.unit_price)}</p>
                </div>
                <p className="font-bold text-gray-900">{formatCurrency(item.total_price)}</p>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-bold">{formatCurrency(order.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span className="font-bold">{formatCurrency(order.shipping_cost)}</span></div>
            <div className="flex justify-between border-t pt-2 text-base"><span className="font-bold text-gray-800">Total</span><span className="font-extrabold">{formatCurrency(order.total_amount)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}