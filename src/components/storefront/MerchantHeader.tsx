import { CartButton } from './CartButton';
import Link from 'next/link';

export function MerchantHeader({ merchant, isShowcaseMode }: { merchant: any; isShowcaseMode: boolean }) {
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
          <CartButton />
          <Link href="/track-order" className="text-xs font-bold text-[var(--color-primary)] hover:underline">
            📦 Track Order
          </Link>
        </div>
      </div>
    </header>
  );
}