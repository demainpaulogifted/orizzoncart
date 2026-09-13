import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { FlyerCover, flyerColorKey } from '@/components/storefront/FlyerCover';
import Link from 'next/link';
import { getStoreUrl } from '@/lib/store-url';

function buildSeoDescription(product: any, catalog: any, storeName: string): string {
  const base = (product.description || '').trim();
  const category = catalog?.category || (product.is_digital ? 'Digital Product' : 'Product');
  const price = Number(product.price || 0).toLocaleString('en-NG');

  // Prefer a real description, but always make it search-friendly and unique
  if (base.length >= 80) {
    // Truncate cleanly for meta (Google \~150-160 chars)
    const clean = base.replace(/\s+/g, ' ').trim();
    return clean.length > 155 ? clean.slice(0, 152).trim() + '…' : clean;
  }

  // SEO-optimized fallback when description is thin or missing
  if (product.is_digital) {
    return `Buy ${product.name} — \( {category} digital download. Instant delivery after payment. Only ₦ \){price} at ${storeName}. Secure checkout on OrizzonCart.`;
  }

  return `Shop ${product.name} online at ${storeName}. \( {category}. Price ₦ \){price}. Secure payment, fast delivery & WhatsApp support.`;
}

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { store_slug, product_id } = await params;
  const admin = createAdminClient();

  const { data: merchant } = await admin
    .from('merchants')
    .select('id, store_name, store_slug')
    .eq('store_slug', store_slug)
    .maybeSingle();

  if (!merchant) return { title: 'Product Not Found' };

  const { data: product } = await admin
    .from('products')
    .select('id, name, description, price, images, is_digital, catalog_id, is_active')
    .eq('id', product_id)
    .eq('merchant_id', merchant.id)
    .maybeSingle();

  if (!product) return { title: 'Product Not Found' };

  let catalog: any = null;
  if (product.catalog_id) {
    const { data: c } = await admin
      .from('digital_catalog')
      .select('category, cover_color, description, content_sections')
      .eq('id', product.catalog_id)
      .maybeSingle();
    catalog = c;
  }

  const storeUrl = getStoreUrl(store_slug);
  const productUrl = `\( {storeUrl}/p/ \){product.id}`;
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://orizzoncart.vercel.app').replace(/\/$/, '');

  const title = `${product.name} | ${merchant.store_name}`;
  const description = buildSeoDescription(product, catalog, merchant.store_name);
  const image =
    product.images?.[0]?.url ||
    `${appUrl}/icon-512.png`;

  const keywords = [
    product.name,
    catalog?.category,
    merchant.store_name,
    product.is_digital ? 'digital product' : 'buy online',
    'Nigeria',
    'OrizzonCart',
  ]
    .filter(Boolean)
    .join(', ');

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      title,
      description,
      url: productUrl,
      siteName: 'OrizzonCart',
      type: 'website',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    robots: product.is_active
      ? { index: true, follow: true }
      : { index: false, follow: false },
  };
}

export default async function ProductPage({ params }: any) {
  const { store_slug, product_id } = await params;
  const admin = createAdminClient();

  const { data: merchant } = await admin
    .from('merchants')
    .select('id, store_name, store_slug')
    .eq('store_slug', store_slug)
    .maybeSingle();

  if (!merchant) notFound();

  const { data: product } = await admin
    .from('products')
    .select('*')
    .eq('id', product_id)
    .eq('merchant_id', merchant.id)
    .maybeSingle();

  if (!product) notFound();

  // Catalog data for digital products (richer content + SEO)
  let catalog: any = null;
  if (product.is_digital && product.catalog_id) {
    const { data: c } = await admin
      .from('digital_catalog')
      .select('cover_color, category, description, content_sections')
      .eq('id', product.catalog_id)
      .maybeSingle();
    catalog = c;
  }

  const storeUrl = getStoreUrl(store_slug);
  const productUrl = `\( {storeUrl}/p/ \){product.id}`;
  const price = Number(product.price || 0);
  const currency = 'NGN';

  // JSON-LD Product schema — critical for Google rich results
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || catalog?.description || `Buy ${product.name} online`,
    image: product.images?.[0]?.url || undefined,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: merchant.store_name,
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: currency,
      price: price.toFixed(2),
      availability: product.is_active
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: merchant.store_name,
      },
    },
    ...(product.is_digital && {
      category: catalog?.category || 'Digital Goods',
    }),
  };

  const displayDescription =
    product.description?.trim() ||
    catalog?.description?.trim() ||
    'No description provided.';

  const sections = Array.isArray(catalog?.content_sections)
    ? catalog.content_sections.filter((s: any) => s?.title || s?.content)
    : [];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* JSON-LD for Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Image / Flyer */}
      <div className="relative aspect-[4/5] w-full bg-white">
        {product.is_digital ? (
          <FlyerCover
            title={product.name}
            category={catalog?.category || 'Digital'}
            colorKey={catalog?.cover_color || flyerColorKey(product.name)}
            className="w-full h-full"
          />
        ) : product.images?.[0]?.url ? (
          <Image
            src={product.images[0].url}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-6xl">
            🛍️
          </div>
        )}

        <Link
          href={`/store/${store_slug}`}
          className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg text-gray-900 font-bold"
        >
          ←
        </Link>
      </div>

      {/* Content */}
      <div className="px-5 py-6 space-y-5">
        <div>
          {catalog?.category && (
            <p className="text-xs font-bold uppercase tracking-wider text-purple-600 mb-1">
              {catalog.category}
            </p>
          )}
          <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">
            {product.name}
          </h1>
          <p className="mt-2 text-3xl font-black text-purple-700">
            ₦{price.toLocaleString('en-NG')}
          </p>
        </div>

        {product.is_digital && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <p className="font-bold text-blue-900 text-sm">Instant Digital Delivery</p>
              <p className="text-xs text-blue-700 mt-0.5">
                You will receive access immediately after payment.
              </p>
            </div>
          </div>
        )}

        {/* Main description — important for on-page SEO */}
        <div className="prose prose-sm max-w-none text-gray-700">
          <p className="whitespace-pre-line">{displayDescription}</p>
        </div>

        {/* Extra content sections from catalog (boosts topical relevance) */}
        {sections.length > 0 && (
          <div className="space-y-4 pt-2">
            {sections.map((section: any, idx: number) => (
              <div key={idx} className="border-t pt-4">
                {section.title && (
                  <h2 className="text-base font-bold text-gray-900 mb-1">
                    {section.title}
                  </h2>
                )}
                {section.content && (
                  <p className="text-sm text-gray-600 whitespace-pre-line">
                    {section.content}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 safe-area-pb flex gap-3 items-center z-50">
        <Link
          href={`/store/\( {store_slug}?add= \){product.id}`}
          className="flex-1 bg-purple-600 text-white font-bold py-3.5 rounded-xl text-center hover:bg-purple-700 transition-colors"
        >
          Add to Cart
        </Link>
      </div>
    </div>
  );
}