'use client';

import { useEffect, useState } from 'react';
import { MonetagVignette } from '@/components/ads/MonetagVignette';

export function MarketplaceVignetteTracker() {
  const [showVignette, setShowVignette] = useState(false);

  useEffect(() => {
    const key = 'mkt_nav_count';
    let count = parseInt(sessionStorage.getItem(key) || '0', 10);

    // Increment on every marketplace navigation
    count += 1;
    sessionStorage.setItem(key, count.toString());

    // After 3+ navigations, show vignette on EVERY page (no frequency cap)
    if (count >= 3) {
      const t = setTimeout(() => setShowVignette(true), 2500);
      return () => clearTimeout(t);
    }
  }, []);

  if (!showVignette) return null;

  // NO frequency cap = shows every time = max ad revenue
  // delay={0} because user is already engaged (3+ clicks in)
  return (
    <MonetagVignette
      zoneId="11902705"
      storageKey={`mkt_vignette_${Date.now()}`} // unique key = bypasses localStorage frequency cap
      delay={0}
      frequency={999}
    />
  );
}