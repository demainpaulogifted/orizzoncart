'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function OrizzonCommercePage() {
  const [isLive, setIsLive] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [payoutAccount, setPayoutAccount] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      
      // Check if Admin has launched the feature globally
      const { data: settings } = await supabase.from('platform_settings').select('is_orizzon_commerce_live').single();
      setIsLive(settings?.is_orizzon_commerce_live || false);

      // Check merchant's current status
      const { data: { user } } = await supabase.auth.getUser();
      const { data: merchant } = await supabase
        .from('merchants')
        .select('is_orizzon_commerce_enabled, commerce_payout_account')
        .eq('user_id', user?.id)
        .single();
      
      if (merchant) {
        setIsEnabled(merchant.is_orizzon_commerce_enabled);
        setPayoutAccount(merchant.commerce_payout_account || '');
      }
    };
    fetchData();
  }, []);

  const handleToggle = async () => {
    if (!isLive) {
      toast.info("Orizzon Commerce is coming soon! You've been added to the priority waitlist.");
      return;
    }

    if (!payoutAccount) {
      toast.error("Please enter your payout bank/account details before enabling.");
      return;
    }

    setIsSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('merchants').update({
      is_orizzon_commerce_enabled: !isEnabled,
      commerce_payout_account: payoutAccount,
      // WARNING: When enabled, this will eventually block direct merchant payments
      payment_receiving_status: !isEnabled ? 'ORIZZON_COMMERCE_ROUTING' : 'ACTIVE' 
    }).eq('user_id', user?.id);

    if (error) {
      toast.error("Failed to update settings");
    } else {
      toast.success(!isEnabled ? "Orizzon Commerce Enabled! Payments will now be routed through us." : "Orizzon Commerce Disabled. You now receive payments directly.");
      setIsEnabled(!isEnabled);
    }
    setIsSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-display flex items-center gap-3">
          Orizzon Commerce 
          {!isLive && <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">Coming Soon</span>}
        </h1>
        <p className="text-gray-600 mt-2">Let us source, ship, and handle payments while you earn automated profits.</p>
      </div>

      {/* Value Proposition Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="text-3xl mb-3">📦</div>
          <h3 className="font-bold text-gray-900">We Source & Ship</h3>
          <p className="text-sm text-gray-600 mt-2">Access our global supplier network. We handle warehousing and direct-to-customer shipping.</p>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="text-3xl mb-3">🛡️</div>
          <h3 className="font-bold text-gray-900">Zero Payment Risk</h3>
          <p className="text-sm text-gray-600 mt-2">All customer payments go securely to Orizzon Commerce. We handle fraud protection and disputes.</p>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="text-3xl mb-3">💰</div>
          <h3 className="font-bold text-gray-900">Automated Payouts</h3>
          <p className="text-sm text-gray-600 mt-2">We deduct product costs and platform fees, then automatically deposit your profit margin to your bank.</p>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className={`bg-white rounded-2xl shadow-sm border p-8 space-y-6 ${!isLive ? 'opacity-75' : ''}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Enable Orizzon Commerce Routing</h2>
            <p className="text-sm text-gray-500 mt-1">
              {isEnabled 
                ? "🟢 ACTIVE: All sales revenue is routed to Orizzon Commerce. Your profits are queued for payout." 
                : "⚪ INACTIVE: You receive customer payments directly to your connected Paystack/Flutterwave account."}
            </p>
          </div>
          
          <button 
            onClick={handleToggle}
            disabled={isSaving}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${isEnabled ? 'bg-purple-600' : 'bg-gray-200'}`}
          >
            <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${isEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>

        {isEnabled && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 space-y-4 animate-in fade-in slide-in-from-top-2">
            <h3 className="font-bold text-purple-900">Payout Configuration</h3>
            <p className="text-sm text-purple-700">
              ⚠️ <strong>Important:</strong> By enabling this, you are handing over payment collection to Orizzon Commerce. 
              Ensure your payout details below are 100% accurate to receive your profit margins.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bank Account / Payout Details</label>
              <textarea 
                value={payoutAccount}
                onChange={(e) => setPayoutAccount(e.target.value)}
                placeholder="e.g., Bank Name, Account Number, Account Name"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                rows={3}
              />
            </div>
          </div>
        )}

        {!isLive && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <span className="text-xl">🚀</span>
            <div>
              <p className="font-bold text-blue-900">Join the Priority Waitlist</p>
              <p className="text-sm text-blue-700">Orizzon Commerce is launching soon. Click the toggle above to reserve your spot and get early access to automated sourcing and payouts.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}