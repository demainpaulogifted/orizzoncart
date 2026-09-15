'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { StoreShop } from '@/components/storefront/StoreShop';
import { CartDrawer } from '@/components/storefront/CartDrawer';

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

  const storeUrl = typeof window !== 'undefined' ? window.location.href : '';
  const share = {
    copy: () => { navigator.clipboard.writeText(storeUrl); toast.success('Store link copied!'); },
    whatsapp: () => window.open(`https://wa.me/?text=${encodeURIComponent(`Check out ${merchant?.store_name} on OrizzonCart! ${storeUrl}`)}`, '_blank'),
    facebook: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(storeUrl)}`, '_blank'),
    x: () => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(storeUrl)}&text=${encodeURIComponent(merchant?.store_name)}`, '_blank'),
  };

  return (
    <div style={styleVars} className="min-h-screen bg-[var(--color-surface,#f8fafc)] text-[var(--color-text,#111827)]">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 text-white flex items-center justify-center font-extrabold text-lg shrink-0">
            {merchant?.store_name?.[0]?.toUpperCase() || 'S'}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-extrabold text-lg leading-tight truncate">{merchant?.store_name}</h1>
            <p className="text-[11px] text-gray-500 truncate">{merchant?.tagline || 'Trusted store on OrizzonCart'}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/track-order`}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2.5 rounded-xl border-2 border-gray-900 text-gray-900 text-xs font-extrabold hover:bg-gray-900 hover:text-white transition-colors"
            >
              📦 Track Order
            </Link>
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-extrabold shadow-lg shadow-purple-300 hover:bg-purple-700 transition-colors"
            >
              🛒 Cart
              <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1 rounded-full bg-red-500 text-white text-[11px] font-extrabold flex items-center justify-center border-2 border-white">
                {count}
              </span>
            </button>
          </div>
        </div>

        <div className="sm:hidden px-4 pb-2">
          <Link href="/track-order" className="flex items-center justify-center gap-1.5 py-2 rounded-lg border-2 border-gray-900 text-gray-900 text-xs font-extrabold">
            📦 Track My Order
          </Link>
        </div>
      </header>

      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-gray-500">Share store:</span>
          <button onClick={share.copy} className="px-3 py-1.5 rounded-full bg-gray-900 text-white text-xs font-bold">🔗 Copy Link</button>
          <button onClick={share.whatsapp} className="px-3 py-1.5 rounded-full bg-green-500 text-white text-xs font-bold">WhatsApp</button>
          <button onClick={share.facebook} className="px-3 py-1.5 rounded-full bg-blue-600 text-white text-xs font-bold">Facebook</button>
          <button onClick={share.x} className="px-3 py-1.5 rounded-full bg-black text-white text-xs font-bold">X</button>
        </div>
      </div>

      <section className="bg-gradient-to-b from-white to-transparent">
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <p className="text-xs font-extrabold tracking-[0.3em] text-gray-400 uppercase">Premium Collection</p>
          <h2 className="mt-3 text-4xl sm:text-5xl font-black">{merchant?.store_name}</h2>
          <p className="mt-3 text-gray-500 italic">{merchant?.tagline || 'Curated pieces, crafted for you.'}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs font-bold text-gray-600">
            <span>🔒 Secure Payments</span>
            <span>🚚 Fast Delivery</span>
            <span>💬 WhatsApp Support</span>
          </div>
        </div>
      </section>

      {pages?.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {pages.map((p: any) => (
              <Link
                key={p.slug}
                href={`/store/${slug}/info/${p.slug}`}
                className="px-3 py-1.5 rounded-full bg-white border text-xs font-bold text-gray-700 whitespace-nowrap hover:border-purple-400"
              >
                {p.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 py-6">
        {isShowcaseMode && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center text-sm font-bold text-yellow-800">
            🛍️ This store is in showcase mode — ordering is temporarily unavailable.
          </div>
        )}
        <StoreShop products={products} merchant={merchant} isShowcaseMode={isShowcaseMode} />
      </main>

      {count > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 p-3 bg-gradient-to-t from-black/30 to-transparent pointer-events-none">
          <button
            onClick={() => setCartOpen(true)}
            className="pointer-events-auto mx-auto flex items-center gap-3 px-6 py-3.5 rounded-full bg-purple-600 text-white font-extrabold shadow-2xl hover:bg-purple-700 transition-colors"
          >
            🛒 View Cart
            <span className="min-w-[24px] h-[24px] px-1 rounded-full bg-white text-purple-700 text-xs font-extrabold flex items-center justify-center">{count}</span>
          </button>
        </div>
      )}

      <CartDrawer slug={slug} open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}