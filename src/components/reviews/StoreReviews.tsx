'use client';

import { useCallback, useEffect, useState } from 'react';

type Review = {
  id: string;
  reviewer_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
  helpful_count?: number;
  replies?: {
    id: string;
    author_role: 'merchant' | 'reviewer';
    author_name: string;
    body: string;
    created_at: string;
  }[];
};

export function Stars({
  value,
  className = 'text-sm',
}: {
  value: number;
  className?: string;
}) {
  const full = Math.max(0, Math.min(5, Math.round(value)));

  return (
    <span className={`${className} leading-none`} aria-label={`${value} out of 5 stars`}>
      <span className="text-yellow-500">{'★'.repeat(full)}</span>
      <span className="text-gray-300">{'★'.repeat(5 - full)}</span>
    </span>
  );
}

export function StoreReviews({ merchantId }: { merchantId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avg, setAvg] = useState(0);
  const [count, setCount] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgError, setMsgError] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/reviews/store?merchant_id=${encodeURIComponent(merchantId)}`,
        { cache: 'no-store' }
      );

      if (!res.ok) throw new Error('Unable to load reviews.');

      const data = await res.json();
      setReviews(Array.isArray(data.reviews) ? data.reviews : []);
      setAvg(Number(data.average) || 0);
      setCount(Number(data.count) || 0);
    } catch (error) {
      console.error('Store reviews load failed:', error);
    }
  }, [merchantId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    setMsgError(false);

    try {
      const res = await fetch('/api/reviews/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchant_id: merchantId,
          reviewer_name: name.trim(),
          reviewer_email: email.trim(),
          rating,
          comment: comment.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Could not submit your review.');
      }

      setMsg('✅ Thank you! Your review has been published.');
      setName('');
      setEmail('');
      setComment('');
      setRating(5);
      setOpenForm(false);

      await load();
    } catch (error) {
      setMsgError(true);
      setMsg(
        error instanceof Error
          ? error.message
          : 'Could not submit your review. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      id="store-reviews"
      className="scroll-mt-24 bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm"
      aria-labelledby="store-reviews-heading"
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 id="store-reviews-heading" className="font-extrabold text-base">
            ⭐ Store Reviews
          </h2>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Stars value={avg} />
            <span className="text-sm text-gray-600 font-semibold">
              {count ? `${avg.toFixed(1)} / 5 · ${count} review${count === 1 ? '' : 's'}` : 'No reviews yet'}
            </span>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {count > 0 && (
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="px-3 py-2 border border-purple-200 text-purple-700 text-sm font-bold rounded-lg hover:bg-purple-50"
            >
              {expanded ? 'Hide Reviews' : `Read Reviews (${count})`}
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setMsg('');
              setOpenForm((value) => !value);
            }}
            className="px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-700"
          >
            {openForm ? 'Close' : 'Write a Review'}
          </button>
        </div>
      </div>

      {msg && (
        <p
          role="status"
          className={`rounded-lg p-3 text-sm ${
            msgError
              ? 'bg-red-50 text-red-700'
              : 'bg-green-50 text-green-700'
          }`}
        >
          {msg}
        </p>
      )}

      {expanded && (
        <div className="space-y-4 bg-gray-50 border rounded-xl p-4">
          {reviews.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No reviews yet.
            </p>
          ) : (
            reviews.map((review) => (
              <article
                key={review.id}
                className="border-b border-gray-200 last:border-0 pb-4 last:pb-0"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-sm break-words">
                      {review.reviewer_name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Stars value={review.rating} />
                </div>

                {review.comment && (
                  <p className="text-sm text-gray-700 mt-2 whitespace-pre-line break-words">
                    {review.comment}
                  </p>
                )}

                {(review.replies || []).map((reply) => (
                  <div
                    key={reply.id}
                    className="mt-3 ml-2 border-l-2 border-purple-200 pl-3"
                  >
                    <p className="text-xs font-bold">
                      {reply.author_role === 'merchant'
                        ? 'Official store response'
                        : reply.author_name}
                    </p>
                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">
                      {reply.body}
                    </p>
                  </div>
                ))}

                <p className="text-xs text-gray-500 mt-3">
                  Helpful votes: {review.helpful_count || 0}
                </p>
              </article>
            ))
          )}
        </div>
      )}

      {openForm && (
        <form
          onSubmit={submit}
          className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-5 space-y-4"
        >
          <div>
            <label className="block text-sm font-bold text-gray-700">
              Your rating
            </label>
            <div className="flex gap-2 mt-2" role="group" aria-label="Choose a rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-label={`${n} star${n === 1 ? '' : 's'}`}
                  aria-pressed={rating === n}
                  onClick={() => setRating(n)}
                  className={`text-3xl ${
                    n <= rating ? 'text-yellow-500' : 'text-gray-300'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="store-review-name" className="block text-sm font-semibold text-gray-700 mb-1">
              Your name
            </label>
            <input
              id="store-review-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
              autoComplete="name"
              placeholder="Enter your name"
              className="w-full min-w-0 px-3 py-3 border border-gray-300 rounded-lg text-base"
            />
          </div>

          <div>
            <label htmlFor="store-review-email" className="block text-sm font-semibold text-gray-700 mb-1">
              Your email (private)
            </label>
            <input
              id="store-review-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={254}
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full min-w-0 px-3 py-3 border border-gray-300 rounded-lg text-base"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your email is for review administration and will not appear publicly.
            </p>
          </div>

          <div>
            <label htmlFor="store-review-comment" className="block text-sm font-semibold text-gray-700 mb-1">
              Your review
            </label>
            <textarea
              id="store-review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
              maxLength={3000}
              placeholder="Share your experience with this store..."
              className="w-full min-w-0 resize-y px-3 py-3 border border-gray-300 rounded-lg text-base"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-green-600 text-white text-base font-extrabold rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? 'Submitting…' : 'Submit Review'}
          </button>
        </form>
      )}
    </section>
  );
}