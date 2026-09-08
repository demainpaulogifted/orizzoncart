'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

export default function PaymentSettingsPage() {
  const [gateway, setGateway] = useState('paystack');
  const [secretKey, setSecretKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState('NOT_CONFIGURED');
  const [hasKeysConfigured, setHasKeysConfigured] = useState(false);
  const [fee, setFee] = useState(5000);
  const [discount, setDiscount] = useState(0);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { data: merchant } = await supabase
        .from('merchants')
        .select('preferred_gateway, payment_receiving_status, paystack_secret_key, flutterwave_secret_key')
        .eq('user_id', user?.id)
        .single();
      if (merchant) {
        setGateway(merchant.preferred_gateway || 'paystack');
        setStatus(merchant.payment_receiving_status);
        const key = merchant.preferred_gateway === 'paystack' ? merchant.paystack_secret_key : merchant.flutterwave_secret_key;
        setHasKeysConfigured(!!key && key.length > 10);
      }
      const { data: settings } = await supabase.from('platform_settings').select('activation_fee, activation_discount_percent').limit(1).maybeSingle();
      if (settings) {
        setFee(settings.activation_fee);
        setDiscount(settings.activation_discount_percent || 0);
      }
    };
    load();
  }, []);

  const discountAmount = fee * (discount / 100);
  const finalFee = fee - discountAmount;
  const feePaid = status === 'PENDING_KEYS' || status === 'ACTIVE';
  const keysUnlocked = feePaid || hasKeysConfigured;

  const handleSaveKeys = async () => {
    setIsSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const updateData: any = { preferred_gateway: gateway };
    if (gateway === 'paystack') updateData.paystack_secret_key = secretKey;
    else updateData.flutterwave_secret_key = secretKey;

    // If fee is paid and keys are now saved → STORE GOES LIVE
    if (status === 'PENDING_KEYS') {
      updateData.payment_receiving_status = 'ACTIVE';
      updateData.cart_status = 'ENABLED';
      updateData.checkout_status = 'ENABLED';
    }

    const { error } = await supabase.from('merchants').update(updateData).eq('user_id', user?.id);
    if (error) toast.error('Failed to save keys');
    else {
      setHasKeysConfigured(true);
      setSecretKey('');
      if (status === 'PENDING_KEYS') {
        setStatus('ACTIVE');
        toast.success('🎉 Your store is LIVE and ready to receive payments!');
      } else {
        toast.success('Keys saved securely!');
      }
    }
    setIsSaving(false);
  };

  const handlePayActivation = async () => {
    setPaying(true);
    try {
      const res = await fetch('/api/payments/platform/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'payment_activation' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      window.location.href = data.authorization_url;
    } catch (e: any) {
      toast.error(e.message || 'Failed to start payment');
      setPaying(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Go Live — 2 Simple Steps</h1>
        <p className="text-gray-600 text-sm mt-1">Step 1: Pay activation fee. Step 2: Connect your payment keys.</p>
      </div>

      {status === 'ACTIVE' && (
        <div className="bg-green-100 border border-green-300 text-green-800 rounded-xl p-5 text-center font-bold">
          🎉 Your store is LIVE and receiving payments!
        </div>
      )}
      {status === 'PENDING_KEYS' && (
        <div className="bg-blue-100 border border-blue-300 text-blue-800 rounded-xl p-5 text-center font-bold">
          ✅ Activation fee paid! Now complete Step 2 below to go live.
        </div>
      )}
      {(status === 'SUSPENDED' || status === 'HELD') && (
        <div className="bg-red-100 border border-red-300 text-red-800 rounded-xl p-5 text-center font-bold">
          🛑 Payments suspended. Renew your maintenance plan or contact support.
        </div>
      )}
      {!feePaid && status !== 'SUSPENDED' && status !== 'HELD' && (
        <div className="bg-yellow-400 text-yellow-950 rounded-xl px-5 py-3 text-sm font-bold text-center">
          Step 1 of 2 — Pay the one-time activation fee to unlock your store.
        </div>
      )}

      {/* STEP 1: ACTIVATION FEE */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 sm:p-8 space-y-4">
        <h2 className="text-lg font-bold">Step 1️⃣ — Activation Fee</h2>
        <div className="bg-purple-100/70 rounded-2xl p-5 space-y-3">
          <div className="bg-white/80 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Base activation fee</span><span className="font-bold">{formatCurrency(fee)}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Discount ({discount}%)</span><span className="font-bold text-green-600">− {formatCurrency(discountAmount)}</span></div>
            <div className="flex justify-between border-t pt-2 text-base"><span className="font-bold text-gray-800">You pay today</span><span className="font-extrabold text-purple-700">{formatCurrency(finalFee)}</span></div>
          </div>
          {feePaid ? (
            <p className="text-center bg-green-100 text-green-700 font-bold py-3 rounded-xl">✓ Activation fee paid</p>
          ) : (
            <button onClick={handlePayActivation} disabled={paying} className="w-full px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50">
              {paying ? 'Redirecting to Paystack...' : `Pay ${formatCurrency(finalFee)} and Activate My Store`}
            </button>
          )}
        </div>
      </div>

      {/* STEP 2: GATEWAY KEYS (locked until fee paid) */}
      <div className={`bg-white rounded-2xl shadow-sm border p-6 sm:p-8 space-y-5 ${!keysUnlocked ? 'opacity-60' : ''}`}>
        <h2 className="text-lg font-bold">Step 2️⃣ — Connect Your Payment Keys {!keysUnlocked && '🔒'}</h2>

        {!keysUnlocked && (
          <p className="text-sm font-bold text-gray-500 bg-gray-100 rounded-lg py-3 px-4 text-center">
            🔒 Pay the activation fee in Step 1 to unlock this section.
          </p>
        )}

        {hasKeysConfigured && !feePaid && (
          <p className="text-sm font-bold text-blue-700 bg-blue-50 rounded-lg py-3 px-4 text-center">
            ✅ Keys already saved — now pay the activation fee in Step 1 to go live.
          </p>
        )}

        <fieldset disabled={!keysUnlocked} className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setGateway('paystack')} className={`py-3 rounded-full font-bold text-sm transition-all ${gateway === 'paystack' ? 'bg-blue-900 text-white' : 'bg-gray-100 text-gray-700'}`}>Paystack</button>
            <button type="button" onClick={() => setGateway('flutterwave')} className={`py-3 rounded-full font-bold text-sm transition-all ${gateway === 'flutterwave' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Flutterwave</button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{gateway === 'paystack' ? 'Paystack' : 'Flutterwave'} Secret Key</label>
            <input
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder={hasKeysConfigured ? '•••••••••••• (saved securely)' : 'sk_live_... or FLWSECK-...'}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-2 text-center">Your secret key is stored securely and never shown again.</p>
          </div>

          <button type="button" onClick={handleSaveKeys} disabled={isSaving || !secretKey} className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50">
            {isSaving ? 'Saving...' : status === 'PENDING_KEYS' ? 'Save Keys & Go LIVE 🚀' : 'Save Keys'}
          </button>
        </fieldset>
      </div>
    </div>
  );
}