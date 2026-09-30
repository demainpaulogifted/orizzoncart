import { notFound } from 'next/navigation';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { headers } from 'next/headers';
import { redirectToSubdomain } from '@/lib/store-redirect';
import type { Metadata } from 'next';
import ProductDetailClient from '@/components/storefront/ProductDetailClient';

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductDetailClient product={product} merchant={merchant} />
      </div>
    </div>
  );
}