'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function TrackOrderPage() {
  const [email, setEmail] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setOrder(null);

    const supabase = createClient();
    const { data, error } = await supabase
      .from('orders')
      .select('*, merchant:merchants(store_name, whatsapp_number, contact_email)')
      .eq('tracking_number', trackingNumber)
      .eq('customer_email', email)
      .single();

    if (error || !data) {
      setError('Order not found. Please check your email and tracking number.');
    } else {
      setOrder(data);
    }
    setIsLoading(false);
  };

  const getStatusColor = (status: string) => {
    const colors: any = { pending: 'bg-yellow-500', paid: 'bg-blue-500', shipped: 'bg-purple-500', delivered: 'bg-green-500' };
    return colors[status] || 'bg-gray-400';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 font-display">Track Your Order</h1>
          <p className="text-gray-600 mt-2">Enter your details below to see the status of your purchase.</p>
        </div>

        <form onSubmit={handleTrack} className="bg-white p-8 rounded-2xl shadow-lg border space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tracking Number</label>
            <input type="text" required value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="ORD-XXXXXX" />
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50">
            {isLoading ? 'Tracking...' : 'Track Order'}
          </button>
        </form>

        {error && <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg text-center">{error}</div>}

        {order && (
          <div className="mt-8 bg-white p-8 rounded-2xl shadow-lg border animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-start border-b pb-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Order #{order.order_number}</h2>
                <p className="text-sm text-gray-500">Placed on {formatDate(order.created_at)}</p>
              </div>
              <span className={`px-4 py-2 rounded-full text-white font-bold text-sm uppercase ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>

            {/* Progress Timeline */}
            <div className="flex justify-between mb-8">
              {['pending', 'paid', 'shipped', 'delivered'].map((step, i) => (
                <div key={step} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${order.status === step || ['pending','paid','shipped','delivered'].indexOf(order.status) >= i ? 'bg-green-500' : 'bg-gray-300'}`}>
                    {['pending','paid','shipped','delivered'].indexOf(order.status) >= i ? '✓' : i + 1}
                  </div>
                  <p className="text-xs mt-2 capitalize text-gray-600">{step}</p>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Total Amount</span>
                <span className="font-bold text-xl">{formatCurrency(order.total_amount)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Store</span>
                <span className="font-medium">{order.merchant?.store_name}</span>
              </div>
              {order.merchant?.whatsapp_number && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Store WhatsApp</span>
                  <a href={`https://wa.me/${order.merchant.whatsapp_number}`} className="font-medium text-green-600 hover:underline">{order.merchant.whatsapp_number}</a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}