'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function PaymentSettingsPage() {
  const [gateway, setGateway] = useState('paystack');
  const [secretKey, setSecretKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [merchantStatus, setMerchantStatus] = useState('');

  useEffect(() => {
    const fetchKeys = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { data: merchant } = await supabase.from('merchants').select('preferred_gateway, paystack_secret_key, flutterwave_secret_key, payment_receiving_status').eq('user_id', user?.id).single();
      
      if (merchant) {
        setGateway(merchant.preferred_gateway || 'paystack');
        setSecretKey(merchant.preferred_gateway === 'paystack' ? merchant.paystack_secret_key || '' : merchant.flutterwave_secret_key || '');
        setMerchantStatus(merchant.payment_receiving_status);
      }
    };
    fetchKeys();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const updateData: any = { preferred_gateway: gateway };
    if (gateway === 'paystack') updateData.paystack_secret_key = secretKey;
    else updateData.flutterwave_secret_key = secretKey;

    // If they add keys, move them to PENDING_PAYMENT (waiting for the 5k fee)
    if (merchantStatus === 'NOT_CONFIGURED') {
      updateData.payment_receiving_status = 'PENDING_PAYMENT';
    }

    const { error } = await supabase.from('merchants').update(updateData).eq('user_id', user?.id);

    if (error) toast.error('Failed to save keys');
    else {
      toast.success('Payment keys saved successfully!');
      setMerchantStatus('PENDING_PAYMENT');
    }
    setIsSaving(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Payment Configuration</h1>
      <p className="text-gray-600 mb-8">Connect your payment gateway to start receiving money from customers.</p>

      {/* Status Banner */}
      <div className={`p-4 rounded-lg mb-8 ${
        merchantStatus === 'ACTIVE' ? 'bg-green-50 text-green-800 border border-green-200' :
        merchantStatus === 'PENDING_PAYMENT' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' :
        'bg-gray-50 text-gray-800 border border-gray-200'
      }`}>
        <p className="font-bold">Status: {merchantStatus.replace('_', ' ')}</p>
        {merchantStatus === 'PENDING_PAYMENT' && <p className="text-sm mt-1">Please pay the ₦5,000 platform activation fee to unlock your cart.</p>}
        {merchantStatus === 'ACTIVE' && <p className="text-sm mt-1">🎉 You are live! Customers can now pay you directly.</p>}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border space-y-6">
        {/* Gateway Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Gateway</label>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setGateway('paystack')}
              className={`p-4 border rounded-lg font-medium transition-all ${gateway === 'paystack' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:bg-gray-50'}`}
            >
              Paystack
            </button>
            <button 
              onClick={() => setGateway('flutterwave')}
              className={`p-4 border rounded-lg font-medium transition-all ${gateway === 'flutterwave' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 hover:bg-gray-50'}`}
            >
              Flutterwave
            </button>
          </div>
        </div>

        {/* Secret Key Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {gateway === 'paystack' ? 'Paystack' : 'Flutterwave'} Secret Key
          </label>
          <input
            type="password"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            placeholder={gateway === 'paystack' ? 'sk_live_xxxxx' : 'FLWSECK-xxxxx'}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <p className="text-xs text-gray-500 mt-2">
            Found in your {gateway} Dashboard → Settings → API Keys. Keep this secret!
          </p>
        </div>

        <button 
          onClick={handleSave} 
          disabled={isSaving || !secretKey}
          className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Payment Keys'}
        </button>
      </div>
    </div>
  );
}