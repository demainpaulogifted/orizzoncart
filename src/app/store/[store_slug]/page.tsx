import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { StorefrontClient } from '@/components/storefront/StorefrontClient';
import { redirectToSubdomain } from '@/lib/store-redirect';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ store_slug: string }> }): Promise<Metadata> {
  const { store_slug } = await params;
  const admin = createAdminClient();
  
  const { data: merchant } = await admin
    .from('merchants')
    .select('store_name, store_description, tagline, description, is_active, payment_receiving_status')
    .eq('store_slug', store_slug)
    .maybeSingle();

  // Only show "Store Not Found" when the store truly does not exist
  if (!merchant) {
    return {
      title: 'Store Not Found',
      description: 'This store does not exist or is no longer active.',
      robots: { index: false, follow: false },
    };
  }

  const storeName = merchant.store_name || 'Online Store';
  const storeDesc = merchant.store_description || merchant.tagline || merchant.description || 
                    `Shop at ${storeName} - Quality products, fast delivery, and secure payments.`;
  
  const storeUrl = `https://${store_slug}.orizzoncart.name.ng`;

  return {
    title: {
      absolute: storeName,   // forces the real store name in the tab
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
      index: merchant.payment_receiving_status === 'ACTIVE',
      follow: true,
    },
  };
}

export default async function StorePage({ params, searchParams }: any) {
  const { store_slug } = await params;

  const host = (await headers()).get('host') || '';
  const qs = new URLSearchParams(await searchParams).toString();
  redirectToSubdomain(host, store_slug, '', qs);

  const admin = createAdminClient();
  const { data: merchant } = await admin.from('merchants').select('*').eq('store_slug', store_slug).maybeSingle();
  
  if (!merchant || !merchant.is_active) {
    notFound();
  }

  const expired = merchant.maintenance_expires_at && new Date(merchant.maintenance_expires_at) < new Date();
  const isShowcaseMode =
    merchant.cart_status === 'LOCKED' ||
    merchant.checkout_status !== 'ENABLED' ||
    merchant.payment_receiving_status !== 'ACTIVE' ||
    !!expired;

  const { data: products } = await admin
    .from('products')
    .select('*')
    .eq('merchant_id', merchant.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  const { data: pages } = await admin
    .from('store_pages')
    .select('title, slug')
    .eq('merchant_id', merchant.id)
    .eq('is_active', true)
    .order('created_at');

  const styleVars = {
    '--color-primary': '#7c3aed',
    '--color-surface': '#f8fafc',
    '--color-text': '#111827',
  } as React.CSSProperties;

  const storeSchema = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: merchant.store_name,
    url: `https://${store_slug}.orizzoncart.name.ng`,
    description: merchant.store_description || merchant.tagline || `${merchant.store_name} — official online store.`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(storeSchema) }} />
      <StorefrontClient
        merchant={merchant}
        products={products || []}
        isShowcaseMode={isShowcaseMode}
        pages={pages || []}
        styleVars={styleVars}
      />
    </>
  );
}