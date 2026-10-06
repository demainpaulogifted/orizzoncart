'use client';

import { useEffect, useState } from 'react';

type Review = {
  id: string;
  reviewer_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export function Stars({ value, className = 'text-sm' }: { value: number; className?: string }) {
  const full = Math.round(value);
  return (
    <span className={`${className} leading-none`}>
      <span className="text-yellow-500">{'★'.repeat(full)}</span>
      <span className="text-gray-300">{'★'.repeat(5 - full)}</span>
    </span>
  );
}

export function StoreReviews({ merchantId }: { merchantId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avg, setAvg] = useState(0);
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  async function load() {
    try {
      const res = await fetch(`/api/reviews/store?merchant_id=${merchantId}`);
      const d = await res.json();
      setReviews(d.reviews || []);
      setAvg(d.average || 0);
      setCount(d.count || 0);
    } catch {}
  }

  useEffect(() => {
    load();
  }, [merchantId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const res = await fetch('/api/reviews/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchant_id: merchantId, reviewer_name: name, rating, comment }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Failed to submit');
      setMsg('✅ Thank you! Your review is live.');
      setName('');
      setComment('');
      setRating(5);
      setOpen(false);
      load();
    } catch (e2: any) {
      setMsg('❌ ' + e2.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white border rounded-2xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-sm">⭐ Store Reviews</h2>
          <div className="flex items-center gap-2 mt-1">
            <Stars value={avg} />
            <span className="text-xs text-gray-500 font-semibold">
              {count ? `${avg} / 5 • ${count} review${count === 1 ? '' : 's'}` : 'No reviews yet'}
            </span>
          </div>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="px-3 py-2 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700"
        >
          {open ? 'Close' : 'Write a Review'}
        </button>
      </div>

      {open && (
        <form onSubmit={submit} className="bg-gray-50 border rounded-xl p-4 space-y-3">
          <div>
            <label className="text-xs font-bold text-gray-600">Your rating</label>
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className={`text-2xl ${n <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Your name"
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="How was your experience with this store? (optional)"
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
          {msg && <p className="text-xs text-gray-600">{msg}</p>}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? 'Submitting…' : 'Submit Review'}
          </button>
        </form>
      )}

      {reviews.length > 0 && (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold">{r.reviewer_name}</p>
                <Stars value={r.rating} className="text-xs" />
              </div>
              {r.comment && <p className="text-xs text-gray-600 mt-1">{r.comment}</p>}
              <p className="text-[10px] text-gray-400 mt-1">
                {new Date(r.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}