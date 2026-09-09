import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default async function CheckoutSuccessPage({ searchParams }: any) {
  const params = await searchParams;
  const admin = createAdminClient();

  let order = params?.order
    ? (await admin.from('orders').select('*, order_items(*), merchants(store_name, store_slug, preferred_gateway, paystack_secret_key, flutterwave_secret_key)').eq('id', params.order).maybeSingle()).data
    : null;

  // Self-verify with Paystack if not yet marked paid (works even without webhooks)
  if (order && order.payment_status !== 'paid' && order.payment_intent_id) {
    const secret = order.merchants?.preferred_gateway === 'paystack' ? order.merchants.paystack_secret_key : order.merchants?.flutterwave_secret_key;
    if (secret) {
      try {
        const res = await fetch(`https://api.paystack.co/transaction/verify/${order.payment_intent_id}`, {
          headers: { Authorization: `Bearer ${secret}` },
        });
        const ps = await res.json();
        if (ps.status && ps.data?.status === 'success') {
          await admin.from('orders').update({ payment_status: 'paid', status: 'processing', payment_method: order.merchants.preferred_gateway }).eq('id', order.id);
          order = { ...order, payment_status: 'paid', status: 'processing' };
        }
      } catch {}
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-4">
        {order?.payment_status === 'paid' ? <span className="text-6xl">🎉</span> : <span className="text-6xl">⏳</span>}
        <h1 className="text-2xl font-extrabold text-gray-900">
          {order?.payment_status === 'paid' ? 'Payment Successful!' : 'Processing your payment...'}
        </h1>
        <p className="text-gray-600 text-sm">
          {order?.payment_status === 'paid'
            ? `Thank you for shopping at ${order?.merchants?.store_name}. Your receipt is below.`
            : 'We are confirming your payment with the bank. Please keep this page open or check back shortly.'}
        </p>

        {order && (
          <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Store</span><span className="font-bold">{order.merchants?.store_name}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Order Number</span><span className="font-mono font-bold">{order.order_number}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Tracking Number</span><span className="font-mono font-bold">{order.tracking_number}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Items</span><span className="font-bold">{order.order_items?.length || 0}</span></div>
            <div className="flex justify-between border-t pt-2"><span className="font-bold text-gray-800">Total</span><span className="font-extrabold">{formatCurrency(order.total_amount)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Payment</span><span className={`font-bold uppercase ${order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>{order.payment_status}</span></div>
          </div>
        )}

        <p className="text-xs text-gray-500">Save your tracking number to follow your delivery anytime.</p>
        <Link href="/track-order" className="block w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800">Track My Order</Link>
        {order?.merchants?.store_slug && (
          <Link href={`/store/${order.merchants.store_slug}`} className="block w-full bg-gray-100 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-200">Back to Store</Link>
        )}
      </div>
    </div>
  );
}