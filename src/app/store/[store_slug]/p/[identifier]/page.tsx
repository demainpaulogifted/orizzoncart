import { notFound } from 'next/navigation';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import type { Metadata } from 'next';
import ProductDetailClient from '@/components/storefront/ProductDetailClient';

export const dynamic = 'force-dynamic';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function safeImage(images: any): string | null {
  const first = Array.isArray(images) ? images[0] : images;
  const url = typeof first === 'string' ? first : first && typeof first === 'object' ? first.url : null;
  return url && (url.startsWith('http') || url.startsWith('/')) ? url : null;
}

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

  const imageUrl = safeImage(product.images);
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

  const { data: merchant } = await admin
    .from('merchants')
    .select('*')
    .eq('store_slug', store_slug)
    .maybeSingle();
  if (!merchant) notFound();

  const product = await findProduct(admin, merchant.id, decodeURIComponent(identifier));
  if (!product) notFound();

  return <ProductDetailClient product={product} merchant={merchant} />;
}