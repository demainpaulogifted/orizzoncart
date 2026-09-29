import { notFound } from 'next/navigation';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import type { Metadata } from 'next';
import ProductDetailClient from '@/components/storefront/ProductDetailClient';

export async function generateMetadata({ params }: { params: Promise<{ store_slug: string; identifier: string }> }): Promise<Metadata> {
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
    .or(`slug.eq.${decodedIdentifier},id.eq.${decodedIdentifier}`)
    .maybeSingle();

  if (!product) return { title: 'Product Not Found' };

  const imageUrl = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null;

  return {
    title: `${product.name} | ${merchant.store_name}`,
    description: product.description || `Buy ${product.name} at ${merchant.store_name}.`,
    openGraph: {
      title: product.name,
      description: product.description,
      url: `https://${store_slug}.orizzoncart.name.ng/p/${encodeURIComponent(product.slug || product.id)}`,
      images: imageUrl ? [{ url: imageUrl, width: 800, height: 600 }] : [],
      type: 'website',
    },
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

  const decodedIdentifier = decodeURIComponent(identifier);

  const { data: product } = await admin
    .from('products')
    .select('*')
    .eq('merchant_id', merchant.id)
    .eq('is_active', true)
    .or(`slug.eq.${decodedIdentifier},id.eq.${decodedIdentifier}`)
    .maybeSingle();

  if (!product) notFound();

  return <ProductDetailClient product={product} merchant={merchant} />;
}
