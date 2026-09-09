'use client';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';

function buildReceiptHtml(o: any): string {
  const items = (o.order_items || [])
    .map((i: any) => `<tr><td style="padding:8px;border-bottom:1px solid #eee">${i.product_name} × ${i.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">₦${Number(i.total_price).toLocaleString()}</td></tr>`)
    .join('');
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Receipt ${o.order_number}</title></head>
<body style="font-family:Arial,sans-serif;background:#f4f4f7;padding:24px">
<div style="max-width:520px;margin:auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08)">
<div style="background:#7c3aed;color:#fff;padding:24px;text-align:center">
<h1 style="margin:0;font-size:22px">🎉 Payment Successful</h1>
<p style="margin:6px 0 0;opacity:.9;font-size:13px">${o.store_name || 'OrizzonCart Store'} • ${formatDate(o.created_at)}</p>
</div>
<div style="padding:24px">
<p style="text-align:center;font-size:30px;font-weight:800;margin:0 0 16px">${formatCurrency(o.total_amount)}</p>
<table style="width:100%;font-size:14px;border-collapse:collapse">
<tr><td style="padding:6px 8px;color:#666">Order Number</td><td style="padding:6px 8px;text-align:right;font-weight:700">${o.order_number}</td></tr>
<tr><td style="padding:6px 8px;color:#666">Tracking Number</td><td style="padding:6px 8px;text-align:right;font-weight:700">${o.tracking_number}</td></tr>
<tr><td style="padding:6px 8px;color:#666">Payment Status</td><td style="padding:6px 8px;text-align:right;font-weight:700;color:#16a34a">${(o.payment_status || '').toUpperCase()}</td></tr>
<tr><td style="padding:6px 8px;color:#666">Customer</td><td style="padding:6px 8px;text-align:right;font-weight:700">${o.customer_name}</td></tr>
</table>
<h3 style="margin:20px 0 8px;font-size:14px">Items</h3>
<table style="width:100%;font-size:14px;border-collapse:collapse">${items}</table>
<table style="width:100%;font-size:14px;margin-top:12px">
<tr><td style="padding:4px 8px;color:#666">Subtotal</td><td style="text-align:right">₦${Number(o.subtotal).toLocaleString()}</td></tr>
<tr><td style="padding:4px 8px;color:#666">Shipping</td><td style="text-align:right">₦${Number(o.shipping_cost).toLocaleString()}</td></tr>
<tr><td style="padding:4px 8px;font-weight:800">Total</td><td style="text-align:right;font-weight:800">₦${Number(o.total_amount).toLocaleString()}</td></tr>
</table>
<p style="margin-top:20px;font-size:11px;color:#999;text-align:center">Powered by OrizzonCart • OrizzonS Inc.</p>
</div></div></body></html>`;
}

function SuccessContent() {
  const params = useSearchParams();
  const orderId = params.get('order');
  const [order, setOrder] = useState<any>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const downloaded = useRef(false);

  const download = (o: any) => {
    try {
      const blob = new Blob([buildReceiptHtml(o)], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Receipt-${o.order_number}.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {}
  };

  useEffect(() => {
    const load = async () => {
      if (!orderId) { setState('error'); return; }
      try {
        const res = await fetch(`/api/orders/receipt?order=${orderId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setOrder(data.order);
        setState('ready');
        // AUTO-DOWNLOAD once when payment is confirmed
        if (data.order.payment_status === 'paid' && !downloaded.current) {
          downloaded.current = true;
          setTimeout(() => download(data.order), 1200);
        }
      } catch {
        setState('error');
      }
    };
    load();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-4">
        {state === 'loading' && (
          <>
            <div className="w-16 h-16 mx-auto border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
            <h1 className="text-xl font-extrabold">Confirming your payment...</h1>
          </>
        )}

        {state === 'error' && (
          <>
            <span className="text-6xl">❌</span>
            <h1 className="text-xl font-extrabold">Receipt not found</h1>
            <Link href="/" className="block w-full bg-gray-900 text-white py-3 rounded-xl font-bold">Go Home</Link>
          </>
        )}

        {state === 'ready' && order && (
          <>
            <span className="text-6xl">{order.payment_status === 'paid' ? '🎉' : '⏳'}</span>
            <h1 className="text-2xl font-extrabold text-gray-900">
              {order.payment_status === 'paid' ? 'Payment Successful!' : 'Processing...'}
            </h1>
            <p className="text-gray-600 text-sm">
              {order.payment_status === 'paid'
                ? `Thank you for shopping at ${order.store_name}. Your receipt is downloading automatically 📥`
                : 'We are confirming your payment with the bank.'}
            </p>

            <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Store</span><span className="font-bold">{order.store_name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Order Number</span><span className="font-mono font-bold">{order.order_number}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Tracking Number</span><span className="font-mono font-bold">{order.tracking_number}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Items</span><span className="font-bold">{order.order_items?.length || 0}</span></div>
              <div className="flex justify-between border-t pt-2"><span className="font-bold text-gray-800">Total</span><span className="font-extrabold">{formatCurrency(order.total_amount)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Payment</span><span className={`font-bold uppercase ${order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>{order.payment_status}</span></div>
            </div>

            <button onClick={() => download(order)} className="block w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700">
              📥 Download Receipt Again
            </button>
            {order.store_slug && (
              <Link href={`/store/${order.store_slug}`} className="block w-full bg-gray-100 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-200">
                Back to Store
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}