'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function DropshippingOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState('');

  useEffect(() => {
    fetchDropshipOrders();
  }, []);

  async function fetchDropshipOrders() {
    setLoading(true);
    try {
      const res = await fetch('/api/dropshipping/orders');
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function syncTracking(orderId: string) {
    setSyncing(orderId);
    try {
      const res = await fetch('/api/dropshipping/sync-tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      toast.success('✅ Tracking synced!');
      fetchDropshipOrders();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSyncing('');
    }
  }

  async function fulfillManually(orderId: string) {
    if (!confirm('Manually forward this order to the supplier?')) return;

    try {
      const res = await fetch('/api/dropshipping/fulfill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      toast.success('✅ Order forwarded to supplier!');
      fetchDropshipOrders();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  const statusColors: any = {
    pending: 'bg-yellow-100 text-yellow-800',
    forwarded_to_supplier: 'bg-blue-100 text-blue-800',
    supplier_confirmed: 'bg-indigo-100 text-indigo-800',
    shipped: 'bg-green-100 text-green-800',
    delivered: 'bg-emerald-100 text-emerald-800',
    failed: 'bg-red-100 text-red-800',
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard/orders" className="text-purple-600 text-sm hover:underline">
          ← Back to All Orders
        </Link>
        <h1 className="text-2xl font-bold mt-2">📦 Dropshipping Orders</h1>
        <p className="text-gray-500 text-sm mt-1">
          Orders with products sourced from suppliers (CJ, Alibaba, etc.)
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white border rounded-xl p-10 text-center">
          <p className="text-gray-500">No dropshipping orders yet</p>
          <p className="text-sm text-gray-400 mt-2">
            Orders with supplier products will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">Order #{order.order_number}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.created_at).toLocaleString()} • {order.customer_name}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    statusColors[order.supplier_fulfillment_status] || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {order.supplier_fulfillment_status.replace(/_/g, ' ').toUpperCase()}
                </span>
              </div>

              <div className="text-sm text-gray-600">
                <p>
                  <strong>Customer:</strong> {order.customer_email} • {order.customer_phone}
                </p>
                <p>
                  <strong>Shipping to:</strong> {order.shipping_address}, {order.shipping_city},{' '}
                  {order.shipping_state}
                </p>
              </div>

              {order.supplier_tracking_number && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs font-bold text-green-800 mb-1">Tracking Number</p>
                  <p className="text-sm font-mono font-bold text-green-900">
                    {order.supplier_tracking_number}
                  </p>
                  {order.supplier_tracking_url && (
                    <a
                      href={order.supplier_tracking_url}
                      target="_blank"
                      className="text-xs text-green-700 hover:underline mt-1 inline-block"
                    >
                      Track Package →
                    </a>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                {order.supplier_fulfillment_status === 'pending' && (
                  <button
                    onClick={() => fulfillManually(order.id)}
                    className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700"
                  >
                    🚀 Forward to Supplier
                  </button>
                )}
                {(order.supplier_fulfillment_status === 'forwarded_to_supplier' ||
                  order.supplier_fulfillment_status === 'supplier_confirmed') && (
                  <button
                    onClick={() => syncTracking(order.id)}
                    disabled={syncing === order.id}
                    className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {syncing === order.id ? 'Syncing...' : '🔄 Sync Tracking'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}