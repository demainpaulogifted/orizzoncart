'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

const FREQ_LABELS: Record<string, string> = { monthly: 'Monthly', quarterly: 'Quarterly (3 months)', yearly: 'Yearly' };

export default function AdminBillingSettings() {
  const [settings, setSettings] = useState<any>({ id: null, activation_fee: 5000, activation_discount_percent: 0 });
  const [plans, setPlans] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: s } = await supabase.from('platform_settings').select('*').limit(1).maybeSingle();
      if (s) setSettings(s);
      const { data: p } = await supabase.from('maintenance_plans').select('*');
      if (p) setPlans(['monthly', 'quarterly', 'yearly'].map((f) => p.find((x: any) => x.frequency === f) || { frequency: f, base_price: 1000, discount_percent: 0, is_active: true }));
    };
    load();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    const supabase = createClient();

    const payload = { activation_fee: settings.activation_fee, activation_discount_percent: settings.activation_discount_percent };
    let error: any = null;
    if (settings.id) ({ error } = await supabase.from('platform_settings').update(payload).eq('id', settings.id));
    else ({ error, data: settings.id } = await supabase.from('platform_settings').insert(payload).select().single() as any);

    const planRows = plans.map((p) => ({ frequency: p.frequency, base_price: p.base_price, discount_percent: p.discount_percent, is_active: p.is_active, updated_at: new Date().toISOString() }));
    const { error: planErr } = await supabase.from('maintenance_plans').upsert(planRows, { onConflict: 'frequency' });

    if (error || planErr) toast.error('Failed: ' + (error?.message || planErr?.message));
    else toast.success('Billing & maintenance plans saved!');
    setIsSaving(false);
  };

  const finalFee = settings.activation_fee - (settings.activation_fee * (settings.activation_discount_percent / 100));

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Billing & Pricing</h1>
        <p className="text-gray-600 text-sm">Activation fee, discounts, and maintenance plans merchants can choose from.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-5">
        <h2 className="text-lg font-bold">💳 One-Time Activation Fee</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Base Fee (₦)</label>
            <input type="number" value={settings.activation_fee} onChange={(e) => setSettings({ ...settings, activation_fee: parseFloat(e.target.value) || 0 })} className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
            <input type="number" min={0} max={100} value={settings.activation_discount_percent} onChange={(e) => setSettings({ ...settings, activation_discount_percent: parseFloat(e.target.value) || 0 })} className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <p className="text-sm text-gray-600 bg-gray-50 border rounded-lg p-3">Merchant pays: <span className="font-extrabold text-green-600">{formatCurrency(finalFee)}</span></p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-5">
        <h2 className="text-lg font-bold">🔄 Store Maintenance Plans</h2>
        <p className="text-sm text-gray-500">Set a price and discount for each plan. Active plans appear for merchants to choose. Expired plans automatically stop payment receiving.</p>
        <div className="space-y-4">
          {plans.map((p, i) => {
            const final = p.base_price - (p.base_price * (p.discount_percent / 100));
            return (
              <div key={p.frequency} className={`rounded-xl border p-4 space-y-3 ${p.is_active ? 'border-purple-300 bg-purple-50/50' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <p className="font-bold text-gray-900">{FREQ_LABELS[p.frequency]}</p>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={p.is_active} onChange={(e) => { const copy = [...plans]; copy[i] = { ...copy[i], is_active: e.target.checked }; setPlans(copy); }} className="sr-only peer" />
                    <div className="w-12 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Base Price (₦)</label>
                    <input type="number" value={p.base_price} onChange={(e) => { const copy = [...plans]; copy[i] = { ...copy[i], base_price: parseFloat(e.target.value) || 0 }; setPlans(copy); }} className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Discount (%)</label>
                    <input type="number" min={0} max={100} value={p.discount_percent} onChange={(e) => { const copy = [...plans]; copy[i] = { ...copy[i], discount_percent: parseFloat(e.target.value) || 0 }; setPlans(copy); }} className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                </div>
                <p className="text-sm text-gray-600">Merchant pays: <span className="font-extrabold text-green-600">{formatCurrency(final)}</span>{p.discount_percent > 0 && <span className="ml-2 text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">{p.discount_percent}% OFF</span>}</p>
              </div>
            );
          })}
        </div>
      </div>

      <button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-bold shadow-lg disabled:opacity-50">
        {isSaving ? 'Saving...' : 'Save All Pricing'}
      </button>
    </div>
  );
}