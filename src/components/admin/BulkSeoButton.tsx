'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export function BulkSeoButton() {
  const [loading, setLoading] = useState(false);

  const run = async (force: boolean) => {
    if (loading) return;

    const label = force
      ? 'Overwrite ALL descriptions with new SEO versions?'
      : 'Optimize only thin/empty descriptions (recommended)?';

    if (!confirm(label)) return;

    setLoading(true);
    try {
      const res = await fetch('/api/admin/digital-catalog/bulk-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          force,
          syncProducts: true, // also update already-sourced products
          minLength: 80,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Bulk SEO failed');
        return;
      }

      toast.success(data.message || `Updated ${data.updated} products`);
      // Refresh list so you see new descriptions
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={loading}
        onClick={() => run(false)}
        className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 disabled:opacity-50"
      >
        {loading ? 'Optimizing…' : '⚡ Bulk SEO (safe)'}
      </button>
      <button
        type="button"
        disabled={loading}
        onClick={() => run(true)}
        className="px-4 py-2.5 bg-amber-600 text-white rounded-xl font-bold text-sm hover:bg-amber-700 disabled:opacity-50"
        title="Overwrites every description"
      >
        Force overwrite
      </button>
    </div>
  );
}