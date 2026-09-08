import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default async function CheckoutSuccessPage({ searchParams }: any) {
  const params = await searchParams;
  const admin = createAdminClient();
  const { data: order } = params?.order
    ? await admin.from('orders').select('*').eq('id', params.order).maybeSingle()
    : { data: null };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-4">
        <span className="text-6xl">🎉</span>
        <h1 className="text-2xl font-extrabold text-gray-900">Order Placed!</h1>
        <p className="text-gray-600 text-sm">Thank you for your purchase. The merchant has been notified.</p>

        {order && (
          <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Order Number</span><span className="font-mono font-bold">{order.order_number}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Tracking Number</span><span className="font-mono font-bold">{order.tracking_number}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Total Paid</span><span className="font-extrabold">{formatCurrency(order.total_amount)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Payment</span><span className="font-bold text-green-600 uppercase">{order.payment_status}</span></div>
          </div>
        )}

        <p className="text-xs text-gray-500">Save your tracking number to follow your delivery anytime.</p>
        <Link href="/track-order" className="block w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800">Track My Order</Link>
      </div>
    </div>
  );
}