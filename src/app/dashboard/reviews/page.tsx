'use client';

import { useCallback, useEffect, useState } from 'react';
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
product_id?: string;
is_approved: boolean;
created_at: string;
products?: { name?: string; slug?: string } | null;
};

type LoadError = {
section: 'authentication' | 'merchant' | 'store_reviews' | 'product_reviews' | 'unknown';
message: string;
code?: string;
};

type ReviewsResponse = {
storeSlug?: string;
storeReviews?: StoreReview[];
productReviews?: ProductReview[];
error?: string;
section?: string;
};

export default function MerchantReviewsPage() {
const [storeReviews, setStoreReviews] = useState<StoreReview[]>([]);
const [productReviews, setProductReviews] = useState<ProductReview[]>([]);
const [storeSlug, setStoreSlug] = useState('');
const [loading, setLoading] = useState(true);
const [loadError, setLoadError] = useState<LoadError | null>(null);
const [updatingProductReviewId, setUpdatingProductReviewId] =
useState<string | null>(null);

const loadReviews = useCallback(async () => {
setLoading(true);
setLoadError(null);
setStoreReviews([]);
setProductReviews([]);
setStoreSlug('');

try {
  const response = await fetch('/api/dashboard/reviews', {
    method: 'GET',
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache',
    },
  });

  const result = (await response.json()) as ReviewsResponse;

  if (!response.ok) {
    const section: LoadError['section'] =
      response.status === 401
        ? 'authentication'
        : response.status === 404
          ? 'merchant'
          : 'store_reviews';

    setLoadError({
      section,
      message: result.error || 'Could not load your reviews.',
    });
    return;
  }

  setStoreSlug(result.storeSlug || '');
  setStoreReviews(result.storeReviews || []);
  setProductReviews(result.productReviews || []);

  if (result.section === 'product_reviews') {
    setLoadError({
      section: 'product_reviews',
      message: result.error || 'Product reviews could not be loaded.',
    });
  }
} catch (error) {
  console.error('[Reviews dashboard load failed]', error);

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

if (!review.product_id) {
  toast.error('This product review has no product ID.');
  return;
}

setUpdatingProductReviewId(review.id);

try {
  // Ask the server to verify store ownership before changing a review.
  const response = await fetch('/api/dashboard/reviews/product-approval', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      review_id: review.id,
      product_id: review.product_id,
      is_approved: !review.is_approved,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Could not update product review.');
  }

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
<div className="mx-auto max-w-5xl p-6 text-center">
<p className="text-gray-500">Loading reviews…</p>
</div>
);
}

if (loadError && loadError.section !== 'product_reviews') {
const sectionLabels: Record<LoadError['section'], string> = {
authentication: 'Sign-in check',
merchant: 'Store lookup',
store_reviews: 'Store reviews',
product_reviews: 'Product reviews',
unknown: 'Unexpected error',
};

return (
  <main className="mx-auto max-w-3xl p-4 sm:p-6">
    <section className="space-y-4 rounded-xl border border-red-200 bg-white p-5">
      <h1 className="text-xl font-extrabold text-gray-900">
        Could not load reviews
      </h1>

      <p className="text-sm text-gray-700">
        Your existing review records have not been deleted by this page.
      </p>

      <div className="space-y-1 rounded-lg bg-red-50 p-3">
        <p className="text-sm font-bold text-red-800">
          {sectionLabels[loadError.section]}
        </p>
        <p className="break-words text-sm text-red-700">
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
<main className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6">
<header className="flex flex-wrap items-center justify-between gap-3">
<div>
<h1 className="text-2xl font-extrabold text-gray-900">
Customer Reviews
</h1>
<p className="mt-1 text-sm text-gray-500">
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
    <section className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-4">
      <h2 className="font-bold text-amber-900">
        Product reviews could not be loaded
      </h2>
      <p className="break-words text-sm text-amber-800">
        {loadError.message}
      </p>
      <p className="text-xs text-amber-800">
        Store reviews were loaded separately.
      </p>
      <button
        type="button"
        onClick={() => void loadReviews()}
        className="text-sm font-bold text-amber-900 underline"
      >
        Retry
      </button>
    </section>
  )}

  <section className="space-y-4">
    <div>
      <h2 className="text-xl font-extrabold">⭐ Store Reviews</h2>
      <p className="text-sm text-gray-500">
        Reviews submitted from the marketplace and your online storefront.
      </p>
    </div>

    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Stat title="Total store reviews" value={storeReviews.length} />
      <Stat title="Average store rating" value={`${storeAverage} / 5`} />
      <Stat
        title="Published store reviews"
        value={
          storeReviews.filter((review) => review.status === 'approved')
            .length
        }
      />
    </div>

    {storeReviews.length === 0 ? (
      <Empty text="No store reviews found for the currently selected store." />
    ) : (
      <div className="space-y-3">
        {storeReviews.map((review) => (
          <article
            key={review.id}
            className="rounded-xl border bg-white p-4 sm:p-5"
          >
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <p className="font-bold text-gray-900">
                  {review.reviewer_name}
                </p>
                <p className="mt-1 text-yellow-500">
                  {renderStars(review.rating)}
                  <span className="ml-2 text-xs text-gray-500">
                    {review.rating}/5
                  </span>
                </p>
              </div>

              <span className="text-xs text-gray-500">
                {new Date(review.created_at).toLocaleDateString()}
              </span>
            </div>

            {review.comment && (
              <p className="mt-3 whitespace-pre-line break-words text-sm text-gray-700">
                {review.comment}
              </p>
            )}

            <p className="mt-3 text-xs text-gray-500">
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

    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Stat title="Total product reviews" value={productReviews.length} />
      <Stat title="Average product rating" value={`${productAverage} / 5`} />
      <Stat
        title="Approved product reviews"
        value={productReviews.filter((review) => review.is_approved).length}
      />
    </div>

    {productReviews.length === 0 ? (
      <Empty text="No product reviews found for this store yet." />
    ) : (
      <div className="space-y-3">
        {productReviews.map((review) => (
          <article
            key={review.id}
            className="rounded-xl border bg-white p-4 sm:p-5"
          >
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <p className="font-bold text-gray-900">
                  {review.customer_name || 'Customer'}
                </p>
                <p className="mt-1 text-yellow-500">
                  {renderStars(review.rating)}
                </p>
              </div>

              <button
                type="button"
                disabled={
                  updatingProductReviewId === review.id ||
                  !review.product_id
                }
                onClick={() => void toggleProductApproval(review)}
                className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-bold text-gray-800 disabled:opacity-50"
              >
                {updatingProductReviewId === review.id
                  ? 'Updating…'
                  : review.is_approved
                    ? 'Hide product review'
                    : 'Approve product review'}
              </button>
            </div>

            {review.products?.name && (
              <p className="mt-2 text-xs text-purple-700">
                Product: {review.products.name}
              </p>
            )}

            {review.title && (
              <p className="mt-2 font-semibold">{review.title}</p>
            )}

            {review.comment && (
              <p className="mt-2 whitespace-pre-line break-words text-sm text-gray-700">
                {review.comment}
              </p>
            )}

            <p className="mt-3 text-xs text-gray-500">
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

function Stat({
title,
value,
}: {
title: string;
value: string | number;
}) {
return (
<div className="rounded-xl border bg-white p-4">
<p className="text-xs font-bold uppercase text-gray-500">{title}</p>
<p className="mt-2 text-2xl font-black text-gray-900 sm:text-3xl">
{value}
</p>
</div>
);
}

function Empty({ text }: { text: string }) {
return (
<div className="rounded-xl border bg-white p-8 text-center">
<p className="font-bold text-gray-800">No reviews to show</p>
<p className="mt-1 text-sm text-gray-500">{text}</p>
</div>
);
}