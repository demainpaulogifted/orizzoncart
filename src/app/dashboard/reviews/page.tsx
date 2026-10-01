'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { toast } from 'sonner';

export default function MerchantReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: merchant } = await supabase
        .from('merchants')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!merchant) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('product_reviews')
        .select('*, products(name, slug)')
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (err: any) {
      toast.error('Failed to load reviews: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    try {
      const { error } = await supabase.from('product_reviews').delete().eq('id', id);
      if (error) throw error;
      setReviews(reviews.filter(r => r.id !== id));
      toast.success('Review deleted');
    } catch (err: any) {
      toast.error('Failed to delete: ' + err.message);
    }
  };

  const toggleApproval = async (review: any) => {
    try {
      const { error } = await supabase
        .from('product_reviews')
        .update({ is_approved: !review.is_approved })
        .eq('id', review.id);
      if (error) throw error;
      setReviews(reviews.map(r => r.id === review.id ? { ...r, is_approved: !r.is_approved } : r));
      toast.success(review.is_approved ? 'Review hidden' : 'Review approved');
    } catch (err: any) {
      toast.error('Failed: ' + err.message);
    }
  };

  const renderStars = (rating: number) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const stats = {
    total: reviews.length,
    approved: reviews.filter(r => r.is_approved).length,
    average: reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0',
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Reviews</h1>
          <p className="text-sm text-gray-500 mt-1">See what customers are saying about your products</p>
        </div>
        <Link href="/dashboard/products" className="text-purple-600 hover:text-purple-700 font-medium text-sm">
          ← Back to Products
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs font-bold text-gray-500 uppercase">Total Reviews</p>
          <p className="text-3xl font-black text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs font-bold text-gray-500 uppercase">Average Rating</p>
          <p className="text-3xl font-black text-purple-700 mt-1">{stats.average} ⭐</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs font-bold text-gray-500 uppercase">Approved</p>
          <p className="text-3xl font-black text-green-700 mt-1">{stats.approved}</p>
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-500 mt-3">Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border">
          <div className="text-5xl mb-3">💬</div>
          <h3 className="font-bold text-gray-900">No reviews yet</h3>
          <p className="text-sm text-gray-500 mt-1">Reviews from customers will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className={`bg-white rounded-xl border p-5 ${!review.is_approved ? 'opacity-60 border-dashed' : ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg">{renderStars(review.rating)}</span>
                    {!review.is_approved && (
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">Pending</span>
                    )}
                  </div>
                  {review.title && (
                    <h4 className="font-bold text-gray-900 mb-1">{review.title}</h4>
                  )}
                  <p className="text-gray-700 text-sm leading-relaxed mb-3 whitespace-pre-line">{review.comment}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="font-semibold text-gray-700">{review.customer_name}</span>
                    {review.customer_email && <span>• {review.customer_email}</span>}
                    <span>• {new Date(review.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-2">
                    <Link
                      href={`/p/${review.products?.slug || review.product_id}`}
                      className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                    >
                      📦 Product: {review.products?.name || 'Unknown'}
                    </Link>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => toggleApproval(review)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      review.is_approved
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {review.is_approved ? ' Hide' : '✅ Approve'}
                  </button>
                  <button
                    onClick={() => deleteReview(review.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
