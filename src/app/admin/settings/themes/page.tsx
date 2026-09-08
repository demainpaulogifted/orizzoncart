'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { THEMES } from '@/lib/themes';

export default function AdminThemePricingPage() {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('platform_theme_prices').select('*');
      if (data) {
        const map: Record<string, number> = {};
        data.forEach((row: any) => { map[row.theme_name] = row.price; });
        setPrices(map);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    const updates = Object.entries(prices).map(([theme_name, price]) =>
      supabase.from('platform_theme_prices').update({ price, updated_at: new Date().toISOString() }).eq('theme_name', theme_name)
    );
    const results = await Promise.all(updates);
    const failed = results.some((r) => r.error);
    if (failed) toast.error('Failed to save some prices');
    else toast.success('Theme prices updated! Merchants see them instantly.');
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Theme Pricing</h1>
        <p className="text-gray-600 text-sm">Set the price for each premium theme. Purchases are charged via the PLATFORM Paystack keys.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border divide-y">
        {Object.values(THEMES).map((t) => (
          <div key={t.name} className="flex items-center justify-between p-4 sm:p-5 gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-10 h-10 rounded-xl shrink-0" style={{ backgroundColor: t.variables['--color-primary'] }} />
              <div className="min-w-0">
                <p className="font-bold text-gray-900 truncate">{t.display_name}</p>
                <p className="text-xs text-gray-500 truncate">{t.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm font-bold text-gray-500">₦</span>
              <input
                type="number"
                value={prices[t.name] ?? t.price}
                onChange={(e) => setPrices({ ...prices, [t.name]: parseFloat(e.target.value) || 0 })}
                className="w-28 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-right font-bold"
              />
            </div>
          </div>
        ))}
      </div>

      <button onClick={handleSave} disabled={saving} className="w-full sm:w-auto px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50">
        {saving ? 'Saving...' : 'Save Theme Prices'}
      </button>
    </div>
  );
}