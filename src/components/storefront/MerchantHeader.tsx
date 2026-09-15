'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export function MerchantHeader({ merchant, isShowcaseMode }: { merchant: any; isShowcaseMode: boolean }) {
  const slug = merchant?.store_slug || '';
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
    return () => window.removeEventListener('cart-updated', read);
  }, [slug]);

  return (
    <header className="sticky top-0 z-30 bg-[var(--color-surface)]/95 backdrop-blur border-b border-[var(--color-text-muted)]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-10 h-10 rounded-xl bg-[var(--color-primary)] text-white font-extrabold flex items-center justify-center shrink-0 font-[var(--font-heading)]">
            {merchant.store_name?.[0]?.toUpperCase() || 'S'}
          </span>
          <span className="text-lg font-bold text-[var(--color-text)] truncate font-[var(--font-heading)]">
            {merchant.store_name}
          </span>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <button
            onClick={() => window.dispatchEvent(new Event('cart-open-request'))}
            className="relative flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-sm font-extrabold shadow-md hover:opacity-90"
          >
            🛒 Cart
            <span className="absolute -top-2 -right-2 min-w-[20px] h-[20px] px-1 rounded-full bg-red-500 text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-white">
              {count}
            </span>
          </button>
          <Link href="/track-order" className="text-xs font-bold text-[var(--color-primary)] hover:underline">
            📦 Track Order
          </Link>
        </div>
      </div>
    </header>
  );
}