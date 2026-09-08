'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

export default function PaymentSettingsPage() {
  const [gateway, setGateway] = useState('paystack');
  const [secretKey, setSecretKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [merchantStatus, setMerchantStatus] = useState('NOT_CONFIGURED');
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
        setMerchantStatus(merchant.payment_receiving_status);
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

  const handleSaveKeys = async () => {
    setIsSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const updateData: any = { preferred_gateway: gateway };
    if (gateway === 'paystack') updateData.paystack_secret_key = secretKey;
    else updateData.flutterwave_secret_key = secretKey;
    if (merchantStatus === 'NOT_CONFIGURED') updateData.payment_receiving_status = 'PENDING_PAYMENT';

    const { error } = await supabase.from('merchants').update(updateData).eq('user_id', user?.id);
    if (error) toast.error('Failed to save keys');
    else {
      toast.success('Keys saved securely!');
      setHasKeysConfigured(true);
      setMerchantStatus('PENDING_PAYMENT');
      setSecretKey('');
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
        <h1 className="text-2xl font-bold">Payment Configuration</h1>
        <p className="text-gray-600 text-sm mt-1">Connect your payment gateway to start receiving money.</p>
      </div>

      {merchantStatus === 'ACTIVE' ? (
        <div className="bg-green-100 border border-green-300 text-green-800 rounded-xl p-5 text-center font-bold">
          🎉 Your store is activated and receiving payments!
        </div>
      ) : (
        <div className="bg-yellow-400 text-yellow-950 rounded-xl px-5 py-3 text-sm font-bold text-center">
          Awaiting Activation Fee - pay the one-time fee to unlock your cart.
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setGateway('paystack')} className={`py-3 rounded-full font-bold text-sm transition-all ${gateway === 'paystack' ? 'bg-blue-900 text-white' : 'bg-gray-100 text-gray-700'}`}>Paystack</button>
          <button onClick={() => setGateway('flutterwave')} className={`py-3 rounded-full font-bold text-sm transition-all ${gateway === 'flutterwave' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Flutterwave</button>
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

        <button onClick={handleSaveKeys} disabled={isSaving || !secretKey} className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50">
          {isSaving ? 'Saving...' : 'Save Keys and Proceed to Activation'}
        </button>

        {/* Activation card with FULL breakdown */}
        <div className="bg-purple-100/70 rounded-2xl p-6 space-y-3">
          <p className="text-center text-sm font-medium text-gray-700">Activation Fee Breakdown</p>
          <div className="bg-white/80 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Base activation fee</span>
              <span className="font-bold">{formatCurrency(fee)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Discount ({discount}%)</span>
              <span className="font-bold text-green-600">− {formatCurrency(discountAmount)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 text-base">
              <span className="font-bold text-gray-800">You pay today</span>
              <span className="font-extrabold text-purple-700">{formatCurrency(finalFee)}</span>
            </div>
          </div>
          {!hasKeysConfigured ? (
            <p className="text-xs font-bold text-gray-500 bg-white/70 rounded-lg py-2 px-3 text-center">🔒 Save your gateway keys above to unlock activation</p>
          ) : (
            <button onClick={handlePayActivation} disabled={paying || merchantStatus === 'ACTIVE'} className="w-full px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50">
              {paying ? 'Redirecting to Paystack...' : `Pay ${formatCurrency(finalFee)} and Activate My Store`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}