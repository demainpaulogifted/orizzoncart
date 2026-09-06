'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

export default function PaymentSettingsPage() {
  const [gateway, setGateway] = useState('paystack');
  const [secretKey, setSecretKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Merchant State
  const [merchantStatus, setMerchantStatus] = useState('NOT_CONFIGURED');
  const [isActivated, setIsActivated] = useState(false);
  
  // Recurring Plan State (Hidden until activated)
  const [recurringPlan, setRecurringPlan] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      // Fetch merchant status
      const { data: merchant } = await supabase
        .from('merchants')
        .select('preferred_gateway, paystack_secret_key, flutterwave_secret_key, payment_receiving_status')
        .eq('user_id', user?.id)
        .single();
      
      if (merchant) {
        setGateway(merchant.preferred_gateway || 'paystack');
        setSecretKey(merchant.preferred_gateway === 'paystack' ? merchant.paystack_secret_key || '' : merchant.flutterwave_secret_key || '');
        setMerchantStatus(merchant.payment_receiving_status);
        
        // THE UNLOCK LOGIC: Only fetch recurring plan if they are ACTIVE
        if (merchant.payment_receiving_status === 'ACTIVE') {
          setIsActivated(true);
          fetchRecurringPlan(supabase);
        }
      }
    };
    fetchSettings();
  }, []);

  const fetchRecurringPlan = async (supabase: any) => {
    const { data: settings } = await supabase.from('platform_settings').select('*').single();
    if (settings && settings.is_recurring_billing_enabled) {
      setRecurringPlan(settings);
    }
  };

  const handleSaveKeys = async () => {
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
      toast.success('Payment keys saved! Please complete activation.');
      setMerchantStatus('PENDING_PAYMENT');
    }
    setIsSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-display">Payment & Billing</h1>
        <p className="text-gray-600 mt-2">Manage your payment gateways and store subscription.</p>
      </div>

      {/* 1. ACTIVATION STATUS (Always Visible) */}
      <div className={`p-6 rounded-2xl border-2 ${
        merchantStatus === 'ACTIVE' ? 'bg-green-50 border-green-200' :
        merchantStatus === 'PENDING_PAYMENT' ? 'bg-yellow-50 border-yellow-200' :
        'bg-gray-50 border-gray-200'
      }`}>
        <h2 className="text-xl font-bold mb-2">
          {merchantStatus === 'ACTIVE' ? '🎉 Store Activated!' : 
           merchantStatus === 'PENDING_PAYMENT' ? '⏳ Awaiting Activation Fee' : ' Setup Required'}
        </h2>
        <p className="text-gray-700">
          {merchantStatus === 'ACTIVE' ? 'Your store is live and receiving payments.' : 
           merchantStatus === 'PENDING_PAYMENT' ? 'Please pay the one-time activation fee to unlock your cart.' : 
           'Connect your payment keys below to begin.'}
        </p>
      </div>

      {/* 2. PAYMENT GATEWAY KEYS (Always Visible) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-6">
        <h2 className="text-xl font-bold text-gray-800">Connect Payment Gateway</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => setGateway('paystack')} className={`p-4 border rounded-xl font-medium transition-all ${gateway === 'paystack' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:bg-gray-50'}`}>Paystack</button>
          <button onClick={() => setGateway('flutterwave')} className={`p-4 border rounded-xl font-medium transition-all ${gateway === 'flutterwave' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 hover:bg-gray-50'}`}>Flutterwave</button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{gateway === 'paystack' ? 'Paystack' : 'Flutterwave'} Secret Key</label>
          <input type="password" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>

        <button onClick={handleSaveKeys} disabled={isSaving || !secretKey} className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50">
          {isSaving ? 'Saving...' : 'Save Keys & Proceed to Activation'}
        </button>
      </div>

      {/* 3. RECURRING MAINTENANCE PLAN (HIDDEN UNTIL ACTIVATED) */}
      {isActivated && (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-2xl shadow-sm border border-purple-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="bg-purple-100 text-purple-600 p-2 rounded-lg">🔄</span> 
              Store Maintenance Plan
            </h2>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">ACTIVE</span>
          </div>
          
          {recurringPlan ? (
            <div className="space-y-4">
              <p className="text-gray-700">
                To keep your store running smoothly with premium features, security updates, and subdomain hosting, your store is enrolled in our maintenance plan.
              </p>
              <div className="bg-white p-4 rounded-xl border border-purple-200 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Billing Frequency</p>
                  <p className="text-lg font-bold text-gray-900 capitalize">{recurringPlan.recurring_frequency}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(recurringPlan.recurring_fee_amount)}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 italic">
                * Invoices are automatically generated and charged to your connected payment method.
              </p>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600">🎉 Great news! The platform maintenance fee is currently waived by the admin.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}