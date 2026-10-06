'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MarketplaceSettingsPage() {
  const [enabled, setEnabled] = useState(false);
  const [paymentMode, setPaymentMode] = useState<string>('');
  const [subaccountCode, setSubaccountCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch current merchant settings
    fetch('/api/dashboard/marketplace/settings')
      .then(r => r.json())
      .then(data => {
        setEnabled(data.is_on_marketplace || false);
        setPaymentMode(data.payment_mode || 'platform');
        setSubaccountCode(data.platform_subaccount_code || '');
      });
  }, []);

  async function saveSettings() {
    setSaving(true);
    setMessage('');

    // Validation: If using own keys, MUST provide subaccount code
    if (enabled && paymentMode === 'own_keys' && !subaccountCode.trim()) {
      setMessage('❌ You must enter a Paystack/Flutterwave Subaccount Code to list on the marketplace with your own payment keys.');
      setSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/dashboard/marketplace/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_on_marketplace: enabled,
          platform_subaccount_code: subaccountCode
        })
      });

      if (!res.ok) throw new Error((await res.json()).error || 'Save failed');
      setMessage('✅ Settings saved! Your store is now on the marketplace.');
    } catch (e: any) {
      setMessage('❌ ' + e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Link href="/dashboard/settings" className="text-purple-600 text-sm hover:underline mb-4 inline-block">
        ← Back to Settings
      </Link>

      <h1 className="text-2xl font-bold mb-2">🛒 OrizzonCart Marketplace</h1>
      <p className="text-gray-500 mb-8">
        List your products on the OrizzonCart Marketplace to reach more customers.
      </p>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${message.includes('✅') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message}
        </div>
      )}

      <div className="bg-white border rounded-xl p-6 space-y-6">
        <div>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-semibold text-lg">List on Marketplace</p>
              <p className="text-sm text-gray-500">Your products will appear on orizzoncart.name.ng/marketplace</p>
            </div>
            <input 
              type="checkbox" 
              checked={enabled}
              onChange={e => setEnabled(e.target.checked)}
              className="w-6 h-6 text-purple-600 rounded"
            />
          </label>
        </div>

        {enabled && paymentMode === 'own_keys' && (
          <div className="pt-6 border-t">
            <label className="block text-sm font-semibold mb-2">
              Platform Subaccount Code (Required for own payment keys)
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Create a subaccount in your Paystack/Flutterwave dashboard for OrizzonCart and paste the code here. This allows us to take our platform commission automatically.
            </p>
            <input
              type="text"
              value={subaccountCode}
              onChange={e => setSubaccountCode(e.target.value)}
              placeholder="ACCT_xxxxxxxxxxxxx"
              className="w-full px-4 py-2 border rounded-lg text-sm"
            />
          </div>
        )}

        <button
          onClick={saveSettings}
          disabled={saving}
          className="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Marketplace Settings'}
        </button>
      </div>
    </div>
  );
}