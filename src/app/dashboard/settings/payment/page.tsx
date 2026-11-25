
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import PayPalConnectCard from '@/components/dashboard/PayPalConnectCard';

function mask(key: string) {
  return key ? '••••••••' + key.slice(-4) : '';
}

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

  const [showKeysForm, setShowKeysForm] = useState(false);

  const [keysForm, setKeysForm] = useState({
    gateway: 'paystack',
    ps_secret: '',
    ps_public: '',
    fw_secret: '',
    fw_public: '',
  });

  const [savingKeys, setSavingKeys] = useState(false);

  useEffect(() => {
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
        .select('*')
        .eq('user_id', user.id);

      const active =
        (merchants || []).find((m: any) => m.id === cookieId) ||
        (merchants || [])[0];

      setMerchant(active || null);

      if (active) {
        setKeysForm((k) => ({
          ...k,
          gateway: active.preferred_gateway || 'paystack',
        }));
      }

      try {
        const response = await fetch(
          '/api/payments/platform/initialize',
          { cache: 'no-store' }
        );

        const fee = await response.json();

        if (!response.ok) {
          setFeeInfo({
            error: fee.error || 'Could not load activation fee.',
          });
        } else {
          setFeeInfo(fee);
        }
      } catch {
        setFeeInfo({
          error: 'Could not load activation fee. Please refresh.',
        });
      } finally {
        setFeeLoading(false);
      }
    };

    load();
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

  const hasOwnKeys =
    merchant &&
    (merchant.paystack_secret_key || merchant.flutterwave_secret_key);

  const method =
    merchant?.payout_method ||
    (hasOwnKeys ? 'own_keys' : null);

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
      toast.error(err.message || 'Could not start payment');
      setFeePaying(false);
    }
  };

  const saveKeys = async () => {
    setSavingKeys(true);

    const supabase = createClient();
    const isPending =
      merchant?.payment_receiving_status === 'PENDING_KEYS';

    const payload: any = {
      preferred_gateway: keysForm.gateway,
      paystack_secret_key:
        keysForm.ps_secret ||
        merchant?.paystack_secret_key ||
        null,
      paystack_public_key:
        keysForm.ps_public ||
        merchant?.paystack_public_key ||
        null,
      flutterwave_secret_key:
        keysForm.fw_secret ||
        merchant?.flutterwave_secret_key ||
        null,
      flutterwave_public_key:
        keysForm.fw_public ||
        merchant?.flutterwave_public_key ||
        null,
      payout_method: merchant?.payout_method || 'own_keys',
    };

    if (isPending) {
      payload.payment_receiving_status = 'ACTIVE';
      payload.cart_status = 'ENABLED';
      payload.checkout_status = 'ENABLED';
    }

    const { error } = await supabase
      .from('merchants')
      .update(payload)
      .eq('id', merchant.id);

    setSavingKeys(false);

    if (error) {
      toast.error('Failed: ' + error.message);
      return;
    }

    toast.success('Keys saved — you keep 100% of every sale!');

    setMerchant({
      ...merchant,
      ...payload,
      payment_receiving_status:
        payload.payment_receiving_status ||
        merchant.payment_receiving_status,
    });

    setShowKeysForm(false);

    setKeysForm({
      gateway: keysForm.gateway,
      ps_secret: '',
      ps_public: '',
      fw_secret: '',
      fw_public: '',
    });
  };

  const switchMethod = async () => {
    const supabase = createClient();

    const { error } = await supabase
      .from('merchants')
      .update({ payout_method: 'own_keys' })
      .eq('id', merchant.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    setMerchant({ ...merchant, payout_method: 'own_keys' });

    toast.success(
      'Now receiving via YOUR keys (0% fee).'
    );
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
          💳 Payment Settings
        </h1>
        <p className="text-gray-600 text-sm">
          Connect your own payment gateway to receive customer payments directly.
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
              Connect your own payment accounts to receive customer
              payments directly. PayPal credential verification is
              now available. Customer checkout activation is being
              completed separately.
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
              directly from customers purchasing your products.
            </p>
          </div>

          <PayPalConnectCard />

          <p className="text-xs text-gray-500 text-center">
            Stripe integration is coming soon. PayPal credentials
            can now be connected and verified. Customer checkout
            activation is being completed separately.
          </p>
        </div>
      )}

      {feePaid && isNigerianMerchant && (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            <p className="font-bold mb-1">
              Payment Method
            </p>

            {method === 'own_keys' && (
              <p>
                🔑 Your own payment keys —{' '}
                <strong>0% platform fee</strong>
              </p>
            )}

            {!method && (
              <p>
                ⚠️ No payment keys saved yet — set up your payment gateway below.
              </p>
            )}
          </div>

          {/* OPTION A: OWN PAYMENT KEYS */}
          <div
            className={`bg-white border-2 rounded-2xl p-6 space-y-4 ${
              method === 'own_keys'
                ? 'border-green-400'
                : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-bold text-lg">
                  🔑 My Own Payment Keys
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Connect your Paystack/Flutterwave. Money lands directly with you.
                </p>
              </div>

              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full shrink-0">
                0% fee
              </span>
            </div>

            {hasOwnKeys ? (
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-xl p-4 space-y-1">
                  {merchant.paystack_secret_key && (
                    <p className="text-sm font-mono break-all">
                      Paystack: {mask(merchant.paystack_secret_key)}
                    </p>
                  )}

                  {merchant.flutterwave_secret_key && (
                    <p className="text-sm font-mono break-all">
                      Flutterwave: {mask(merchant.flutterwave_secret_key)}
                    </p>
                  )}
                </div>

                {method === 'own_keys' ? (
                  <p className="text-xs font-bold text-green-700 bg-green-50 rounded-lg px-3 py-2">
                    ✅ ACTIVE — receiving payments here
                  </p>
                ) : (
                  <>
                    <p className="text-xs font-bold text-gray-500 bg-gray-100 rounded-lg px-3 py-2">
                      🔒 Saved but LOCKED — not receiving
                    </p>

                    <button
                      onClick={switchMethod}
                      className="w-full py-3 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700"
                    >
                      Switch to this method
                    </button>
                  </>
                )}

                <button
                  onClick={() => setShowKeysForm(!showKeysForm)}
                  className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200"
                >
                  {showKeysForm ? 'Close' : '✏️ Update keys'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowKeysForm(!showKeysForm)}
                className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800"
              >
                {showKeysForm ? 'Close' : '🔑 Set Up My Own Keys'}
              </button>
            )}

            {showKeysForm && (
              <div className="space-y-3 pt-2 border-t">
                <select
                  value={keysForm.gateway}
                  onChange={(e) =>
                    setKeysForm({
                      ...keysForm,
                      gateway: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="paystack">Preferred: Paystack</option>
                  <option value="flutterwave">Preferred: Flutterwave</option>
                </select>

                <input
                  type="password"
                  value={keysForm.ps_secret}
                  onChange={(e) =>
                    setKeysForm({
                      ...keysForm,
                      ps_secret: e.target.value,
                    })
                  }
                  placeholder="Paystack Secret Key (sk_test_...)"
                  className="w-full min-w-0 px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                />

                <input
                  value={keysForm.ps_public}
                  onChange={(e) =>
                    setKeysForm({
                      ...keysForm,
                      ps_public: e.target.value,
                    })
                  }
                  placeholder="Paystack Public Key (pk_test_...)"
                  className="w-full min-w-0 px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                />

                <input
                  type="password"
                  value={keysForm.fw_secret}
                  onChange={(e) =>
                    setKeysForm({
                      ...keysForm,
                      fw_secret: e.target.value,
                    })
                  }
                  placeholder="Flutterwave Secret Key (optional)"
                  className="w-full min-w-0 px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                />

                <input
                  value={keysForm.fw_public}
                  onChange={(e) =>
                    setKeysForm({
                      ...keysForm,
                      fw_public: e.target.value,
                    })
                  }
                  placeholder="Flutterwave Public Key (optional)"
                  className="w-full min-w-0 px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                />

                <button
                  onClick={saveKeys}
                  disabled={
                    savingKeys ||
                    (!keysForm.ps_secret &&
                      !keysForm.fw_secret &&
                      !hasOwnKeys)
                  }
                  className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50"
                >
                  {savingKeys ? 'Saving...' : 'Save Keys'}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
