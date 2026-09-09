'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';

const TYPE_LABELS: Record<string, string> = {
  payment_activation: 'Store Activation Fee',
  theme_purchase: 'Premium Theme Purchase',
  maintenance_payment: 'Store Maintenance Plan',
};

function VerifyContent() {
  const params = useSearchParams();
  const reference = params.get('reference');
  const [state, setState] = useState<'loading' | 'paid' | 'pending' | 'error'>('loading');
  const [tx, setTx] = useState<any>(null);
  const [tries, setTries] = useState(0);

  const verify = async () => {
    if (!reference) { setState('error'); return; }
    try {
      const res = await fetch(`/api/payments/platform/verify?reference=${reference}`);
      const data = await res.json();
      if (!res.ok) { setState('error'); return; }
      setTx(data.transaction);
      if (data.transaction.status === 'paid') setState('paid');
      else setState('pending');
    } catch {
      setState('error');
    }
  };

  useEffect(() => {
    verify();
    const interval = setInterval(() => {
      setTries((t) => {
        if (t >= 10) { clearInterval(interval); return t; }
        verify();
        return t + 1;
      });
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const nextLink =
    tx?.transaction_type === 'theme_purchase' ? '/dashboard/settings/theme' :
    tx?.transaction_type === 'maintenance_payment' ? '/dashboard/settings/plans' :
    '/dashboard/settings/payment';

  const nextLabel =
    tx?.transaction_type === 'theme_purchase' ? 'View My New Theme' :
    tx?.transaction_type === 'maintenance_payment' ? 'View My Plan' :
    'Complete Step 2 — Connect Keys';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-5">
        {state === 'loading' && (
          <>
            <div className="w-16 h-16 mx-auto border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
            <h1 className="text-xl font-extrabold">Verifying your payment...</h1>
            <p className="text-sm text-gray-500">Please don't close this page.</p>
          </>
        )}

        {state === 'pending' && (
          <>
            <span className="text-6xl">⏳</span>
            <h1 className="text-xl font-extrabold">Confirming with your bank...</h1>
            <p className="text-sm text-gray-500">We're double-checking with Paystack. This usually takes a few seconds.</p>
            <button onClick={verify} className="text-sm font-bold text-purple-600 underline">Check again now</button>
          </>
        )}

        {state === 'error' && (
          <>
            <span className="text-6xl">❌</span>
            <h1 className="text-xl font-extrabold">We couldn't verify this payment</h1>
            <p className="text-sm text-gray-500">If money left your account, contact support with your receipt — we'll fix it manually.</p>
            <Link href="/dashboard/support" className="block w-full bg-gray-900 text-white py-3 rounded-xl font-bold">Contact Support</Link>
          </>
        )}

        {state === 'paid' && tx && (
          <>
            <span className="text-6xl">🎉</span>
            <h1 className="text-2xl font-extrabold text-green-600">Payment Confirmed!</h1>
            <p className="text-sm text-gray-600">Your payment was received successfully. Here is your receipt:</p>

            <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Description</span><span className="font-bold">{TYPE_LABELS[tx.transaction_type] || tx.transaction_type}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="font-extrabold">{formatCurrency(tx.amount)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Reference</span><span className="font-mono text-xs">{tx.payment_reference}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="font-bold">{formatDate(tx.created_at || new Date())}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="font-bold text-green-600 uppercase">Paid</span></div>
            </div>

            <Link href={nextLink} className="block w-full bg-purple-600 text-white py-3.5 rounded-xl font-bold hover:bg-purple-700">
              {nextLabel} →
            </Link>
            <Link href="/dashboard" className="block w-full bg-gray-100 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-200">
              Go to Dashboard
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentVerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}