
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import PayPalConnectCard from '@/components/dashboard/PayPalConnectCard';

function formatActivationFee(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency: currency.toUpperCase(),
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency.toUpperCase()} ${amount.toLocaleString()}`;
  }
}

export default function PaymentSettingsPage() {
  const [merchant, setMerchant] = useState<any>(null);
  const [feeInfo, setFeeInfo] = useState<any>(null);
  const [feeLoading, setFeeLoading] = useState(true);
  const [feePaying, setFeePaying] = useState(false);

  const [configured, setConfigured] = useState(false);
  const [publicKey, setPublicKey] = useState('');
  const [environment, setEnvironment] = useState('');
  const [lastVerified, setLastVerified] = useState<string | null>(null);
  const [credentialLoading, setCredentialLoading] = useState(false);
  const [showKeysForm, setShowKeysForm] = useState(false);

  const [secretKey, setSecretKey] = useState('');
  const [newPublicKey, setNewPublicKey] = useState('');
  const [savingKeys, setSavingKeys] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setFeeLoading(false);
        return;
      }

      const cookieId = document.cookie
        .split(';')
        .map((c) => c.trim())
        .find((c) => c.startsWith('active_merchant_id='))
        ?.split('=')[1];

      const { data: merchants } = await supabase
        .from('merchants')
        .select(
          'id, country_code, payment_receiving_status, payment_activated_at'
        )
        .eq('user_id', user.id);

      if (cancelled) return;

      const active =
        (merchants || []).find((m: any) => m.id === cookieId) ||
        (merchants || [])[0];

      setMerchant(active || null);

      if (active) {
        setCredentialLoading(true);

        try {
          const response = await fetch(
            '/api/merchant/paystack-credentials',
            { cache: 'no-store' }
          );

          const data = await response.json();

          if (!cancelled && response.ok) {
            setConfigured(Boolean(data.configured));
            setPublicKey(data.public_key || '');
            setEnvironment(data.environment || '');
            setLastVerified(data.last_verified_at || null);
          }
        } catch {
          if (!cancelled) {
            toast.error('Could not load Paystack settings.');
          }
        } finally {
          if (!cancelled) setCredentialLoading(false);
        }
      }

      try {
        const response = await fetch(
          '/api/payments/platform/initialize',
          { cache: 'no-store' }
        );

        const fee = await response.json();

        if (cancelled) return;

        if (!response.ok) {
          setFeeInfo({
            error: fee.error || 'Could not load activation fee.',
          });
        } else {
          setFeeInfo(fee);
        }
      } catch {
        if (!cancelled) {
          setFeeInfo({
            error: 'Could not load activation fee. Please refresh.',
          });
        }
      } finally {
        if (!cancelled) setFeeLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const isNigerianMerchant =
    String(merchant?.country_code || '').toUpperCase() === 'NG';

  const feePaid =
    merchant &&
    (
      merchant.payment_receiving_status === 'ACTIVE' ||
      merchant.payment_receiving_status === 'PENDING_KEYS' ||
      !!merchant.payment_activated_at
    );

  const payActivationFee = async () => {
    setFeePaying(true);

    try {
      const res = await fetch(
        '/api/payments/platform/initialize',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'payment_activation',
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Could not start payment.');
      }

      const redirectUrl =
        data.approval_url || data.authorization_url;

      if (!redirectUrl) {
        throw new Error(
          'The payment gateway did not return a payment link.'
        );
      }

      window.location.href = redirectUrl;
    } catch (err: any) {
      toast.error(err.message || 'Could not start payment.');
      setFeePaying(false);
    }
  };

  const saveKeys = async () => {
    if (!secretKey.trim() || !newPublicKey.trim()) {
      toast.error('Enter both your Paystack Secret Key and Public Key.');
      return;
    }

    setSavingKeys(true);

    try {
      const response = await fetch(
        '/api/merchant/paystack-credentials',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            secret_key: secretKey.trim(),
            public_key: newPublicKey.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Could not securely save your Paystack keys.'
        );
      }

      setConfigured(true);
      setPublicKey(data.public_key || newPublicKey);
      setEnvironment(data.environment || '');
      setLastVerified(data.last_verified_at || null);

      setSecretKey('');
      setNewPublicKey('');
      setShowKeysForm(false);

      setMerchant((current: any) => ({
        ...current,
        payment_receiving_status: 'ACTIVE',
      }));

      toast.success('Your Paystack credentials have been saved securely.');
    } catch (error: any) {
      toast.error(error.message || 'Could not save Paystack credentials.');
    } finally {
      setSavingKeys(false);
    }
  };

  if (!merchant) {
    return (
      <div className="p-10 text-center text-gray-500">
        Loading...
      </div>
    );
  }

  const activationCurrency = feeInfo?.currency || 'NGN';
  const activationAmount = Number(
    feeInfo?.final_amount ?? feeInfo?.amount ?? 0
  );

  const activationGateway =
    String(feeInfo?.gateway || 'paystack').toUpperCase();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Payment Settings
        </h1>
        <p className="text-gray-600 text-sm mt-1">
          Connect your payment account to receive customer payments.
        </p>
      </div>

      {!feePaid && (
        <div className="bg-white border rounded-2xl p-6 space-y-4">
          <span className="text-xs font-bold text-purple-600 uppercase">
            Step 1 — One-time
          </span>

          <h2 className="font-bold text-lg">
            Pay Activation Fee
          </h2>

          {feeLoading ? (
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-500">
              Loading your activation fee...
            </div>
          ) : feeInfo?.error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
              {feeInfo.error}
            </div>
          ) : (
            <>
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center justify-between gap-3">
                <div>
                  <span className="block text-sm font-bold text-purple-800">
                    Activation Fee
                  </span>
                  <span className="block text-xs text-purple-600 mt-1">
                    {feeInfo?.country_name || 'Your registered country'}
                  </span>
                </div>

                <span className="text-xl sm:text-2xl font-extrabold text-purple-700">
                  {formatActivationFee(
                    activationAmount,
                    activationCurrency
                  )}
                </span>
              </div>

              <p className="text-xs text-gray-500">
                Payment gateway: {activationGateway}
              </p>

              <button
                onClick={payActivationFee}
                disabled={feePaying || feeLoading || !feeInfo}
                className="w-full py-3.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50"
              >
                {feePaying
                  ? 'Redirecting to payment gateway...'
                  : `Pay ${formatActivationFee(activationAmount, activationCurrency)} & Continue`}
              </button>
            </>
          )}
        </div>
      )}

      {feePaid && !isNigerianMerchant && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="font-bold text-blue-900">
              International Payment Integration
            </p>
            <p className="text-sm text-blue-800 mt-1">
              Connect your supported international payment account.
              PayPal credential verification is available.
              Customer checkout activation is handled separately.
            </p>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-bold text-lg">Stripe</h2>
              <span className="text-xs font-bold text-orange-700 bg-orange-50 px-3 py-1.5 rounded-full">
                Coming Soon
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Connect your own Stripe account to receive payments
              directly from customers.
            </p>
          </div>

          <PayPalConnectCard />
        </div>
      )}

      {feePaid && isNigerianMerchant && (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            <p className="font-bold mb-1">
              Your Customer Payment Gateway
            </p>
            <p>
              Paystack is the supported merchant payment gateway.
              Your customer payments are processed using your own
              Paystack credentials.
            </p>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-bold text-lg">
                  Paystack
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Securely connect your Paystack account.
                </p>
              </div>

              <span className="text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-full">
                0% platform fee
              </span>
            </div>

            {credentialLoading ? (
              <p className="text-sm text-gray-500">
                Checking your saved credentials...
              </p>
            ) : configured ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
                <p className="font-bold text-green-800">
                  Paystack credentials connected
                </p>

                <p className="text-sm text-green-800 break-all">
                  Public Key: {publicKey}
                </p>

                <p className="text-xs text-green-700">
                  Environment: {environment || 'Not specified'}
                </p>

                {lastVerified && (
                  <p className="text-xs text-green-700">
                    Last verified: {new Date(lastVerified).toLocaleString()}
                  </p>
                )}

                <p className="text-xs text-green-700">
                  Your secret key is encrypted and is never displayed here.
                </p>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="font-bold text-amber-800">
                  Paystack is not connected yet.
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  Enter your Paystack Secret Key and Public Key below.
                </p>
              </div>
            )}

            <button
              onClick={() => setShowKeysForm(!showKeysForm)}
              className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800"
            >
              {showKeysForm
                ? 'Close'
                : configured
                  ? 'Update Paystack Credentials'
                  : 'Connect Paystack'}
            </button>

            {showKeysForm && (
              <div className="space-y-3 pt-3 border-t">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Paystack Secret Key
                  </label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    placeholder="sk_live_..."
                    className="w-full min-w-0 px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Paystack Public Key
                  </label>
                  <input
                    value={newPublicKey}
                    onChange={(e) => setNewPublicKey(e.target.value)}
                    placeholder="pk_live_..."
                    className="w-full min-w-0 px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                  />
                </div>

                <p className="text-xs text-gray-500">
                  Your Secret Key is encrypted on the server.
                  Never share it with anyone.
                  Both keys must belong to the same Paystack environment.
                </p>

                <button
                  onClick={saveKeys}
                  disabled={
                    savingKeys ||
                    !secretKey.trim() ||
                    !newPublicKey.trim()
                  }
                  className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50"
                >
                  {savingKeys ? 'Verifying and Saving...' : 'Save Paystack Credentials'}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
