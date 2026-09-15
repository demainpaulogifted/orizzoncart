'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order');
  const reference = searchParams.get('reference');
  const [info, setInfo] = useState<any>(null);

  useEffect(() => {
    if (!orderId) return;
    const load = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}/public?ref=${reference || ''}`);
        if (res.ok) setInfo(await res.json());
      } catch {}
    };
    load();
  }, [orderId, reference]);

  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 font-bold">Order not found</p>
      </div>
    );
  }

  if (!info) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Confirming your order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-8 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">Thank you for your purchase from {info.store_name}</p>

        <div className="bg-gray-50 rounded-2xl p-6 mb-6 text-left">
          <p className="text-sm font-bold text-gray-500 uppercase mb-3">Order #{info.order_number}</p>
          <div className="space-y-2">
            {info.items?.map((item: any, i: number) => (
              <div key={i} className="flex justify-between">
                <span className="text-gray-700">{item.name} × {item.quantity}</span>
                <span className="font-bold">₦{Number(item.total).toLocaleString()}</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2 flex justify-between font-extrabold text-lg">
              <span>Total</span>
              <span>₦{Number(info.total_amount).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {info.digital_files?.length > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 mb-6 text-left">
            <p className="font-bold text-purple-900 mb-3">⚡ Your Digital Products — Download Now:</p>
            <div className="space-y-2">
              {info.digital_files.map((f: any, i: number) => (
                <a
                  key={i}
                  href={f.url}
                  target="_blank"
                  rel="noopener"
                  className="flex items-center justify-between bg-purple-600 text-white py-3 px-4 rounded-xl font-bold hover:bg-purple-700"
                >
                  <span className="truncate">📄 {f.name}</span>
                  <span className="text-xs shrink-0 ml-2">DOWNLOAD ↓</span>
                </a>
              ))}
            </div>
            <p className="text-xs text-purple-700 mt-3">💡 Bookmark this page — your downloads stay available here.</p>
          </div>
        )}

        <div className="space-y-3">
          <Link
            href={`/track-order?order=${orderId}`}
            className="block bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-gray-800"
          >
            📦 Track Your Order
          </Link>
          <Link href="/" className="block text-purple-600 font-bold hover:underline">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}