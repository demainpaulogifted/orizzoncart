import { notFound } from 'next/navigation';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import type { Metadata } from 'next';
import ProductDetailClient from '@/components/storefront/ProductDetailClient';
import ReviewForm from '@/components/reviews/ReviewForm';
import ReviewList from '@/components/reviews/ReviewList';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ store_slug: string; identifier: string }>;
}): Promise<Metadata> {
  const { store_slug, identifier } = await params;
  const admin = createAdminClient();

  const { data: merchant } = await admin
    .from('merchants')
    .select('id, store_name, store_slug')
    .eq('store_slug', store_slug)
    .maybeSingle();

  if (!merchant) return { title: 'Product Not Found' };

  const decodedIdentifier = decodeURIComponent(identifier);

  const { data: product } = await admin
    .from('products')
    .select('name, description, images, price, slug, id, stock')
    .eq('merchant_id', merchant.id)
    .eq('is_active', true)
    .or(`slug.eq.\( {decodedIdentifier},id.eq. \){decodedIdentifier}`)
    .maybeSingle();

  if (!product) return { title: 'Product Not Found' };

  const imageUrl =
    Array.isArray(product.images) && product.images.length > 0
      ? typeof product.images[0] === 'string'
        ? product.images[0]
        : product.images[0]?.url
      : null;

  const productUrl = `https://\( {store_slug}.orizzoncart.name.ng/p/ \){encodeURIComponent(
    product.slug || product.id
  )}`;

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
      type: 'website', // ✅ fixed (was 'product')
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description:
        product.description || `Buy ${product.name} at ${merchant.store_name}.`,
      images: imageUrl ? [imageUrl] : [],
    },
    alternates: { canonical: productUrl },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ store_slug: string; identifier: string }>;
}) {
  const { store_slug, identifier } = await params;
  const admin = createAdminClient();

  const { data: merchant } = await admin
    .from('merchants')
    .select('*')
    .eq('store_slug', store_slug)
    .maybeSingle();

  if (!merchant) notFound();

  const decodedIdentifier = decodeURIComponent(identifier);

  const { data: product } = await admin
    .from('products')
    .select('*')
    .eq('merchant_id', merchant.id)
    .eq('is_active', true)
    .or(`slug.eq.\( {decodedIdentifier},id.eq. \){decodedIdentifier}`)
    .maybeSingle();

  if (!product) notFound();

  const primaryImage = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null;
  const productUrl = `https://${store_slug}.orizzoncart.name.ng/p/${encodeURIComponent(product.slug || product.id)}`;

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || '',
    image: primaryImage ? [primaryImage] : [],
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
    aggregateRating: reviewCount > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: averageRating.toFixed(1),
      reviewCount,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <ProductDetailClient product={product} merchant={merchant} />

      {/* Reviews Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="border-t border-gray-200 pt-10">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6">
            Customer Reviews ({reviewCount})
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Review Form */}
            <div>
              <ReviewForm
                productId={product.id}
                merchantId={merchant.id}
                onSuccess={() => {
                  // Client will refetch
                }}
              />
            </div>

            {/* Review List */}
            <div>
              <ReviewList productId={product.id} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}