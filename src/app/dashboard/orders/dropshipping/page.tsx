'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function DropshippingOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState('');
  const [paying, setPaying] = useState('');

  useEffect(() => {
    fetchDropshipOrders();
  }, []);

  async function fetchDropshipOrders() {
    setLoading(true);
    try {
      const res = await fetch('/api/dropshipping/orders');
      const data = await res.json();
      
      // Fetch order items to calculate profit
      const ordersWithProfit = await Promise.all(
        (data.orders || []).map(async (order: any) => {
          const itemsRes = await fetch(`/api/dropshipping/order-items?orderId=${order.id}`);
          const itemsData = await itemsRes.json();
          
          let totalCost = 0;
          for (const item of itemsData.items || []) {
            totalCost += (item.supplier_cost || 0) * item.quantity;
            totalCost += (item.supplier_shipping_cost || 0) * item.quantity;
          }
          
          const profit = order.total_amount - totalCost;
          
          return {
            ...order,
            supplier_cost: totalCost,
            profit_amount: profit,
          };
        })
      );
      
      setOrders(ordersWithProfit);
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

  async function markSupplierPaid(orderId: string, profitAmount: number) {
    if (!confirm(`Mark this order as paid to supplier?\n\nYou keep ₦${profitAmount.toLocaleString()} profit.`)) return;

    setPaying(orderId);
    try {
      const res = await fetch('/api/dropshipping/mark-paid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      toast.success(`✅ Marked as paid! You earned ₦${profitAmount.toLocaleString()} profit.`);
      fetchDropshipOrders();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setPaying('');
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

  // Calculate totals
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const totalCost = orders.reduce((sum, o) => sum + (o.supplier_cost || 0), 0);
  const totalProfit = orders.reduce((sum, o) => sum + (o.profit_amount || 0), 0);

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

      {/* Profit Summary Cards */}
      {!loading && orders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border rounded-xl p-4">
            <p className="text-xs font-bold text-gray-500 uppercase">Total Revenue</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-1">
              ₦{totalRevenue.toLocaleString()}
            </p>
            <p className="text-[10px] text-gray-400 mt-1">From {orders.length} orders</p>
          </div>
          <div className="bg-white border rounded-xl p-4">
            <p className="text-xs font-bold text-gray-500 uppercase">Supplier Costs</p>
            <p className="text-2xl font-extrabold text-red-600 mt-1">
              ₦{totalCost.toLocaleString()}
            </p>
            <p className="text-[10px] text-gray-400 mt-1">Paid to CJ/Alibaba</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
            <p className="text-xs font-bold text-green-700 uppercase">Your Profit</p>
            <p className="text-2xl font-extrabold text-green-700 mt-1">
              ₦{totalProfit.toLocaleString()}
            </p>
            <p className="text-[10px] text-green-600 mt-1">
              {totalRevenue > 0 ? `${Math.round((totalProfit / totalRevenue) * 100)}% margin` : '0% margin'}
            </p>
          </div>
        </div>
      )}

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

              {/* Profit Breakdown */}
              <div className="bg-gray-50 border rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Customer paid:</span>
                  <span className="font-bold">₦{order.total_amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Supplier cost:</span>
                  <span className="font-bold text-red-600">- ₦{order.supplier_cost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm border-t pt-2">
                  <span className="font-bold text-green-700">Your profit:</span>
                  <span className="font-extrabold text-green-700">₦{order.profit_amount.toLocaleString()}</span>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p>
                  <strong>Customer:</strong> {order.customer_email} • {order.customer_phone}
                </p>
                <p>
                  <strong>Shipping to:</strong> {order.shipping_address?.address_line1}, {order.shipping_address?.city},{' '}
                  {order.shipping_address?.state}
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

              <div className="flex gap-2 flex-wrap">
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
                {order.supplier_fulfillment_status === 'shipped' && !order.supplier_paid && (
                  <button
                    onClick={() => markSupplierPaid(order.id, order.profit_amount)}
                    disabled={paying === order.id}
                    className="px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {paying === order.id ? 'Processing...' : `💰 Mark Supplier Paid (Keep ₦${order.profit_amount.toLocaleString()})`}
                  </button>
                )}
                {order.supplier_paid && (
                  <span className="px-4 py-2 bg-green-100 text-green-800 text-xs font-bold rounded-lg">
                    ✅ Supplier Paid • Profit Earned
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}