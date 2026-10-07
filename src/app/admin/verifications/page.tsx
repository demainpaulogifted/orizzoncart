'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function VerificationsPage() {
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState('');

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/verifications');
      const data = await res.json();
      setPending(data.merchants || []);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function decide(id: string, action: 'approve' | 'reject') {
    if (!confirm(`${action === 'approve' ? 'Approve' : 'Reject'} this merchant?`)) return;
    setProcessing(id);
    try {
      const res = await fetch('/api/admin/verifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantId: id, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`✅ Merchant ${action}d!`);
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setProcessing('');
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <Link href="/admin" className="text-purple-600 text-sm hover:underline">← Back to Admin</Link>
        <h1 className="text-2xl font-bold mt-2">⏳ Verification Queue</h1>
        <p className="text-gray-500 text-sm mt-1">
          Review merchant submissions. Approve only if locations & documents look legitimate.
        </p>
      </div>

      {loading ? (
        <p className="text-center py-12 text-gray-500">Loading...</p>
      ) : pending.length === 0 ? (
        <div className="bg-white border rounded-xl p-10 text-center">
          <p className="text-5xl mb-2">✅</p>
          <p className="font-bold">All caught up!</p>
          <p className="text-sm text-gray-500 mt-1">No pending verifications right now.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map((m) => (
            <div key={m.id} className="bg-white border rounded-xl p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {m.logo_url ? (
                    <img src={m.logo_url} alt="" className="w-14 h-14 rounded-xl object-cover" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 text-white text-xl font-extrabold flex items-center justify-center">
                      {m.store_name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-extrabold text-lg">{m.store_name}</p>
                    <p className="text-xs text-gray-500">{m.business_name} • {m.store_slug}.orizzoncart.name.ng</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">PENDING</span>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                  <p className="text-xs font-bold text-gray-500 uppercase">Contact</p>
                  <p className="text-sm">📞 {m.business_phone || 'N/A'}</p>
                  <p className="text-sm">✉️ {m.business_email || 'N/A'}</p>
                  {m.cac_number && <p className="text-sm">🏛️ CAC: {m.cac_number}</p>}
                </div>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <p className="text-xs font-bold text-gray-500 uppercase">
                    Locations ({Array.isArray(m.business_locations) ? m.business_locations.length : 0})
                  </p>
                  {Array.isArray(m.business_locations) && m.business_locations.map((loc: any, i: number) => (
                    <div key={i} className="text-xs">
                      <span className="font-bold">#{i + 1}:</span> {loc.address}, {loc.city}, {loc.state}
                    </div>
                  ))}
                </div>
              </div>

              {m.business_about && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs font-bold text-blue-700 uppercase mb-1">About</p>
                  <p className="text-sm text-blue-900">{m.business_about}</p>
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t">
                <a
                  href={`https://${m.store_slug}.orizzoncart.name.ng`}
                  target="_blank"
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-200"
                >
                  👀 View Store
                </a>
                <button
                  onClick={() => decide(m.id, 'approve')}
                  disabled={processing === m.id}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  ✅ Approve
                </button>
                <button
                  onClick={() => decide(m.id, 'reject')}
                  disabled={processing === m.id}
                  className="px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-lg hover:bg-red-600 disabled:opacity-50"
                >
                  🗑 Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}