'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const GOOGLE_LAUNCH_URL = 'https://merchants.google.com/mc/campaigns';

export function AdsControlPanel({ campaigns }: { campaigns: any[] }) {
  const router = useRouter();
  const [openedId, setOpenedId] = useState('');
  const [markingId, setMarkingId] = useState('');
  const [message, setMessage] = useState('');

  async function markLaunched(id: string) {
    setMarkingId(id);
    setMessage('');
    try {
      const res = await fetch('/api/marketing/campaigns', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: id, status: 'active' }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Update failed');
      setMessage('🎉 Great! Your campaign is now tracked as ACTIVE.');
      router.refresh();
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setMarkingId('');
    }
  }

  const badge = (status: string) => {
    const colors: any = {
      ready: 'bg-blue-50 text-blue-700',
      active: 'bg-green-100 text-green-700',
      error: 'bg-red-50 text-red-700',
      paused: 'bg-gray-100 text-gray-500',
    };
    return colors[status] || 'bg-gray-100 text-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* How it works */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-2">
        <p className="font-semibold text-sm text-purple-900">
          🚀 How launching works — no approvals, no waiting:
        </p>
        <ol className="list-decimal ml-5 text-xs text-purple-900 space-y-1">
          <li>Your products are already synced to Google Merchant Center (Free Marketing ✅).</li>
          <li>Click "Launch on Google" below — Google opens in a new tab.</li>
          <li>In Google, click "Create ads" (or "Grow → Create ads") and choose Shopping / Performance Max.</li>
          <li>Google automatically uses ALL your synced products — images, titles, prices, links.</li>
          <li>Set your daily budget in Google and confirm. Google bills you directly.</li>
          <li>Come back and click "I launched it on Google" so we track it here.</li>
        </ol>
      </div>

      {message && (
        <div className="p-3 bg-green-50 text-green-800 border border-green-200 rounded text-sm">
          {message}
        </div>
      )}

      <div>
        <h2 className="font-bold text-lg mb-3">Your Campaigns</h2>

        {campaigns.length === 0 ? (
          <div className="text-center p-8 border-2 border-dashed rounded-lg text-gray-400">
            No campaigns yet. Click "Create Google Ads" above to build one.
          </div>
        ) : (
          <div className="space-y-3">
            {campaigns.map((c) => (
              <div key={c.id} className="p-4 bg-white border rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-xs text-gray-500">
                      {Number(c.daily_budget).toLocaleString()} {c.currency}/day •{' '}
                      {c.product_ids?.length || 0} products
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${badge(c.status)}`}
                  >
                    {c.status}
                  </span>
                </div>

                {c.status === 'ready' && (
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={GOOGLE_LAUNCH_URL}
                      target="_blank"
                      onClick={() => setOpenedId(c.id)}
                      className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700"
                    >
                      🚀 Launch on Google
                    </a>

                    {openedId === c.id && (
                      <button
                        onClick={() => markLaunched(c.id)}
                        disabled={markingId === c.id}
                        className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 disabled:opacity-50"
                      >
                        {markingId === c.id ? 'Saving...' : '✅ I launched it on Google'}
                      </button>
                    )}
                  </div>
                )}

                {c.status === 'active' && (
                  <p className="text-xs text-gray-500">
                    Running inside your own Google account.{' '}
                    <a
                      href={GOOGLE_LAUNCH_URL}
                      target="_blank"
                      className="text-purple-600 hover:underline"
                    >
                      View in Google →
                    </a>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}