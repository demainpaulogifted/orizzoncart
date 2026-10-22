'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function AdminVerificationsPage() {
  const [pending, setPending] = useState<any[]>([]);
  const [verified, setVerified] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/verifications');
      const data = await res.json();
      setPending(data.pending || []);
      setVerified(data.verified || []);
    } catch (e) {
      toast.error('Failed to load verifications');
    } finally {
      setLoading(false);
    }
  }

  async function approve(merchantId: string) {
    setApprovingId(merchantId);
    try {
      const res = await fetch('/api/admin/verifications/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to approve');

      toast.success('✅ Location approved successfully');
      load(); // refresh the lists
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setApprovingId(null);
    }
  }

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <Link href="/admin" className="text-purple-600 text-sm hover:underline">
          ← Back to Admin
        </Link>
        <h1 className="text-2xl font-bold mt-2">📍 Location Verifications</h1>
      </div>

      {/* PENDING */}
      <div>
        <h2 className="text-lg font-bold mb-3">
          ⏳ Pending Approval ({pending.length})
        </h2>

        {pending.length === 0 ? (
          <div className="bg-white rounded-xl border p-8 text-center text-gray-500">
            No pending verifications 🎉
          </div>
        ) : (
          <div className="grid gap-4">
            {pending.map((m: any) => (
              <div
                key={m.id}
                className="bg-white rounded-xl border p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{m.store_name}</h3>
                  <p className="text-xs text-gray-500 mb-3">
                    {m.store_slug}.orizzoncart.name.ng
                  </p>

                  <div className="space-y-2">
                    {(m.business_locations || []).map((loc: any, i: number) => (
                      <div key={i} className="text-sm bg-yellow-50 border border-yellow-100 rounded-lg p-3">
                        <p className="font-semibold">{loc.address}</p>
                        <p className="text-gray-600">
                          {loc.city}, {loc.state}
                        </p>
                      </div>
                    ))}
                  </div>

                  {m.cac_number && (
                    <p className="text-xs text-gray-500 mt-3">
                      CAC: <span className="font-mono font-bold">{m.cac_number}</span>
                    </p>
                  )}
                </div>

                <div className="shrink-0">
                  <button
                    onClick={() => approve(m.id)}
                    disabled={approvingId === m.id}
                    className="w-full px-5 py-2.5 bg-green-600 text-white font-bold rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
                  >
                    {approvingId === m.id ? 'Approving...' : '✅ Approve All Locations'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ALREADY VERIFIED */}
      <div>
        <h2 className="text-lg font-bold mb-3">
          ✅ Already Verified ({verified.length})
        </h2>

        {verified.length === 0 ? (
          <div className="bg-white rounded-xl border p-6 text-center text-gray-500 text-sm">
            No verified locations yet
          </div>
        ) : (
          <div className="grid gap-3">
            {verified.map((m: any) => (
              <div
                key={m.id}
                className="bg-white rounded-xl border p-4 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="font-bold">{m.store_name}</p>
                  <p className="text-xs text-gray-500">
                    {m.business_locations?.[0]?.city}, {m.business_locations?.[0]?.state}
                    {m.business_locations?.length > 1 && ` +${m.business_locations.length - 1} more`}
                  </p>
                </div>
                <Link
                  href={`/admin/merchants/${m.id}`}
                  className="text-sm text-purple-600 font-medium"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}