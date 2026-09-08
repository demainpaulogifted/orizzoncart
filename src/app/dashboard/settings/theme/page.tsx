'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { THEMES } from '@/lib/themes';

export default function ThemeSettingsPage() {
  const [currentThemeId, setCurrentThemeId] = useState('luxe-minimal');
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [buying, setBuying] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { data: merchant } = await supabase.from('merchants').select('theme_id').eq('user_id', user?.id).single();
      if (merchant?.theme_id) setCurrentThemeId(merchant.theme_id);

      const { data: priceRows } = await supabase.from('platform_theme_prices').select('*');
      if (priceRows) {
        const map: Record<string, number> = {};
        priceRows.forEach((r: any) => { map[r.theme_name] = r.price; });
        setPrices(map);
      }
    };
    load();
  }, []);

  const handleBuy = async (themeName: string) => {
    setBuying(themeName);
    try {
      const res = await fetch('/api/payments/platform/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'theme_purchase', theme_name: themeName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      window.location.href = data.authorization_url;
    } catch (e: any) {
      toast.error(e.message || 'Failed to start theme purchase');
      setBuying(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Store Themes</h1>
        <p className="text-gray-600 text-sm">Buy a premium theme once — it applies to your store automatically after payment.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Object.values(THEMES).map((theme) => {
          const isActive = currentThemeId === theme.name;
          const price = prices[theme.name] ?? theme.price;
          return (
            <div key={theme.name} className={`bg-white rounded-2xl border-2 overflow-hidden shadow-sm ${isActive ? 'border-green-500 ring-4 ring-green-100' : 'border-gray-200'}`}>
              <div className="h-28 w-full" style={{ backgroundColor: theme.variables['--color-bg'] }}>
                <div className="flex items-center justify-center h-full">
                  <span className="text-xl font-bold px-4 py-2 rounded-full text-white" style={{ backgroundColor: theme.variables['--color-primary'], fontFamily: theme.variables['--font-heading'] }}>
                    {theme.display_name}
                  </span>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">{theme.display_name}</h3>
                  <span className="text-sm font-extrabold text-purple-600">₦{price.toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-500">{theme.description}</p>
                {isActive ? (
                  <span className="block text-center bg-green-100 text-green-700 font-bold py-2.5 rounded-xl">✓ Active Theme</span>
                ) : (
                  <button
                    onClick={() => handleBuy(theme.name)}
                    disabled={buying === theme.name}
                    className="w-full bg-gray-900 text-white font-bold py-2.5 rounded-xl hover:bg-gray-800 disabled:opacity-50"
                  >
                    {buying === theme.name ? 'Redirecting...' : `Buy & Apply — ₦${price.toLocaleString()}`}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}