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

type LoadError = {
  section: 'authentication' | 'merchant' | 'store_reviews' | 'product_reviews' | 'unknown';
  message: string;
  code?: string;
};

export default function MerchantReviewsPage() {
  const [storeReviews, setStoreReviews] = useState<StoreReview[]>([]);
  const [productReviews, setProductReviews] = useState<ProductReview[]>([]);
  const [storeSlug, setStoreSlug] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<LoadError | null>(null);
  const [updatingProductReviewId, setUpdatingProductReviewId] = useState<string | null>(null);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    const supabase = createClient();

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        console.error('[Reviews dashboard authentication]', authError);
        setLoadError({
          section: 'authentication',
          message: authError.message,
          code: authError.code,
        });
        return;
      }

      if (!user) {
        setLoadError({
          section: 'authentication',
          message: 'You are not signed in. Please sign in and try again.',
        });
        return;
      }

      const { data: merchant, error: merchantError } = await supabase
        .from('merchants')
        .select('id, store_slug')
        .eq('user_id', user.id)
        .maybeSingle();

      if (merchantError) {
        console.error('[Reviews dashboard merchant lookup]', merchantError);
        setLoadError({
          section: 'merchant',
          message: merchantError.message,
          code: merchantError.code,
        });
        return;
      }

      if (!merchant) {
        setLoadError({
          section: 'merchant',
          message: 'No merchant store was found for this account.',
        });
        return;
      }

      setStoreSlug(merchant.store_slug || '');

      // Load store reviews independently so the failing query is identifiable.
      const storeResult = await supabase
        .from('store_reviews')
        .select(
          'id, merchant_id, reviewer_name, rating, comment, status, created_at'
        )
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: false });

      if (storeResult.error) {
        console.error('[Store reviews query failed]', {
          code: storeResult.error.code,
          message: storeResult.error.message,
          details: storeResult.error.details,
          hint: storeResult.error.hint,
        });

        setLoadError({
          section: 'store_reviews',
          message: storeResult.error.message,
          code: storeResult.error.code,
        });
        return;
      }

      setStoreReviews((storeResult.data || []) as StoreReview[]);

      // Load product reviews separately; their failure won't be mistaken
      // for a store_reviews permissions or schema error.
      const productResult = await supabase
        .from('product_reviews')
        .select('*, products(name, slug)')
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: false });

      if (productResult.error) {
        console.error('[Product reviews query failed]', {
          code: productResult.error.code,
          message: productResult.error.message,
          details: productResult.error.details,
          hint: productResult.error.hint,
        });

        setLoadError({
          section: 'product_reviews',
          message: productResult.error.message,
          code: productResult.error.code,
        });
        return;
      }

      setProductReviews((productResult.data || []) as ProductReview[]);
    } catch (error) {
      console.error('[Reviews dashboard unexpected error]', error);

      setLoadError({
        section: 'unknown',
        message:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred while loading reviews.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

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
    if (updatingProductReviewId) return;

    setUpdatingProductReviewId(review.id);

    try {
      const supabase = createClient();

      const { data: { user }, error: authError } =
        await supabase.auth.getUser();

      if (authError) throw authError;
      if (!user) throw new Error('Please sign in again.');

      // Confirm that this review belongs to a product owned by this merchant.
      const { data: merchant, error: merchantError } = await supabase
        .from('merchants')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (merchantError) throw merchantError;
      if (!merchant) throw new Error('No merchant store was found.');

      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id')
        .eq('id', (review as ProductReview & { product_id?: string }).product_id || '')
        .eq('merchant_id', merchant.id)
        .maybeSingle();

      if (productError) throw productError;

      if (!product) {
        throw new Error(
          'Could not verify that this review belongs to your store.'
        );
      }

      const { error } = await supabase
        .from('product_reviews')
        .update({ is_approved: !review.is_approved })
        .eq('id', review.id);

      if (error) throw error;

      setProductReviews((current) =>
        current.map((item) =>
          item.id === review.id
            ? { ...item, is_approved: !review.is_approved }
            : item
        )
      );

      toast.success(
        review.is_approved
          ? 'Product review hidden.'
          : 'Product review approved.'
      );
    } catch (error) {
      console.error('[Product review update failed]', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Could not update product review.'
      );
    } finally {
      setUpdatingProductReviewId(null);
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

  if (loadError && loadError.section !== 'product_reviews') {
    const sectionLabel = {
      authentication: 'Sign-in check',
      merchant: 'Merchant lookup',
      store_reviews: 'Store reviews query',
      product_reviews: 'Product reviews query',
      unknown: 'Unexpected error',
    }[loadError.section];

    return (
      <main className="max-w-3xl mx-auto p-4 sm:p-6">
        <section className="rounded-xl border border-red-200 bg-white p-5 space-y-4">
          <h1 className="text-xl font-extrabold text-gray-900">
            Could not load reviews
          </h1>

          <p className="text-sm text-gray-700">
            The dashboard encountered an error while loading your reviews.
            Your existing review records have not been deleted by this page.
          </p>

          <div className="rounded-lg bg-red-50 p-3 space-y-1">
            <p className="text-sm font-bold text-red-800">{sectionLabel}</p>
            <p className="text-sm text-red-700 break-words">
              {loadError.message}
            </p>
            {loadError.code && (
              <p className="text-xs text-red-700">
                Error code: {loadError.code}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => void loadReviews()}
            className="rounded-lg bg-purple-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-purple-800"
          >
            Retry loading
          </button>
        </section>
      </main>
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

        <div className="flex flex-wrap gap-3">
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
          <button
            type="button"
            onClick={() => void loadReviews()}
            className="text-sm font-bold text-purple-700"
          >
            Refresh reviews
          </button>
        </div>
      </header>

      {loadError?.section === 'product_reviews' && (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2">
          <h2 className="font-bold text-amber-900">
            Product reviews could not be loaded
          </h2>
          <p className="text-sm text-amber-800 break-words">
            {loadError.message}
            {loadError.code ? ` (code: ${loadError.code})` : ''}
          </p>
          <p className="text-xs text-amber-800">
            Store reviews loaded separately. The product-review error does not
            mean your store reviews are missing.
          </p>
        </section>
      )}

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
              </article>
            ))}
          </div>
        )}
      </section>

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
                    disabled={updatingProductReviewId === review.id}
                    onClick={() => void toggleProductApproval(review)}
                    className="px-3 py-2 rounded-lg bg-gray-100 text-gray-800 text-xs font-bold disabled:opacity-50"
                  >
                    {updatingProductReviewId === review.id
                      ? 'Updating…'
                      : review.is_approved
                        ? 'Hide product review'
                        : 'Approve product review'}
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