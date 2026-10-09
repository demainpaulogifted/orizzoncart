
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { StorefrontClient } from '@/components/storefront/StorefrontClient';
import { redirectToSubdomain } from '@/lib/store-redirect';
import { StoreReviews } from '@/components/reviews/StoreReviews';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ store_slug: string }>;
}): Promise<Metadata> {
  const { store_slug } = await params;
  const admin = createAdminClient();

  // Request only the columns needed for storefront metadata.
  const { data: merchant, error } = await admin
    .from('merchants')
    .select(
      'store_name, store_description, tagline, payment_receiving_status'
    )
    .eq('store_slug', store_slug)
    .maybeSingle();

  if (error) {
    console.error('[Store metadata query error]', {
      store_slug,
      message: error.message,
      code: error.code,
    });
  }

  // Keep the browser title meaningful even if metadata lookup returns no row.
  const fallbackName =
    store_slug
      .split('-')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ') || 'Online Store';

  const storeName = merchant?.store_name || fallbackName;

  const storeDesc =
    merchant?.store_description ||
    merchant?.tagline ||
    'Shop at ' +
      storeName +
      ' - Quality products, fast delivery, and secure payments.';

  const storeUrl = `https://${store_slug}.orizzoncart.name.ng`;

  return {
    title: {
      absolute: storeName,
    },
    description: storeDesc,
    alternates: { canonical: storeUrl },
    openGraph: {
      title: storeName,
      description: storeDesc,
      url: storeUrl,
      siteName: storeName,
      type: 'website',
      locale: 'en_NG',
    },
    twitter: {
      card: 'summary_large_image',
      title: storeName,
      description: storeDesc,
    },
    robots: {
      index: merchant?.payment_receiving_status === 'ACTIVE',
      follow: true,
    },
  };
}

export default async function StorePage({
  params,
  searchParams,
}: {
  params: Promise<{ store_slug: string }>;
  searchParams: Promise<
    Record<string, string | string[] | undefined>
  >;
}) {
  const { store_slug } = await params;

  const host = (await headers()).get('host') || '';
  const search = await searchParams;
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(search)) {
    if (typeof value === 'string') {
      query.set(key, value);
    } else if (Array.isArray(value)) {
      value.forEach((item) => query.append(key, item));
    }
  }

  redirectToSubdomain(host, store_slug, '', query.toString());

  const admin = createAdminClient();

  const { data: merchant, error: merchantError } = await admin
    .from('merchants')
    .select('*')
    .eq('store_slug', store_slug)
    .maybeSingle();

  if (merchantError) {
    console.error('[Storefront merchant query error]', {
      store_slug,
      message: merchantError.message,
      code: merchantError.code,
    });
    throw new Error('Unable to load this storefront.');
  }

  if (!merchant || !merchant.is_active) {
    notFound();
  }

  const expired =
    merchant.maintenance_expires_at &&
    new Date(merchant.maintenance_expires_at) < new Date();

  const isShowcaseMode =
    merchant.cart_status === 'LOCKED' ||
    merchant.checkout_status !== 'ENABLED' ||
    merchant.payment_receiving_status !== 'ACTIVE' ||
    !!expired;

  const { data: products, error: productsError } = await admin
    .from('products')
    .select('*')
    .eq('merchant_id', merchant.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (productsError) {
    console.error('[Storefront products query error]', {
      store_slug,
      message: productsError.message,
      code: productsError.code,
    });
  }

  const { data: pages, error: pagesError } = await admin
    .from('store_pages')
    .select('title, slug')
    .eq('merchant_id', merchant.id)
    .eq('is_active', true)
    .order('created_at');

  if (pagesError) {
    console.error('[Storefront pages query error]', {
      store_slug,
      message: pagesError.message,
      code: pagesError.code,
    });
  }

  const styleVars = {
    '--color-primary': '#D4C5B5',
    '--color-secondary': '#8B7355',
    '--color-bg': '#FFFFFF',
    '--color-surface': '#F9F9F9',
    '--color-text': '#1A1A1A',
    '--color-text-muted': '#666666',
  } as React.CSSProperties;

  const storeSchema = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: merchant.store_name,
    url: `https://${store_slug}.orizzoncart.name.ng`,
    description:
      merchant.store_description ||
      merchant.tagline ||
      merchant.store_name + ' — official online store.',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(storeSchema),
        }}
      />
      <StorefrontClient
        merchant={merchant}
        products={products || []}
        isShowcaseMode={isShowcaseMode}
        pages={pages || []}
        styleVars={styleVars}
        reviewsSlot={
          <div className="max-w-6xl mx-auto px-4 py-8">
            <StoreReviews merchantId={merchant.id} />
          </div>
        }
      />
    </>
  );
}
