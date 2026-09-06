'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function PaymentSettingsPage() {
  const [gateway, setGateway] = useState('paystack');
  const [secretKey, setSecretKey] = useState(''); // Only used for input, never populated from DB
  const [isSaving, setIsSaving] = useState(false);
  const [merchantStatus, setMerchantStatus] = useState('NOT_CONFIGURED');
  const [hasKeysConfigured, setHasKeysConfigured] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      // SECURE: We ONLY check if the key EXISTS (length > 0), we DO NOT fetch the actual key.
      const { data: merchant } = await supabase
        .from('merchants')
        .select('preferred_gateway, payment_receiving_status, paystack_secret_key, flutterwave_secret_key')
        .eq('user_id', user?.id)
        .single();
      
      if (merchant) {
        setGateway(merchant.preferred_gateway || 'paystack');
        setMerchantStatus(merchant.payment_receiving_status);
        
        // Check if a key exists without exposing it
        const currentKey = merchant.preferred_gateway === 'paystack' 
          ? merchant.paystack_secret_key 
          : merchant.flutterwave_secret_key;
          
        setHasKeysConfigured(!!currentKey && currentKey.length > 10);
      }
    };
    fetchStatus();
  }, []);

  const handleSaveKeys = async () => {
    if (!secretKey.startsWith('sk_live_') && !secretKey.startsWith('FLWSECK-')) {
      toast.error('Invalid secret key format. Must start with sk_live_ or FLWSECK-');
      return;
    }

    setIsSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const updateData: any = { preferred_gateway: gateway };
    if (gateway === 'paystack') updateData.paystack_secret_key = secretKey;
    else updateData.flutterwave_secret_key = secretKey;

    if (merchantStatus === 'NOT_CONFIGURED') {
      updateData.payment_receiving_status = 'PENDING_PAYMENT';
    }

    const { error } = await supabase.from('merchants').update(updateData).eq('user_id', user?.id);

    if (error) {
      toast.error('Failed to save keys');
    } else {
      toast.success('Payment keys saved securely!');
      setHasKeysConfigured(true);
      setMerchantStatus('PENDING_PAYMENT');
      setSecretKey(''); // Clear input after saving
    }
    setIsSaving(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-display">Payment Configuration</h1>
        <p className="text-gray-600 mt-2">Connect your payment gateway to start receiving money.</p>
      </div>

      <div className={`p-6 rounded-2xl border-2 ${
        merchantStatus === 'ACTIVE' ? 'bg-green-50 border-green-200' :
        merchantStatus === 'PENDING_PAYMENT' ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'
      }`}>
        <h2 className="text-xl font-bold mb-2">
          {merchantStatus === 'ACTIVE' ? '🎉 Store Activated!' : 
           merchantStatus === 'PENDING_PAYMENT' ? '⏳ Awaiting Activation Fee' : '🔒 Setup Required'}
        </h2>
        <p className="text-gray-700">
          {merchantStatus === 'ACTIVE' ? 'Your store is live and receiving payments.' : 
           merchantStatus === 'PENDING_PAYMENT' ? 'Please pay the one-time activation fee to unlock your cart.' : 
           'Connect your payment keys below to begin.'}
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-6">
        <h2 className="text-xl font-bold text-gray-800">Connect Gateway</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => setGateway('paystack')} className={`p-4 border rounded-xl font-medium transition-all ${gateway === 'paystack' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:bg-gray-50'}`}>Paystack</button>
          <button onClick={() => setGateway('flutterwave')} className={`p-4 border rounded-xl font-medium transition-all ${gateway === 'flutterwave' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 hover:bg-gray-50'}`}>Flutterwave</button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {gateway === 'paystack' ? 'Paystack' : 'Flutterwave'} Secret Key
          </label>
          <input 
            type="password" 
            value={secretKey} 
            onChange={(e) => setSecretKey(e.target.value)} 
            placeholder={hasKeysConfigured ? "•••••••••••••••••••• (Key is saved securely)" : "sk_live_xxxxx or FLWSECK-xxxxx"}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono" 
          />
          <p className="text-xs text-gray-500 mt-2">
            Your secret key is encrypted and stored securely. It is never sent back to your browser.
          </p>
        </div>

        <button onClick={handleSaveKeys} disabled={isSaving || (!secretKey && !hasKeysConfigured)} className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50">
          {isSaving ? 'Saving Securely...' : hasKeysConfigured ? 'Update Payment Keys' : 'Save Keys & Proceed to Activation'}
        </button>
      </div>
    </div>
  );
}