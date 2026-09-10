'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function AdminBusinessesPage() {
  const [merchants, setMerchants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlyInactive, setOnlyInactive] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('merchants')
      .select('id, store_name, store_slug, payment_receiving_status, created_at')
      .order('created_at', { ascending: false });
    setMerchants(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const isInactive = (m: any) =>
    m.payment_receiving_status === 'NOT_CONFIGURED' || m.payment_receiving_status === 'SUSPENDED';

  const remove = async (m: any) => {
    const typed = prompt(`PERMANENT DELETE\nType the store slug exactly to confirm:\n\n${m.store_slug}`);
    if (typed === null) return;
    if (typed.trim() !== m.store_slug) { alert('Slug did not match — store kept safely.'); return; }
    if (!confirm(`FINAL WARNING: "${m.store_name}" and ALL its products, orders & analytics will be deleted forever. Continue?`)) return;

    setBusy(m.id);
    const res = await fetch(`/api/admin/merchants/${m.id}`, { method: 'DELETE' });
    setBusy(null);
    if (res.ok) { alert('Store deleted permanently.'); load(); }
    else alert('Delete failed: ' + (await res.text()));
  };

  const list = onlyInactive ? merchants.filter(isInactive) : merchants;

  if (loading) return <div className="p-10 text-center text-gray-500">Loading businesses...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Businesses</h1>
          <p className="text-gray-600 text-sm">{merchants.length} stores • {merchants.filter(isInactive).length} inactive</p>
        </div>
        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 bg-white border rounded-xl px-4 py-2.5 cursor-pointer">
          <input type="checkbox" checked={onlyInactive} onChange={(e) => setOnlyInactive(e.target.checked)} className="w-4 h-4 accent-red-600" />
          Show inactive only
        </label>
      </div>

      {list.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed p-16 text-center text-gray-500">No stores here.</div>
      ) : (
        <div className="bg-white rounded-2xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Store</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {list.map((m: any) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <p className="font-bold text-gray-900">{m.store_name}</p>
                      <p className="text-xs text-gray-500 font-mono">/{m.store_slug}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        m.payment_receiving_status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                        m.payment_receiving_status === 'SUSPENDED' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {m.payment_receiving_status === 'ACTIVE' ? 'LIVE' : isInactive(m) ? 'INACTIVE' : m.payment_receiving_status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-500 text-xs">{formatDate(m.created_at)}</td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/merchants/${m.id}`} className="px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-200">
                          View
                        </Link>
                        <button
                          onClick={() => remove(m)}
                          disabled={busy === m.id}
                          className="px-3 py-1.5 bg-red-600 rounded-lg text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          {busy === m.id ? '...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}