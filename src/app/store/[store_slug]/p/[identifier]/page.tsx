import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import type { Metadata } from 'next';
import ProductDetailClient from '@/components/storefront/ProductDetailClient';
import { redirectToSubdomain } from '@/lib/store-redirect';

export const dynamic = 'force-dynamic';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function findProduct(
  admin: ReturnType<typeof createAdminClient>,
  merchantId: string,
  rawIdentifier: string
) {
  const identifier = decodeURIComponent(rawIdentifier).trim();
  if (!identifier) return null;

  // 1) by slug
  const { data: bySlug, error: slugErr } = await admin
    .from('products')
    .select('*')
    .eq('merchant_id', merchantId)
    .eq('is_active', true)
    .eq('slug', identifier)
    .maybeSingle();

  if (slugErr) {
    console.error('findProduct slug error', slugErr.message);
  }
  if (bySlug) return bySlug;

  // 2) by id (uuid only)
  if (UUID_REGEX.test(identifier)) {
    const { data: byId, error: idErr } = await admin
      .from('products')
      .select('*')
      .eq('merchant_id', merchantId)
      .eq('is_active', true)
      .eq('id', identifier)
      .maybeSingle();

    if (idErr) {
      console.error('findProduct id error', idErr.message);
    }
    if (byId) return byId;
  }

  return null;
}

type PageParams = Promise<{ store_slug: string; identifier: string }>;

export async function generateMetadata({
  params,
}: {
  params: PageParams;
}): Promise<Metadata> {
  try {
    const { store_slug, identifier } = await params;
    const admin = createAdminClient();

    const { data: merchant } = await admin
      .from('merchants')
      .select('id, store_name')
      .eq('store_slug', store_slug)
      .maybeSingle();

    if (!merchant) {
      return { title: 'Product Not Found', robots: { index: false, follow: false } };
    }

    const product = await findProduct(admin, merchant.id, identifier);
    if (!product) {
      return { title: 'Product Not Found', robots: { index: false, follow: false } };
    }

    return {
      title: product.name + ' | ' + merchant.store_name,
      description:
        product.description ||
        'Buy ' + product.name + ' at ' + merchant.store_name + '.',
      // noindex until product pages are stable
      robots: { index: false, follow: true },
    };
  } catch {
    return {
      title: 'Product',
      robots: { index: false, follow: false },
    };
  }
}

export default async function ProductPage({ params }: { params: PageParams }) {
  const { store_slug, identifier } = await params;

  const host = (await headers()).get('host') || '';
  const cleanId = encodeURIComponent(decodeURIComponent(identifier).trim());
  redirectToSubdomain(host, store_slug, '/p/' + cleanId);

  const admin = createAdminClient();

  const { data: merchant } = await admin
    .from('merchants')
    .select('*')
    .eq('store_slug', store_slug)
    .maybeSingle();

  if (!merchant) notFound();

  const product = await findProduct(admin, merchant.id, identifier);
  if (!product) notFound();

  // Minimal render — no reviews, no JSON-LD (those can wait until this returns 200)
  return <ProductDetailClient product={product} merchant={merchant} />;
}