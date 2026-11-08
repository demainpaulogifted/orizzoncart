'use client';

import { useState } from 'react';
import { addSharedCartItem } from '@/lib/marketplace-cart-client';

export function ProductCardAddButton({
  productId,
  storeSlug,
}: {
  productId: string;
  storeSlug: string;
}) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!productId || !storeSlug || loading) return;
    setLoading(true);
    try {
      await addSharedCartItem(storeSlug, productId, 1);
      setDone(true);
      setTimeout(() => setDone(false), 1200);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onAdd}
      aria-label="Add to cart"
      className="absolute bottom-2 right-2 z-10 w-9 h-9 rounded-full bg-white/95 shadow-md border border-gray-200 flex items-center justify-center text-base active:scale-95"
    >
      {loading ? '…' : done ? '✓' : '🛒'}
    </button>
  );
}
