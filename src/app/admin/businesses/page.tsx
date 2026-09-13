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

  useEffect(() => {
    load();
  }, []);

  const isInactive = (m: any) =>
    m.payment_receiving_status === 'NOT_CONFIGURED' ||
    m.payment_receiving_status === 'SUSPENDED';

  const remove = async (m: any) => {
    const typed = prompt(
      `PERMANENT DELETE\nType the store slug exactly to confirm:\n\n${m.store_slug}`
    );
    if (typed === null) return;
    if (typed.trim() !== m.store_slug) {
      alert('Slug did not match — store kept safely.');
      return;
    }
    if (
      !confirm(
        `FINAL WARNING: "${m.store_name}" and ALL its products, orders & analytics will be deleted forever. Continue?`
      )
    )
      return;

    setBusy(m.id);
    const res = await fetch(`/api/admin/merchants/${m.id}`, { method: 'DELETE' });
    setBusy(null);
    if (res.ok) {
      alert('Store deleted permanently.');
      load();
    } else alert('Delete failed: ' + (await res.text()));
  };

  const list = onlyInactive ? merchants.filter(isInactive) : merchants;

  if (loading)
    return <div className="p-10 text-center text-gray-500">Loading businesses...</div>;

  return (
    <div className="space-y-5 min-w-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold">Businesses</h1>
          <p className="text-gray-600 text-sm">
            {merchants.length} stores • {merchants.filter(isInactive).length} inactive
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 bg-white border rounded-xl px-3 py-2.5 cursor-pointer w-fit">
          <input
            type="checkbox"
            checked={onlyInactive}
            onChange={(e) => setOnlyInactive(e.target.checked)}
            className="w-4 h-4 accent-red-600"
          />
          Show inactive only
        </label>
      </div>

      {list.length === 0 ? (
        <p className="p-8 text-center text-gray-500 bg-white rounded-2xl border">
          No businesses found
        </p>
      ) : (
        <>
          {/* Mobile cards — no cut columns */}
          <div className="sm:hidden space-y-3">
            {list.map((m: any) => (
              <div key={m.id} className="bg-white rounded-xl border p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 truncate">{m.store_name}</p>
                    <p className="text-xs text-gray-500 font-mono truncate">/{m.store_slug}</p>
                  </div>
                  <span
                    className={`shrink-0 px-2 py-1 rounded-full text-[10px] font-bold ${
                      m.payment_receiving_status === 'ACTIVE'
                        ? 'bg-green-100 text-green-700'
                        : m.payment_receiving_status === 'SUSPENDED'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {m.payment_receiving_status === 'ACTIVE'
                      ? 'LIVE'
                      : isInactive(m)
                      ? 'INACTIVE'
                      : m.payment_receiving_status}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{formatDate(m.created_at)}</p>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/merchants/${m.id}`}
                    className="flex-1 text-center px-3 py-2 bg-gray-100 rounded-lg text-xs font-bold text-gray-700"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => remove(m)}
                    disabled={busy === m.id}
                    className="flex-1 px-3 py-2 bg-red-600 rounded-lg text-xs font-bold text-white disabled:opacity-50"
                  >
                    {busy === m.id ? '...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block bg-white rounded-2xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[520px]">
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
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold ${
                            m.payment_receiving_status === 'ACTIVE'
                              ? 'bg-green-100 text-green-700'
                              : m.payment_receiving_status === 'SUSPENDED'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {m.payment_receiving_status === 'ACTIVE'
                            ? 'LIVE'
                            : isInactive(m)
                            ? 'INACTIVE'
                            : m.payment_receiving_status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-gray-500 text-xs whitespace-nowrap">
                        {formatDate(m.created_at)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/merchants/${m.id}`}
                            className="px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-200"
                          >
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
        </>
      )}
    </div>
  );
}