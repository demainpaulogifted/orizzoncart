'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { toast } from 'sonner';

type StoreReview = {
  id: string;
  merchant_id: string;
  reviewer_name: string;
  rating: number;
  comment: string | null;
  status: string;
  created_at: string;
};

type ProductReview = {
  id: string;
  rating: number;
  title?: string | null;
  comment?: string | null;
  customer_name?: string | null;
  is_approved: boolean;
  created_at: string;
  products?: { name?: string; slug?: string } | null;
};

export default function MerchantReviewsPage() {
  const supabase = createClient();

  const [storeReviews, setStoreReviews] = useState<StoreReview[]>([]);
  const [productReviews, setProductReviews] = useState<ProductReview[]>([]);
  const [storeSlug, setStoreSlug] = useState('');
  const [loading, setLoading] = useState(true);

  const loadReviews = useCallback(async () => {
    setLoading(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        toast.error('Please sign in to view reviews.');
        return;
      }

      const { data: merchant, error: merchantError } = await supabase
        .from('merchants')
        .select('id, store_slug')
        .eq('user_id', user.id)
        .maybeSingle();

      if (merchantError) throw merchantError;

      if (!merchant) {
        toast.error('No merchant store was found for this account.');
        return;
      }

      setStoreSlug(merchant.store_slug);

      const [storeResult, productResult] = await Promise.all([
        supabase
          .from('store_reviews')
          .select('id, merchant_id, reviewer_name, rating, comment, status, created_at')
          .eq('merchant_id', merchant.id)
          .order('created_at', { ascending: false }),

        supabase
          .from('product_reviews')
          .select('*, products(name, slug)')
          .eq('merchant_id', merchant.id)
          .order('created_at', { ascending: false }),
      ]);

      if (storeResult.error) throw storeResult.error;
      if (productResult.error) throw productResult.error;

      setStoreReviews((storeResult.data || []) as StoreReview[]);
      setProductReviews((productResult.data || []) as ProductReview[]);
    } catch (error) {
      console.error('Review dashboard load failed:', error);
      toast.error(
        'Could not load reviews. Check the store_reviews permissions and database schema.'
      );
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  const storeAverage = storeReviews.length
    ? (
        storeReviews.reduce((sum, review) => sum + Number(review.rating), 0) /
        storeReviews.length
      ).toFixed(1)
    : '0.0';

  const productAverage = productReviews.length
    ? (
        productReviews.reduce((sum, review) => sum + Number(review.rating), 0) /
        productReviews.length
      ).toFixed(1)
    : '0.0';

  const toggleProductApproval = async (review: ProductReview) => {
    try {
      const { error } = await supabase
        .from('product_reviews')
        .update({ is_approved: !review.is_approved })
        .eq('id', review.id);

      if (error) throw error;

      setProductReviews((current) =>
        current.map((item) =>
          item.id === review.id
            ? { ...item, is_approved: !item.is_approved }
            : item
        )
      );

      toast.success(
        review.is_approved ? 'Product review hidden.' : 'Product review approved.'
      );
    } catch (error) {
      console.error(error);
      toast.error('Could not update product review.');
    }
  };

  const renderStars = (rating: number) =>
    '★'.repeat(Math.max(0, Math.min(5, Math.round(rating)))) +
    '☆'.repeat(5 - Math.max(0, Math.min(5, Math.round(rating))));

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6 text-center">
        <p className="text-gray-500">Loading reviews…</p>
      </div>
    );
  }

  return (
    <main className="max-w-5xl mx-auto p-4 sm:p-6 space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            Customer Reviews
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Store reputation and product feedback, shown separately.
          </p>
        </div>

        <div className="flex gap-3">
          {storeSlug && (
            <Link
              href={`/marketplace/store/${storeSlug}`}
              className="text-sm font-bold text-purple-700"
            >
              View marketplace profile
            </Link>
          )}
          <Link
            href="/dashboard/products"
            className="text-sm font-bold text-purple-700"
          >
            Products →
          </Link>
        </div>
      </header>

      {/*
        STORE REVIEWS
        Marketplace and individual storefront reviews share store_reviews.
      */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-extrabold">⭐ Store Reviews</h2>
          <p className="text-sm text-gray-500">
            Reviews submitted from the marketplace and your online storefront.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Stat title="Total store reviews" value={storeReviews.length} />
          <Stat title="Average store rating" value={`${storeAverage} / 5`} />
          <Stat
            title="Published store reviews"
            value={storeReviews.filter((r) => r.status === 'approved').length}
          />
        </div>

        {storeReviews.length === 0 ? (
          <Empty text="No store reviews found yet." />
        ) : (
          <div className="space-y-3">
            {storeReviews.map((review) => (
              <article
                key={review.id}
                className="bg-white border rounded-xl p-4 sm:p-5"
              >
                <div className="flex flex-wrap justify-between gap-2">
                  <div>
                    <p className="font-bold text-gray-900">
                      {review.reviewer_name}
                    </p>
                    <p className="text-yellow-500 mt-1">
                      {renderStars(review.rating)}
                      <span className="text-gray-500 text-xs ml-2">
                        {review.rating}/5
                      </span>
                    </p>
                  </div>

                  <span className="text-xs text-gray-500">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>

                {review.comment && (
                  <p className="text-sm text-gray-700 mt-3 whitespace-pre-line break-words">
                    {review.comment}
                  </p>
                )}

                <p className="text-xs text-gray-500 mt-3">
                  Status: {review.status}
                </p>

                <p className="text-xs text-gray-500 mt-2">
                  You can respond to this review publicly. A negative review
                  should not be hidden solely because you disagree with it.
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* PRODUCT REVIEWS REMAIN A SEPARATE CATEGORY */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-extrabold">📦 Product Reviews</h2>
          <p className="text-sm text-gray-500">
            Feedback about individual products, not the store overall.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Stat title="Total product reviews" value={productReviews.length} />
          <Stat title="Average product rating" value={`${productAverage} / 5`} />
          <Stat
            title="Approved product reviews"
            value={productReviews.filter((r) => r.is_approved).length}
          />
        </div>

        {productReviews.length === 0 ? (
          <Empty text="No product reviews found yet." />
        ) : (
          <div className="space-y-3">
            {productReviews.map((review) => (
              <article
                key={review.id}
                className="bg-white border rounded-xl p-4 sm:p-5"
              >
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <p className="font-bold text-gray-900">
                      {review.customer_name || 'Customer'}
                    </p>
                    <p className="text-yellow-500 mt-1">
                      {renderStars(review.rating)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => void toggleProductApproval(review)}
                    className="px-3 py-2 rounded-lg bg-gray-100 text-gray-800 text-xs font-bold"
                  >
                    {review.is_approved ? 'Hide product review' : 'Approve product review'}
                  </button>
                </div>

                {review.products?.name && (
                  <p className="text-xs text-purple-700 mt-2">
                    Product: {review.products.name}
                  </p>
                )}

                {review.title && (
                  <p className="font-semibold mt-2">{review.title}</p>
                )}

                {review.comment && (
                  <p className="text-sm text-gray-700 mt-2 whitespace-pre-line">
                    {review.comment}
                  </p>
                )}

                <p className="text-xs text-gray-500 mt-3">
                  {new Date(review.created_at).toLocaleDateString()}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function Stat({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-white rounded-xl border p-4">
      <p className="text-xs font-bold uppercase text-gray-500">{title}</p>
      <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
        {value}
      </p>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="bg-white rounded-xl border p-8 text-center">
      <p className="font-bold text-gray-800">No reviews to show</p>
      <p className="text-sm text-gray-500 mt-1">{text}</p>
    </div>
  );
}