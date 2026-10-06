'use client';

import { useEffect, useState } from 'react';
import { MonetagVignette } from '@/components/ads/MonetagVignette';

export function MarketplaceVignetteTracker() {
  const [showVignette, setShowVignette] = useState(false);

  useEffect(() => {
    const key = 'mkt_nav_count';
    let count = parseInt(sessionStorage.getItem(key) || '0', 10);

    // Increment on mount (counts as navigation)
    count += 1;
    sessionStorage.setItem(key, count.toString());

    // Show vignette after 3 navigations, with 3s delay
    if (count >= 3) {
      const t = setTimeout(() => setShowVignette(true), 3000);
      return () => clearTimeout(t);
    }
  }, []);

  if (!showVignette) return null;

  return (
    <MonetagVignette
      zoneId="11902705"
      storageKey="marketplace_vignette_nav3"
      delay={0}
      frequency={1}
    />
  );
}