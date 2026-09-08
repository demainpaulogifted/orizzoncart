'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

export default function AdminBillingSettings() {
  const [settings, setSettings] = useState<any>({
    id: null,
    activation_fee: 5000,
    activation_discount_percent: 0,
    is_recurring_billing_enabled: false,
    recurring_fee_amount: 1000,
    recurring_frequency: 'monthly',
    is_orizzon_commerce_live: false,
    orizzon_commerce_platform_fee_percent: 5,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('platform_settings').select('*').limit(1).maybeSingle();
      if (data) setSettings(data);
    };
    load();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    const supabase = createClient();
    const payload = {
      activation_fee: settings.activation_fee,
      activation_discount_percent: settings.activation_discount_percent,
      is_recurring_billing_enabled: settings.is_recurring_billing_enabled,
      recurring_fee_amount: settings.recurring_fee_amount,
      recurring_frequency: settings.recurring_frequency,
      is_orizzon_commerce_live: settings.is_orizzon_commerce_live,
      orizzon_commerce_platform_fee_percent: settings.orizzon_commerce_platform_fee_percent,
    };

    let error: any = null;
    if (settings.id) {
      const res = await supabase.from('platform_settings').update(payload).eq('id', settings.id);
      error = res.error;
    } else {
      const res = await supabase.from('platform_settings').insert(payload).select().single();
      error = res.error;
      if (!res.error && res.data) setSettings(res.data);
    }

    if (error) toast.error('Failed: ' + error.message);
    else toast.success('Billing settings saved!');
    setIsSaving(false);
  };

  const finalFee = settings.activation_fee - (settings.activation_fee * (settings.activation_discount_percent / 100));

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Billing & Pricing</h1>
        <p className="text-gray-600 text-sm">Manage activation fees, discounts, and recurring maintenance plans.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-5">
        <h2 className="text-lg font-bold flex items-center gap-2">💳 One-Time Activation Fee</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Base Activation Fee (₦)</label>
            <input type="number" value={settings.activation_fee} onChange={(e) => setSettings({ ...settings, activation_fee: parseFloat(e.target.value) || 0 })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discount Percentage (%)</label>
            <input type="number" min={0} max={100} value={settings.activation_discount_percent} onChange={(e) => setSettings({ ...settings, activation_discount_percent: parseFloat(e.target.value) || 0 })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Final Price Merchant Pays:</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(finalFee)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">🔄 Recurring Store Maintenance</h2>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={settings.is_recurring_billing_enabled} onChange={(e) => setSettings({ ...settings, is_recurring_billing_enabled: e.target.checked })} className="sr-only peer" />
            <div className="w-14 h-7 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>
        {settings.is_recurring_billing_enabled && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Fee (₦)</label>
              <input type="number" value={settings.recurring_fee_amount} onChange={(e) => setSettings({ ...settings, recurring_fee_amount: parseFloat(e.target.value) || 0 })} className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
              <select value={settings.recurring_frequency} onChange={(e) => setSettings({ ...settings, recurring_frequency: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-purple-500">
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-bold shadow-lg hover:shadow-xl disabled:opacity-50">
        {isSaving ? 'Saving...' : 'Save Billing Configuration'}
      </button>
    </div>
  );
}