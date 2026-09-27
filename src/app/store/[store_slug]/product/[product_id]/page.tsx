import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { redirectToSubdomain } from '@/lib/store-redirect';
import { ProductDetailClient } from '@/components/storefront/ProductDetailClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { store_slug, product_id } = await params;
  const admin = createAdminClient();
  
  // Fetch product
  const { data: product } = await admin
    .from('products')
    .select('name, description, price, images')
    .eq('id', product_id)
    .maybeSingle();

  // Fetch merchant
  const { data: merchant } = await admin
    .from('merchants')
    .select('store_name')
    .eq('store_slug', store_slug)
    .maybeSingle();

  if (!product || !merchant) return {};

  return {
    title: product.name,
    description: product.description || `Buy ${product.name} at ${merchant.store_name}`,
    openGraph: {
      title: product.name,
      description: product.description || '',
      images: product.images?.[0] ? [product.images[0]] : [],
      type: 'product',
    },
  };
}

export default async function ProductPage({ params }: any) {
  const { store_slug, product_id } = await params;

  // Enforce subdomain only
  const host = (await headers()).get('host') || '';
  redirectToSubdomain(host, store_slug, '', '');

  const admin = createAdminClient();

  // Fetch product
  const { data: product } = await admin
    .from('products')
    .select('*')
    .eq('id', product_id)
    .eq('is_active', true)
    .maybeSingle();

  if (!product) notFound();

  // Fetch merchant
  const { data: merchant } = await admin
    .from('merchants')
    .select('*')
    .eq('store_slug', store_slug)
    .maybeSingle();

  if (!merchant) notFound();

  // Fetch related products
  const { data: relatedProducts } = await admin
    .from('products')
    .select('*')
    .eq('merchant_id', merchant.id)
    .eq('is_active', true)
    .neq('id', product_id)
    .limit(4);

  return (
    <ProductDetailClient
      product={product}
      merchant={merchant}
      relatedProducts={relatedProducts || []}
    />
  );
}