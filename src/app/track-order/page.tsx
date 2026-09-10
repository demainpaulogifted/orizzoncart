'use client';
import { useState } from 'react';
import { formatCurrency, formatDate } from '@/lib/utils';

const STEPS = [
  { key: 'pending', label: 'Order Placed', msg: 'We received your order successfully.' },
  { key: 'processing', label: 'Processing', msg: 'The merchant is preparing your order.' },
  { key: 'shipped', label: 'Ready for Delivery', msg: 'Your order is processed and ready for delivery! 🚚' },
  { key: 'delivered', label: 'Delivered', msg: 'Delivered! Enjoy your purchase 💚' },
];

export default function TrackOrderPage() {
  const [code, setCode] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'found' | 'notfound'>('idle');
  const [order, setOrder] = useState<any>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('loading');
    try {
      const res = await fetch(`/api/orders/track?code=${encodeURIComponent(code)}`);
      if (res.status === 404) {
        setState('notfound');
        setOrder(null);
        return;
      }
      const data = await res.json();
      setOrder(data.order);
      setState('found');
    } catch {
      setState('notfound');
    }
  };

  const currentIndex = order ? STEPS.findIndex((s) => s.key === order.status) : -1;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="text-center">
          <span className="text-5xl">📦</span>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-3">Track Your Order</h1>
          <p className="text-gray-600 text-sm mt-1">Enter your order number (ORD-...) or tracking number (TRK-...)</p>
        </div>

        <form onSubmit={handleTrack} className="flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="ORD-MTTVS8PXX1LU or TRK-A1B2C3"
            className="flex-1 px-4 py-3.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm uppercase"
          />
          <button type="submit" disabled={state === 'loading' || !code.trim()} className="px-6 py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50">
            {state === 'loading' ? '...' : 'Track'}
          </button>
        </form>

        {state === 'notfound' && (
          <div className="bg-red-100 border border-red-300 text-red-800 rounded-xl p-5 text-center font-bold text-sm">
            ❌ This order number doesn't exist. Please check it and try again.
          </div>
        )}

        {state === 'found' && order && (
          <div className="bg-white rounded-2xl border p-6 space-y-5">
            <div className="text-center">
              <p className="text-xs text-gray-500">{order.merchants?.store_name}</p>
              <p className="font-mono font-bold text-gray-900">{order.order_number}</p>
              <p className="text-xs text-gray-500 mt-1">Placed {formatDate(order.created_at)} • {formatCurrency(order.total_amount)}</p>
            </div>

            <div className="space-y-0">
              {STEPS.map((step, i) => {
                const done = i <= currentIndex;
                const current = i === currentIndex;
                return (
                  <div key={step.key} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                        done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                      } ${current ? 'ring-4 ring-green-200' : ''}`}>
                        {done ? '✓' : i + 1}
                      </span>
                      {i < STEPS.length - 1 && <span className={`w-0.5 h-8 ${i < currentIndex ? 'bg-green-500' : 'bg-gray-200'}`} />}
                    </div>
                    <div className="pb-6">
                      <p className={`font-bold text-sm ${done ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                      {current && <p className="text-xs text-green-700 font-semibold mt-0.5">{step.msg}</p>}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-gray-50 rounded-xl p-4 text-xs space-y-1">
              <p className="font-bold text-gray-700 mb-1">Items:</p>
              {order.order_items?.map((i: any, x: number) => (
                <p key={x} className="text-gray-600">• {i.product_name} × {i.quantity}</p>
              ))}
              <p className="pt-2 text-gray-500">Tracking number: <span className="font-mono font-bold">{order.tracking_number}</span></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}