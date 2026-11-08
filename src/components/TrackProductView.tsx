'use client';

import { useEffect } from 'react';

export function TrackProductView({
  productId,
  source,
}: {
  productId: string;
  source: 'marketplace' | 'storefront';
}) {
  useEffect(() => {
    if (!productId) return;
    const key = 'pv:' + source + ':' + productId;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch {}
    fetch('/api/track/product-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId, source }),
      keepalive: true,
    }).catch(() => {});
  }, [productId, source]);
  return null;
}
