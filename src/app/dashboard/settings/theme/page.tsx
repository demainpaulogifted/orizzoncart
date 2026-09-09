'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { THEMES } from '@/lib/themes';

export default function ThemeSettingsPage() {
  const [merchant, setMerchant] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [buying, setBuying] = useState<string | null>(null);
  const [previewTheme, setPreviewTheme] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { data: m } = await supabase.from('merchants').select('*').eq('user_id', user?.id).single();
      setMerchant(m);
      if (m) {
        const { data: p } = await supabase.from('products').select('*').eq('merchant_id', m.id).eq('is_active', true).limit(3);
        setProducts(p || []);
      }
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

  if (!merchant) return <div className="p-10 text-center text-gray-500">Loading themes...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Store Themes</h1>
        <p className="text-gray-600 text-sm">Preview each theme with YOUR store name and YOUR products, then buy the one you love.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Object.values(THEMES).map((theme) => {
          const isActive = merchant.theme_id === theme.name;
          const price = prices[theme.name] ?? theme.price;
          const v = theme.variables;
          return (
            <div key={theme.name} className={`bg-white rounded-2xl border-2 overflow-hidden shadow-sm ${isActive ? 'border-green-500 ring-4 ring-green-100' : 'border-gray-200'}`}>
              {/* Mini live preview with THEIR store */}
              <div className="p-3" style={{ backgroundColor: v['--color-bg'] }}>
                <div className="rounded-lg overflow-hidden border" style={{ borderColor: v['--color-text-muted'] }}>
                  <div className="px-3 py-2 flex items-center justify-between" style={{ backgroundColor: v['--color-surface'] }}>
                    <span className="text-[11px] font-bold truncate" style={{ color: v['--color-text'], fontFamily: v['--font-heading'] }}>
                      {merchant.store_name}
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full text-white font-semibold shrink-0" style={{ backgroundColor: v['--color-primary'] }}>Cart</span>
                  </div>
                  <div className="py-3 text-center" style={{ backgroundColor: v['--color-bg'] }}>
                    <p className="text-sm font-bold px-2 truncate" style={{ color: v['--color-text'], fontFamily: v['--font-heading'] }}>{merchant.store_name}</p>
                    <span className="inline-block mt-1.5 text-[9px] px-3 py-1 rounded-full text-white font-semibold" style={{ backgroundColor: v['--color-primary'] }}>Shop Now</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 p-2" style={{ backgroundColor: v['--color-bg'] }}>
                    {[0, 1, 2].map((i) => {
                      const prod = products[i];
                      return (
                        <div key={i} className="rounded overflow-hidden" style={{ backgroundColor: v['--color-surface'] }}>
                          {prod?.images?.[0]?.url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={prod.images[0].url} alt="" className="w-full h-10 object-cover" />
                          ) : (
                            <div className="w-full h-10" style={{ backgroundColor: v['--color-surface'] }} />
                          )}
                          <p className="text-[8px] font-bold text-center py-0.5" style={{ color: v['--color-primary'] }}>
                            {prod ? `₦${Number(prod.price).toLocaleString()}` : '₦—'}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">{theme.display_name}</h3>
                  <span className="text-sm font-extrabold text-purple-600">₦{price.toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-500">{theme.description}</p>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setPreviewTheme(theme.name)} className="bg-gray-100 text-gray-800 font-bold py-2.5 rounded-xl text-xs hover:bg-gray-200">
                    👁 Live Preview
                  </button>
                  {isActive ? (
                    <span className="text-center bg-green-100 text-green-700 font-bold py-2.5 rounded-xl text-xs">✓ Active</span>
                  ) : (
                    <button onClick={() => handleBuy(theme.name)} disabled={buying === theme.name} className="bg-gray-900 text-white font-bold py-2.5 rounded-xl text-xs hover:bg-gray-800 disabled:opacity-50">
                      {buying === theme.name ? '...' : `Buy & Apply`}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full-screen live preview modal */}
      {previewTheme && (
        <div className="fixed inset-0 z-50 bg-black/70 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 bg-purple-600 text-white">
            <p className="font-bold text-sm">👁 Live Preview — {THEMES[previewTheme]?.display_name}</p>
            <button onClick={() => setPreviewTheme(null)} className="px-4 py-1.5 bg-white text-purple-700 rounded-full font-bold text-xs">Close ✕</button>
          </div>
          <iframe src={`/store/${merchant.store_slug}?preview_theme=${previewTheme}`} className="flex-1 w-full bg-white" title="Theme preview" />
        </div>
      )}
    </div>
  );
}