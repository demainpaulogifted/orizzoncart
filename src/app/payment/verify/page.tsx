
'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { formatCurrency as formatLocalCurrency } from '@/lib/format-currency';

const TYPE_LABELS: Record<string, string> = {
  payment_activation: 'Store Activation Fee',
  theme_purchase: 'Premium Theme Purchase',
  maintenance_payment: 'Store Maintenance Plan',
};

function VerifyContent() {
  const params = useSearchParams();
  const reference = params.get('reference');
  const paymentError = params.get('payment_error');

  const [state, setState] = useState<'loading' | 'paid' | 'pending' | 'error'>(
    paymentError ? 'pending' : 'loading'
  );
  const [tx, setTx] = useState<any>(null);
  const [tries, setTries] = useState(0);
  const [checking, setChecking] = useState(false);

  const verify = useCallback(async () => {
    if (!reference) {
      setState('error');
      return;
    }

    if (checking) return;

    setChecking(true);

    try {
      const res = await fetch(
        `/api/payments/platform/verify?reference=${encodeURIComponent(reference)}`,
        { cache: 'no-store' }
      );

      const data = await res.json();

      if (!res.ok || !data.transaction) {
        setState('error');
        return;
      }

      setTx(data.transaction);

      if (data.transaction.status === 'paid') {
        setState('paid');
      } else {
        setState('pending');
      }
    } catch {
      setState('error');
    } finally {
      setChecking(false);
    }
  }, [reference, checking]);

  useEffect(() => {
    if (!reference) {
      setState('error');
      return;
    }

    let active = true;
    let attempts = 0;

    const runVerification = async () => {
      if (!active) return;

      try {
        const res = await fetch(
          `/api/payments/platform/verify?reference=${encodeURIComponent(reference)}`,
          { cache: 'no-store' }
        );

        const data = await res.json();

        if (!active) return;

        if (!res.ok || !data.transaction) {
          setState('error');
          return;
        }

        setTx(data.transaction);

        if (data.transaction.status === 'paid') {
          setState('paid');
        } else {
          setState('pending');
        }
      } catch {
        if (active) setState('error');
      }
    };

    runVerification();

    const interval = setInterval(() => {
      if (attempts >= 10) {
        clearInterval(interval);
        return;
      }

      attempts += 1;
      setTries(attempts);
      runVerification();
    }, 6000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [reference]);

  const currencyCode = String(
    tx?.currency_code || tx?.currency || 'NGN'
  ).toUpperCase();

  const gateway = String(
    tx?.metadata?.activation_gateway ||
    tx?.metadata?.gateway ||
    'paystack'
  ).toLowerCase();

  const gatewayLabel =
    gateway === 'paypal'
      ? 'PayPal'
      : gateway === 'stripe'
        ? 'Stripe'
        : 'Paystack';

  const nextLink =
    tx?.transaction_type === 'theme_purchase'
      ? '/dashboard/settings/theme'
      : tx?.transaction_type === 'maintenance_payment'
        ? '/dashboard/settings/plans'
        : '/dashboard/settings/payment';

  const nextLabel =
    tx?.transaction_type === 'theme_purchase'
      ? 'View My New Theme'
      : tx?.transaction_type === 'maintenance_payment'
        ? 'View My Plan'
        : 'Complete Step 2 — Connect Keys';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-5">

        {state === 'loading' && (
          <>
            <div className="w-16 h-16 mx-auto border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
            <h1 className="text-xl font-extrabold">
              Verifying your payment...
            </h1>
            <p className="text-sm text-gray-500">
              Please don't close this page.
            </p>
          </>
        )}

        {state === 'pending' && (
          <>
            <span className="text-6xl">⏳</span>
            <h1 className="text-xl font-extrabold">
              Confirming your payment...
            </h1>

            <p className="text-sm text-gray-500">
              We're waiting for confirmation from {gatewayLabel}.
              This page will continue checking your transaction.
            </p>

            {paymentError && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-left">
                <p className="text-sm font-bold text-amber-800">
                  Additional payment information
                </p>
                <p className="text-sm text-amber-700 mt-1 break-words">
                  {paymentError}
                </p>
              </div>
            )}

            <p className="text-xs text-gray-400">
              Automatic checks: {tries} / 10
            </p>

            <button
              onClick={verify}
              disabled={checking}
              className="text-sm font-bold text-purple-600 underline disabled:opacity-50"
            >
              {checking ? 'Checking...' : 'Check again now'}
            </button>

            <Link
              href="/dashboard/support"
              className="block text-sm font-semibold text-gray-600 underline"
            >
              Contact Support
            </Link>
          </>
        )}

        {state === 'error' && (
          <>
            <span className="text-6xl">❌</span>
            <h1 className="text-xl font-extrabold">
              We couldn't verify this payment
            </h1>
            <p className="text-sm text-gray-500">
              {paymentError ||
                'If money left your account, contact support with your payment reference. We will help investigate the transaction.'}
            </p>

            {reference && (
              <div className="rounded-lg bg-gray-50 border p-3 text-left">
                <p className="text-xs text-gray-500">Payment reference</p>
                <p className="font-mono text-xs break-all mt-1">
                  {reference}
                </p>
              </div>
            )}

            <button
              onClick={verify}
              disabled={checking}
              className="block w-full bg-purple-600 text-white py-3 rounded-xl font-bold disabled:opacity-50"
            >
              {checking ? 'Checking...' : 'Try Verification Again'}
            </button>

            <Link
              href="/dashboard/support"
              className="block w-full bg-gray-900 text-white py-3 rounded-xl font-bold"
            >
              Contact Support
            </Link>
          </>
        )}

        {state === 'paid' && tx && (
          <>
            <span className="text-6xl">🎉</span>

            <h1 className="text-2xl font-extrabold text-green-600">
              Payment Confirmed!
            </h1>

            <p className="text-sm text-gray-600">
              Your payment was received successfully. Here is your receipt:
            </p>

            <div className="bg-gray-50 rounded-xl p-4 text-left space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Description</span>
                <span className="font-bold text-right">
                  {TYPE_LABELS[tx.transaction_type] || tx.transaction_type}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Amount</span>
                <span className="font-extrabold text-right">
                  {formatLocalCurrency(tx.amount, currencyCode)}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Currency</span>
                <span className="font-bold">{currencyCode}</span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Payment Gateway</span>
                <span className="font-bold">{gatewayLabel}</span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Reference</span>
                <span className="font-mono text-xs text-right break-all">
                  {tx.payment_reference}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Date</span>
                <span className="font-bold text-right">
                  {formatDate(tx.created_at || new Date())}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Status</span>
                <span className="font-bold text-green-600 uppercase">
                  Paid
                </span>
              </div>
            </div>

            <Link
              href={nextLink}
              className="block w-full bg-purple-600 text-white py-3.5 rounded-xl font-bold hover:bg-purple-700"
            >
              {nextLabel} →
            </Link>

            <Link
              href="/dashboard"
              className="block w-full bg-gray-100 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-200"
            >
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
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
