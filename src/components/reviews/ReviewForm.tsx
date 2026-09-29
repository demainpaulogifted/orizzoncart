'use client';

import { useState } from 'react';
import StarRating from './StarRating';

interface ReviewFormProps {
  productId: string;
  merchantId: string;
  onSuccess: () => void;
}

export default function ReviewForm({ productId, merchantId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (comment.trim().length < 10) {
      setError('Comment must be at least 10 characters');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          merchantId,
          customerName: name,
          customerEmail: email || null,
          rating,
          title: title || null,
          comment,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setSuccess(true);
      setName('');
      setEmail('');
      setTitle('');
      setComment('');
      setRating(0);
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <div className="text-4xl mb-2">✅</div>
        <h3 className="font-bold text-green-900 mb-1">Review Submitted!</h3>
        <p className="text-sm text-green-700">Thank you for your feedback.</p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-3 text-sm font-medium text-green-700 hover:text-green-900 underline"
        >
          Write another review
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
      <h3 className="text-lg font-bold text-gray-900">Write a Review</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Rating <span className="text-red-500">*</span>
        </label>
        <StarRating rating={rating} onRate={setRating} size="lg" />
        {rating > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Your Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="John Doe"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email <span className="text-xs text-gray-400">(optional, won't be published)</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="john@example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Review Title <span className="text-xs text-gray-400">(optional)</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Great product!"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Your Review <span className="text-red-500">*</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          maxLength={2000}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          placeholder="Share your experience with this product..."
          required
        />
        <p className="text-xs text-gray-500 mt-1">{comment.length}/2000 characters</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-colors"
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
