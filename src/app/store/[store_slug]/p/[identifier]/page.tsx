import { notFound } from 'next/navigation';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { headers } from 'next/headers';
import { redirectToSubdomain } from '@/lib/store-redirect';
import type { Metadata } from 'next';
import ProductDetailClient from '@/components/storefront/ProductDetailClient';
import ReviewForm from '@/components/reviews/ReviewForm';
import ReviewList from '@/components/reviews/ReviewList';

export const dynamic = 'force-dynamic';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function findProduct(admin: any, merchantId: string, identifier: string) {
  const { data: bySlug } = await admin
    .from('products')
    .select('*')
    .eq('merchant_id', merchantId)
    .eq('is_active', true)
    .eq('slug', identifier)
    .maybeSingle();
  if (bySlug) return bySlug;

  if (UUID_REGEX.test(identifier)) {
    const { data: byId } = await admin
      .from('products')
      .select('*')
      .eq('merchant_id', merchantId)
      .eq('is_active', true)
      .eq('id', identifier)
      .maybeSingle();
    if (byId) return byId;
  }
  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ store_slug: string; identifier: string }> }): Promise<Metadata> {
  const { store_slug, identifier } = await params;
  const admin = createAdminClient();

  const { data: merchant } = await admin
    .from('merchants')
    .select('id, store_name')
    .eq('store_slug', store_slug)
    .maybeSingle();
  if (!merchant) return { title: 'Product Not Found' };

  const product = await findProduct(admin, merchant.id, decodeURIComponent(identifier));
  if (!product) return { title: 'Product Not Found' };

  const imageUrl = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null;
  const productUrl = `https://${store_slug}.orizzoncart.name.ng/p/${encodeURIComponent(product.slug || product.id)}`;

  return {
    title: `${product.name} | ${merchant.store_name}`,
    description: product.description || `Buy ${product.name} at ${merchant.store_name}.`,
    openGraph: {
      title: product.name,
      description: product.description || `Buy ${product.name} at ${merchant.store_name}.`,
      url: productUrl,
      images: imageUrl ? [{ url: imageUrl, width: 800, height: 600, alt: product.name }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description || `Buy ${product.name} at ${merchant.store_name}.`,
    },
    alternates: { canonical: productUrl },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ store_slug: string; identifier: string }> }) {
  const { store_slug, identifier } = await params;
  const admin = createAdminClient();

  const host = (await headers()).get('host') || '';
  const decodedIdentifier = decodeURIComponent(identifier);
  redirectToSubdomain(host, store_slug, `/p/${encodeURIComponent(decodedIdentifier)}`, '');

  const { data: merchant } = await admin
    .from('merchants')
    .select('*')
    .eq('store_slug', store_slug)
    .maybeSingle();
  if (!merchant) notFound();

  const product = await findProduct(admin, merchant.id, decodedIdentifier);
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
    averageRating = reviewCount > 0 ? reviews!.reduce((s: number, r: any) => s + (r.rating || 0), 0) / reviewCount : 0;
  } catch {}

  const primaryImage = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null;
  const productUrl = `https://${store_slug}.orizzoncart.name.ng/p/${encodeURIComponent(product.slug || product.id)}`;

  const productSchema: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || '',
    image: primaryImage ? [primaryImage] : [],
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'NGN',
      availability: (product.stock || 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <ProductDetailClient product={product} merchant={merchant} />
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="border-t border-gray-200 pt-10">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Customer Reviews ({reviewCount})</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <ReviewForm productId={product.id} merchantId={merchant.id} onSuccess={() => {}} />
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