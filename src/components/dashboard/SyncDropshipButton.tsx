'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function SyncDropshipButton() {
  const [syncing, setSyncing] = useState(false);
  const router = useRouter();

  async function syncDropshipProducts() {
    setSyncing(true);
    try {
      const res = await fetch('/api/dropshipping/sync', { method: 'POST' });
      const data = await res.json();
      
      if (res.ok) {
        toast.success(
          `✅ Synced! Updated ${data.updated || 0} products. Hidden ${data.hidden_out_of_stock || 0} out-of-stock items.`
        );
        router.refresh();
      } else {
        throw new Error(data.message || 'Sync failed');
      }
    } catch (e: any) {
      toast.error('Sync failed: ' + e.message);
    } finally {
      setSyncing(false);
    }
  }

  return (
    <button
      onClick={syncDropshipProducts}
      disabled={syncing}
      className="px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 shrink-0"
    >
      {syncing ? (
        <>
          <span className="animate-spin">🔄</span>
          Syncing...
        </>
      ) : (
        <>🔄 Sync Supplier Prices</>
      )}
    </button>
  );
}