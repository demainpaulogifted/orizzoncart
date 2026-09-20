import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { StorefrontClient } from '@/components/storefront/StorefrontClient';
import { redirectToSubdomain } from '@/lib/store-redirect';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { store_slug } = await params;
  const admin = createAdminClient();
  const { data: merchant } = await admin
    .from('merchants')
    .select('store_name, tagline, store_description, description')
    .eq('store_slug', store_slug)
    .maybeSingle();
  if (!merchant) return {};

  const desc =
    merchant.tagline ||
    merchant.store_description ||
    merchant.description ||
    `${merchant.store_name} — official online store.`;

  return {
    title: merchant.store_name,
    description: desc,
    openGraph: {
      title: merchant.store_name,
      description: desc,
      url: `https://${store_slug}.orizzoncart.name.ng`,
      siteName: merchant.store_name,
      type: 'website',
    },
    twitter: { card: 'summary', title: merchant.store_name, description: desc },
    alternates: { canonical: `https://${store_slug}.orizzoncart.name.ng` },
  };
}

export default async function StorePage({ params, searchParams }: any) {
  const { store_slug } = await params;

  // ENFORCE: platform domain can never display a store — subdomain only
  const host = (await headers()).get('host') || '';
  const qs = new URLSearchParams(await searchParams).toString();
  redirectToSubdomain(host, store_slug, '', qs);

  const admin = createAdminClient();
  const { data: merchant } = await admin.from('merchants').select('*').eq('store_slug', store_slug).maybeSingle();
  if (!merchant) notFound();

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
    description: merchant.tagline || `${merchant.store_name} — official online store.`,
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