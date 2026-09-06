'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

export default function AdminBillingSettings() {
  const [settings, setSettings] = useState<any>({
    id: '',
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
    const fetchSettings = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('platform_settings').select('*').single();
      if (data) setSettings(data);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    const supabase = createClient();
    
    const { error } = await supabase
      .from('platform_settings')
      .update({
        activation_fee: settings.activation_fee,
        activation_discount_percent: settings.activation_discount_percent,
        is_recurring_billing_enabled: settings.is_recurring_billing_enabled,
        recurring_fee_amount: settings.recurring_fee_amount,
        recurring_frequency: settings.recurring_frequency,
        is_orizzon_commerce_live: settings.is_orizzon_commerce_live,
        orizzon_commerce_platform_fee_percent: settings.orizzon_commerce_platform_fee_percent,
      })
      .eq('id', settings.id);

    if (error) {
      toast.error('Failed to save settings');
    } else {
      toast.success('Billing settings updated successfully!');
    }
    setIsSaving(false);
  };

  const finalActivationFee = settings.activation_fee - (settings.activation_fee * (settings.activation_discount_percent / 100));

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4 md:p-0">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-display">Platform Billing & Subscriptions</h1>
        <p className="text-gray-600 mt-2">Manage activation fees, discounts, and recurring maintenance plans.</p>
      </div>

      {/* 1. Activation Fee Configuration */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <span className="bg-blue-100 text-blue-600 p-2 rounded-lg">💳</span> 
          One-Time Activation Fee
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Base Activation Fee (₦)</label>
            <input
              type="number"
              value={settings.activation_fee}
              onChange={(e) => setSettings({ ...settings, activation_fee: parseFloat(e.target.value) })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Discount Percentage (%)</label>
            <input
              type="number"
              min="0" max="100"
              value={settings.activation_discount_percent}
              onChange={(e) => setSettings({ ...settings, activation_discount_percent: parseFloat(e.target.value) })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Final Price Merchant Pays:</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(finalActivationFee)}</p>
        </div>
      </div>

      {/* 2. Recurring Maintenance Billing */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="bg-purple-100 text-purple-600 p-2 rounded-lg">🔄</span> 
            Recurring Store Maintenance
          </h2>
          
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={settings.is_recurring_billing_enabled}
              onChange={(e) => setSettings({ ...settings, is_recurring_billing_enabled: e.target.checked })}
              className="sr-only peer" 
            />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
          <p className="text-sm text-blue-800">
            <strong>🔒 "Value-First" Rule Active:</strong> The recurring fee is strictly hidden from new merchants during onboarding. 
            It will only appear in their dashboard <em>after</em> they successfully pay the Activation Fee.
          </p>
        </div>

        {settings.is_recurring_billing_enabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Maintenance Fee Amount (₦)</label>
              <input
                type="number"
                value={settings.recurring_fee_amount}
                onChange={(e) => setSettings({ ...settings, recurring_fee_amount: parseFloat(e.target.value) })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Billing Frequency</label>
              <select
                value={settings.recurring_frequency}
                onChange={(e) => setSettings({ ...settings, recurring_frequency: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly (Every 3 Months)</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 3. Orizzon Commerce */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-6 mt-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="bg-purple-100 text-purple-600 p-2 rounded-lg">🌍</span> 
              Orizzon Commerce (Sourcing & Payouts)
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              When enabled, merchants can opt-in to have Orizzon Commerce handle all payment collection, sourcing, and automated profit payouts.
            </p>
          </div>
          
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={settings.is_orizzon_commerce_live}
              onChange={(e) => setSettings({ ...settings, is_orizzon_commerce_live: e.target.checked })}
              className="sr-only peer" 
            />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        {settings.is_orizzon_commerce_live && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Platform Fee on Sourced Orders (%)</label>
              <input
                type="number"
                value={settings.orizzon_commerce_platform_fee_percent}
                onChange={(e) => setSettings({ ...settings, orizzon_commerce_platform_fee_percent: parseFloat(e.target.value) })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50"
        >
          {isSaving ? 'Saving Changes...' : 'Save Billing Configuration'}
        </button>
      </div>
    </div>
  );
}