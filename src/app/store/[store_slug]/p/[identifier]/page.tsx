import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import type { Metadata } from 'next';
import ProductDetailClient from '@/components/storefront/ProductDetailClient';
import ReviewForm from '@/components/reviews/ReviewForm';
import ReviewList from '@/components/reviews/ReviewList';
import { redirectToSubdomain } from '@/lib/store-redirect';

export const dynamic = 'force-dynamic';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function safeImage(images: unknown): string | null {
  const first = Array.isArray(images) ? images[0] : images;
  const url =
    typeof first === 'string'
      ? first
      : first && typeof first === 'object' && 'url' in (first as object)
        ? String((first as { url?: unknown }).url ?? '')
        : null;
  return url && (url.startsWith('http') || url.startsWith('/')) ? url : null;
}

/**
 * Lookup order:
 * 1. active product by slug
 * 2. active product by UUID
 * 3. active product with empty/null slug whose id matches the identifier
 *    (covers older rows that never got a slug)
 */
async function findProduct(
  admin: ReturnType<typeof createAdminClient>,
  merchantId: string,
  rawIdentifier: string
) {
  const identifier = decodeURIComponent(rawIdentifier).trim();
  if (!identifier) return null;

  const base = () =>
    admin
      .from('products')
      .select('*')
      .eq('merchant_id', merchantId)
      .eq('is_active', true);

  const { data: bySlug } = await base().eq('slug', identifier).maybeSingle();
  if (bySlug) return bySlug;

  if (UUID_REGEX.test(identifier)) {
    const { data: byId } = await base().eq('id', identifier).maybeSingle();
    if (byId) return byId;
  }

  // Fallback: products created before slug was required
  const { data: orphans } = await base()
    .or('slug.is.null,slug.eq.')
    .eq('id', identifier)
    .maybeSingle();
  if (orphans) return orphans;

  return null;
}

type PageParams = Promise<{ store_slug: string; identifier: string }>;

export async function generateMetadata({
  params,
}: {
  params: PageParams;
}): Promise<Metadata> {
  const { store_slug, identifier } = await params;
  const admin = createAdminClient();

  const { data: merchant } = await admin
    .from('merchants')
    .select('id, store_name')
    .eq('store_slug', store_slug)
    .maybeSingle();
  if (!merchant) return { title: 'Product Not Found' };

  const product = await findProduct(admin, merchant.id, identifier);
  if (!product) return { title: 'Product Not Found' };

  const imageUrl = safeImage(product.images);
  const pathId = encodeURIComponent(product.slug || product.id);
  const productUrl = `https://\( {store_slug}.orizzoncart.name.ng/p/ \){pathId}`;

  return {
    title: `${product.name} | ${merchant.store_name}`,
    description:
      product.description || `Buy ${product.name} at ${merchant.store_name}.`,
    openGraph: {
      title: product.name,
      description:
        product.description || `Buy ${product.name} at ${merchant.store_name}.`,
      url: productUrl,
      images: imageUrl
        ? [{ url: imageUrl, width: 800, height: 600, alt: product.name }]
        : [],
      type: 'website',
    },
    alternates: { canonical: productUrl },
  };
}

export default async function ProductPage({ params }: { params: PageParams }) {
  const { store_slug, identifier } = await params;

  // Same rule as store home: never serve store content on platform host
  const host = (await headers()).get('host') || '';
  const pathSuffix = `/p/${encodeURIComponent(decodeURIComponent(identifier).trim())}`;
  redirectToSubdomain(host, store_slug, pathSuffix);

  const admin = createAdminClient();

  const { data: merchant } = await admin
    .from('merchants')
    .select('*')
    .eq('store_slug', store_slug)
    .maybeSingle();
  if (!merchant) notFound();

  const product = await findProduct(admin, merchant.id, identifier);
  if (!product) notFound();

  let reviewCount = 0;
  let averageRating = 0;
  try {
    const { data: reviews } = await admin
      .from('product_reviews')
      .select('rating')
      .eq('product_id', product.id)
      .eq('is_approved', true);
    reviewCount = reviews?.length || 0;
    averageRating =
      reviewCount > 0
        ? reviews!.reduce((s: number, r: { rating?: number }) => s + (r.rating || 0), 0) /
          reviewCount
        : 0;
  } catch {
    // reviews table optional / RLS — never break product page
  }

  const imageUrl = safeImage(product.images);
  const pathId = encodeURIComponent(product.slug || product.id);
  const productUrl = `https://\( {store_slug}.orizzoncart.name.ng/p/ \){pathId}`;

  const productSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || '',
    image: imageUrl ? [imageUrl] : [],
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'NGN',
      availability:
        (product.stock || 0) > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      url: productUrl,
    },
  };
  if (reviewCount > 0) {
    productSchema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: averageRating.toFixed(1),
      reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <ProductDetailClient product={product} merchant={merchant} />
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="border-t border-gray-200 pt-10">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6">
            Customer Reviews ({reviewCount})
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <ReviewForm
                productId={product.id}
                merchantId={merchant.id}
                onSuccess={() => {}}
              />
            </div>
            <div>
              <ReviewList productId={product.id} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}