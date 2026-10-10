'use client';

import { useEffect } from 'react';

/**
 * Records that this visitor browsed a merchant profile.
 * Used to personalize the Active Stores rail (affinity boost).
 */
export function TrackStoreView({ merchantId }: { merchantId: string }) {
  useEffect(() => {
    if (!merchantId || typeof document === 'undefined') return;

    try {
      const raw = document.cookie
        .split(';')
        .map((c) => c.trim())
        .find((c) => c.startsWith('mkt_affinity='));

      const current = raw
        ? decodeURIComponent(raw.slice('mkt_affinity='.length))
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

      const next = [merchantId, ...current.filter((id) => id !== merchantId)].slice(0, 30);
      const value = encodeURIComponent(next.join(','));
      document.cookie = `mkt_affinity=\( {value}; path=/; max-age= \){60 * 60 * 24 * 30}; SameSite=Lax`;
    } catch {
      /* ignore */
    }
  }, [merchantId]);

  return null;
}