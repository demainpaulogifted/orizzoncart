'use client';

import { useState } from 'react';
import { addSharedCartItem } from '@/lib/marketplace-cart-client';

export function MarketplaceAddToCartButton({
  productId,
  storeSlug,
  productName,
}: {
  productId: string;
  storeSlug: string;
  productName?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function onAdd() {
    if (!productId || !storeSlug || loading) return;
    setLoading(true);
    setError('');
    try {
      await addSharedCartItem(storeSlug, productId, 1);
      setDone(true);
      setTimeout(() => setDone(false), 1800);
    } catch (e: any) {
      setError(e?.message || 'Could not add to cart');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onAdd}
        disabled={loading || !storeSlug}
        className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-extrabold py-3.5 text-sm shadow-md active:scale-[0.99] disabled:opacity-60"
      >
        {loading ? 'Adding…' : done ? 'Added to cart ✓' : 'Add to cart'}
      </button>
      {error ? <p className="text-xs text-red-600 text-center">{error}</p> : null}
      {done ? (
        <p className="text-xs text-center text-gray-500">
          In your cart{productName ? ': ' + productName : ''}. Open Cart below anytime.
        </p>
      ) : null}
    </div>
  );
}
