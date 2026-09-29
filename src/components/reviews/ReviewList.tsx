'use client';

import { useEffect, useState } from 'react';
import StarRating from './StarRating';

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  title: string | null;
  comment: string;
  created_at: string;
}

interface ReviewListProps {
  productId: string;
}

export default function ReviewList({ productId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [averageRating, setAverageRating] = useState(0);

  const fetchReviews = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews?productId=${productId}&page=${pageNum}&limit=10`);
      const data = await res.json();
      if (res.ok) {
        setReviews(data.reviews);
        setTotal(data.total);
        setPage(pageNum);

        // Calculate average
        if (data.reviews.length > 0) {
          const avg = data.reviews.reduce((sum: number, r: Review) => sum + r.rating, 0) / data.reviews.length;
          setAverageRating(avg);
        }
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-2">💬</div>
        <p className="text-gray-600 font-medium">No reviews yet</p>
        <p className="text-sm text-gray-500">Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-4xl font-extrabold text-gray-900">{averageRating.toFixed(1)}</div>
            <StarRating rating={averageRating} readonly size="sm" />
            <p className="text-xs text-gray-600 mt-1">Based on {total} review{total !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-bold text-gray-900">{review.customer_name}</h4>
                <StarRating rating={review.rating} readonly size="sm" />
              </div>
              <time className="text-xs text-gray-500">{formatDate(review.created_at)}</time>
            </div>
            {review.title && (
              <h5 className="font-semibold text-gray-800 mb-1">{review.title}</h5>
            )}
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{review.comment}</p>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {total > 10 && (
        <div className="flex justify-center gap-2 pt-4">
          {page > 1 && (
            <button
              onClick={() => fetchReviews(page - 1)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
            >
              ← Previous
            </button>
          )}
          <span className="px-4 py-2 text-sm text-gray-600">
            Page {page} of {Math.ceil(total / 10)}
          </span>
          {page * 10 < total && (
            <button
              onClick={() => fetchReviews(page + 1)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
            >
              Next →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
