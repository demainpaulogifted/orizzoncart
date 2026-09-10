'use client';
import { useCart } from './CartContext';

export function CartButton() {
  const { count, setDrawerOpen } = useCart();
  return (
    <button
      onClick={() => setDrawerOpen(true)}
      className="relative px-5 py-2.5 rounded-full bg-[var(--color-primary)] text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-md"
    >
      🛒 Cart ({count})
    </button>
  );
}