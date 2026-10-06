'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ReviewModerationPage() {
  const [store, setStore] = useState<any[]>([]);
  const [product, setProduct] = useState<any[]>([]);
  const [busy, setBusy] = useState('');

  async function load() {
    const res = await fetch('/api/reviews/pending');
    const d = await res.json();
    setStore(d.store || []);
    setProduct(d.product || []);
  }

  useEffect(() => { load(); }, []);

  async function act(type: string, id: string, action: string) {
    setBusy(id);
    await fetch('/api/reviews/moderate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, id, action }),
    });
    setBusy('');
    load();
  }

  const Row = ({ r, type }: { r: any; type: string }) => (
    <div className="bg-white border rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold">{r.reviewer_name || r.reviewer_email || 'Customer'}</p>
        <span className="text-yellow-500 text-sm">{'★'.repeat(r.rating || 0)}</span>
      </div>
      {r.products?.name && (
        <p className="text-[11px] text-purple-700 font-bold">📦 Product: {r.products.name}</p>
      )}
      {r.comment && <p className="text-xs text-gray-600">{r.comment}</p>}
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => act(type, r.id, 'approve')}
          disabled={busy === r.id}
          className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          ✅ Approve
        </button>
        <button
          onClick={() => act(type, r.id, 'reject')}
          disabled={busy === r.id}
          className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 disabled:opacity-50"
        >
          🗑 Reject
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard/reviews" className="text-purple-600 text-sm hover:underline">← Back to Reviews</Link>
        <h1 className="text-2xl font-bold mt-2">🛡️ Review Moderation</h1>
        <p className="text-gray-500 text-sm">Approve or reject reviews before they appear publicly.</p>
      </div>

      <section className="space-y-3">
        <h2 className="font-bold">⭐ Store Reviews ({store.length} pending)</h2>
        {store.length === 0 ? (
          <p className="text-sm text-gray-400 bg-white border rounded-xl p-4">No pending store reviews 🎉</p>
        ) : (
          store.map((r) => <Row key={r.id} r={r} type="store" />)
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-bold">📦 Product Reviews ({product.length} pending)</h2>
        {product.length === 0 ? (
          <p className="text-sm text-gray-400 bg-white border rounded-xl p-4">No pending product reviews 🎉</p>
        ) : (
          product.map((r) => <Row key={r.id} r={r} type="product" />)
        )}
      </section>
    </div>
  );
}