'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { StoreShop } from '@/components/storefront/StoreShop';
import { CartDrawer } from '@/components/storefront/CartDrawer';
import { MonetagVignette } from '@/components/ads/MonetagVignette';

export function StorefrontClient({ merchant, products, isShowcaseMode, pages, styleVars }: any) {
  const slug = merchant?.store_slug || '';
  const [cartOpen, setCartOpen] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const read = () => {
      try {
        const cart = JSON.parse(localStorage.getItem(`orz_cart_${slug}`) || '[]');
        setCount(cart.reduce((a: number, c: any) => a + (c.quantity || 0), 0));
      } catch { setCount(0); }
    };
    read();
    window.addEventListener('cart-updated', read);
    window.addEventListener('storage', read);
    return () => {
      window.removeEventListener('cart-updated', read);
      window.removeEventListener('storage', read);
    };
  }, [slug]);

  useEffect(() => {
    const open = () => setCartOpen(true);
    window.addEventListener('cart-open-request', open);
    return () => window.removeEventListener('cart-open-request', open);
  }, []);

  const storeUrl = typeof window !== 'undefined' ? window.location.href : '';
  const share = {
    copy: () => { navigator.clipboard.writeText(storeUrl); toast.success('Store link copied!'); },
    whatsapp: () => window.open(`https://wa.me/?text=${encodeURIComponent(`${merchant?.store_name}: ${storeUrl}`)}`, '_blank'),
    facebook: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(storeUrl)}`, '_blank'),
    x: () => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(storeUrl)}&text=${encodeURIComponent(merchant?.store_name)}`, '_blank'),
  };

  return (
    <div style={styleVars} className="min-h-screen bg-[var(--color-surface,#f8fafc)] text-[var(--color-text,#111827)]">
      {/* ✅ MONETAG VIGNETTE: Shows on store pages every 3rd visit */}
      <MonetagVignette zoneId="11938217" storageKey={`store_${slug}_vignette`} delay={3000} frequency={3} />

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 text-white flex items-center justify-center font-extrabold text-lg shrink-0">
            {merchant?.store_name?.[0]?.toUpperCase() || 'S'}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-extrabold text-lg leading-tight truncate">{merchant?.store_name}</h1>
            <p className="text-[11px] text-gray-500 truncate">{merchant?.tagline || 'Official online store'}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/track-order" className="hidden sm:flex items-center gap-1.5 px-3 py-2.5 rounded-xl border-2 border-gray-900 text-gray-900 text-xs font-extrabold hover:bg-gray-900 hover:text-white transition-colors">📦 Track Order</Link>
            <button onClick={() => setCartOpen(true)} className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-extrabold shadow-lg shadow-purple-300 hover:bg-purple-700 transition-colors">
              🛒 Cart
              <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1 rounded-full bg-red-500 text-white text-[11px] font-extrabold flex items-center justify-center border-2 border-white">{count}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {isShowcaseMode && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center text-sm font-bold">🛍️ This store is in showcase mode — ordering is temporarily unavailable.</div>
        )}
        <StoreShop products={products} merchant={merchant} isShowcaseMode={isShowcaseMode} />
      </main>

      <footer className="border-t bg-white py-6 mt-10">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-1">
          <p className="text-xs font-bold text-gray-700">© {new Date().getFullYear()} {merchant?.store_name}. All rights reserved.</p>
          <p className="text-[11px] text-gray-400">Storefront powered by <Link href="https://www.orizzoncart.name.ng" className="text-purple-600 font-bold">OrizzonCart</Link></p>
        </div>
      </footer>

      {count > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 p-3 bg-gradient-to-t from-black/30 to-transparent pointer-events-none">
          <button onClick={() => setCartOpen(true)} className="pointer-events-auto mx-auto flex items-center gap-3 px-6 py-3.5 rounded-full bg-purple-600 text-white font-extrabold shadow-2xl hover:bg-purple-700 transition-colors">
            🛒 View Cart <span className="min-w-[24px] h-[24px] px-1 rounded-full bg-white text-purple-700 text-xs font-extrabold flex items-center justify-center">{count}</span>
          </button>
        </div>
      )}
      <CartDrawer slug={slug} open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
