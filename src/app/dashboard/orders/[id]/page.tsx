'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { downloadReceipt } from '@/lib/receipt';
import Link from 'next/link';
import { toast } from 'sonner';

const NEXT_ACTION: Record<string, { label: string; next: string }> = {
  pending: { label: '▶️ Start Processing', next: 'processing' },
  processing: { label: '📦 Mark Ready for Delivery', next: 'shipped' },
  shipped: { label: '✅ Mark Delivered', next: 'delivered' },
};

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*, products(is_digital, digital_file_url, digital_file_name)), merchants(store_name)')
        .eq('id', id)
        .single();
      setOrder(data);
      setLoading(false);
    };
    load();
  }, [id]);

  const advance = async () => {
    const action = NEXT_ACTION[order.status];
    if (!action) return;
    setUpdating(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('orders')
      .update({ status: action.next })
      .eq('id', id)
      .select();

    if (error) {
      toast.error('Failed to update: ' + error.message);
    } else if (!data || data.length === 0) {
      toast.error('⚠️ Status did NOT save (permission problem). Run the orders RLS SQL in Supabase.');
    } else {
      setOrder({ ...order, status: data[0].status });
      toast.success('Status updated!');
    }
    setUpdating(false);
  };

  const copyLink = () => {
    const url = `${window.location.origin}/track-order?order=${order.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Order link copied!');
  };

  const shareOrder = async () => {
    const url = `${window.location.origin}/track-order?order=${order.id}`;
    const text = `Order ${order.order_number} — ${formatCurrency(order.total_amount)} — ${order.customer_name}`;
    if (navigator.share) {
      try { await navigator.share({ title: `Order ${order.order_number}`, text, url }); } catch {}
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`, '_blank');
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading order...</div>;
  if (!order) return <div className="p-10 text-center font-bold text-gray-700">Order not found</div>;

  const action = NEXT_ACTION[order.status];
  const waLink = `https://wa.me/${(order.customer_phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `Hello ${order.customer_name}! 😊 Your order ${order.order_number} (₦${Number(order.total_amount).toLocaleString()}) is confirmed and being processed. Tracking: ${order.tracking_number}. We will update you when it's out for delivery. — ${order.merchants?.store_name || 'Our store'}`
  )}`;

  const digitalFiles = (order.order_items || [])
    .filter((i: any) => i.products?.is_digital && i.products?.digital_file_url)
    .map((i: any) => ({ name: i.products.digital_file_name || i.product_name, url: i.products.digital_file_url }));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <Link href="/dashboard/orders" className="text-sm text-purple-600 hover:underline mb-1 inline-block">← Back to Orders</Link>
          <h1 className="text-2xl font-bold">Order {order.order_number}</h1>
          <p className="text-gray-600 text-sm">{formatDate(order.created_at)} • {order.merchants?.store_name}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {action && (
            <button onClick={advance} disabled={updating} className="px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 disabled:opacity-50">
              {updating ? '...' : action.label}
            </button>
          )}
          <a href={waLink} target="_blank" rel="noopener" className="px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700">
            💬 WhatsApp
          </a>
          <button onClick={() => downloadReceipt(order)} className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800">
            📥 Receipt
          </button>
        </div>
      </div>

      {/* Share Row */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={copyLink} className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl text-xs font-bold hover:bg-purple-200">
          🔗 Copy Order Link
        </button>
        <button onClick={shareOrder} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-200">
          📤 Share Order
        </button>
      </div>

      <div className={`rounded-xl p-4 text-sm font-bold text-center ${
        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
        order.status === 'processing' ? 'bg-purple-100 text-purple-800' : 'bg-yellow-100 text-yellow-800'
      }`}>
        {order.status === 'pending' && '⏳ Awaiting processing — customer sees "Processing"'}
        {order.status === 'processing' && '👨‍ You are preparing this order — customer sees "Processing"'}
        {order.status === 'shipped' && '🚚 Ready for delivery — customer sees "Processed, ready for delivery"'}
        {order.status === 'delivered' && '✅ Delivered — customer sees "Delivered"'}
      </div>

      {/* Digital Files Section */}
      {digitalFiles.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 space-y-3">
          <h2 className="font-bold text-blue-900">⚡ Digital Files (auto-delivered to customer)</h2>
          {digitalFiles.map((f: any, i: number) => (
            <a key={i} href={f.url} target="_blank" rel="noopener" className="flex items-center justify-between bg-white border border-blue-200 rounded-xl px-4 py-3 hover:bg-blue-50">
              <span className="text-sm font-bold text-gray-900 truncate">📄 {f.name}</span>
              <span className="text-xs font-bold text-blue-600 shrink-0 ml-2">Download</span>
            </a>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border p-6 space-y-2">
          <h2 className="text-lg font-bold mb-2">👤 Customer</h2>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Name</span><span className="font-bold">{order.customer_name}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Email</span><span className="font-bold truncate ml-2">{order.customer_email}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Phone</span><span className="font-bold">{order.customer_phone}</span></div>
        </div>

        <div className="bg-white rounded-2xl border p-6 space-y-2">
          <h2 className="text-lg font-bold mb-2">💳 Payment</h2>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Status</span><span className={`font-bold ${order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>{(order.payment_status || '').toUpperCase()}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Reference</span><span className="font-mono text-xs break-all text-right">{order.payment_intent_id || 'N/A'}</span></div>
          <div className="flex justify-between text-sm border-t pt-2"><span className="font-bold">Total</span><span className="font-extrabold">{formatCurrency(order.total_amount)}</span></div>
        </div>

        <div className="bg-white rounded-2xl border p-6 space-y-2 md:col-span-2">
          <h2 className="text-lg font-bold mb-2">🚚 Delivery</h2>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Tracking Number</span><span className="font-mono font-bold">{order.tracking_number}</span></div>
          {order.shipping_address ? (
            <>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Address</span><span className="font-bold text-right max-w-[65%]">{order.shipping_address.address_line1}, {order.shipping_address.city}, {order.shipping_address.state}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Shipping Fee</span><span className="font-bold">{formatCurrency(order.shipping_cost)}</span></div>
            </>
          ) : (
            <p className="text-sm text-gray-500 italic">Digital product or customer pickup — no delivery address.</p>
          )}
        </div>

        <div className="bg-white rounded-2xl border p-6 space-y-3 md:col-span-2">
          <h2 className="text-lg font-bold">📦 Items ({order.order_items?.length || 0})</h2>
          {order.order_items?.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-bold text-gray-900 text-sm">{item.product_name}</p>
                <p className="text-xs text-gray-500">Qty {item.quantity} × {formatCurrency(item.unit_price)}</p>
              </div>
              <p className="font-bold text-sm">{formatCurrency(item.total_price)}</p>
            </div>
          ))}
          <div className="border-t pt-3 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-bold">{formatCurrency(order.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span className="font-bold">{formatCurrency(order.shipping_cost)}</span></div>
            <div className="flex justify-between text-base border-t pt-2"><span className="font-extrabold">Total</span><span className="font-extrabold">{formatCurrency(order.total_amount)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}