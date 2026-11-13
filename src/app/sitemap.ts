import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const MAIN_URL = 'https://orizzoncart.com.ng';
const MARKETPLACE_URL = 'https://marketplace.orizzoncart.com.ng';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const requestHeaders = await headers();
  const host = (requestHeaders.get('x-forwarded-host') || requestHeaders.get('host') || '').split(':')[0].toLowerCase();
  const isMarketplace = host === 'marketplace.orizzoncart.com.ng';

  if (!isMarketplace) {
    return [
      { url: MAIN_URL, changeFrequency: 'daily', priority: 1 },
      { url: `${MAIN_URL}/about`, changeFrequency: 'monthly', priority: 0.8 },
      { url: `${MAIN_URL}/contact`, changeFrequency: 'monthly', priority: 0.7 },
      { url: `${MAIN_URL}/terms`, changeFrequency: 'yearly', priority: 0.5 },
      { url: `${MAIN_URL}/privacy`, changeFrequency: 'yearly', priority: 0.5 },
      { url: `${MAIN_URL}/orizzoncart-journey`, changeFrequency: 'weekly', priority: 0.9 },
      { url: `${MAIN_URL}/platform`, changeFrequency: 'monthly', priority: 0.7 },
      { url: `${MAIN_URL}/blog/start-online-store-nigeria`, changeFrequency: 'monthly', priority: 0.8 },
      { url: `${MAIN_URL}/blog/where-to-sell-products-online-nigeria`, changeFrequency: 'monthly', priority: 0.9 },
      { url: `${MAIN_URL}/blog/how-to-find-customers-online-nigeria`, changeFrequency: 'monthly', priority: 0.9 },
      { url: `${MAIN_URL}/blog/whatsapp-automated-store-nigeria`, changeFrequency: 'monthly', priority: 0.8 },
    ];
  }

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${MARKETPLACE_URL}/marketplace`, changeFrequency: 'hourly', priority: 1 },
    { url: `${MARKETPLACE_URL}/marketplace/categories`, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${MARKETPLACE_URL}/marketplace/stores`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${MARKETPLACE_URL}/marketplace/return-policy`, changeFrequency: 'monthly', priority: 0.7 },
  ];

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return staticPages;
  }

  const supabase = createClient();

  const { data: merchants, error: merchantError } = await supabase
    .from('merchants')
    .select('id, store_slug, updated_at')
    .eq('payment_receiving_status', 'ACTIVE')
    .eq('is_active', true)
    .eq('is_verified', true)
    .eq('is_on_marketplace', true);

  if (merchantError) {
    console.error('Marketplace sitemap merchant error:', merchantError.message);
  }

  const eligibleMerchants = merchants || [];
  const merchantIds = eligibleMerchants.map((merchant) => merchant.id);

  const merchantPages: MetadataRoute.Sitemap = eligibleMerchants
    .filter((merchant) => merchant.store_slug)
    .map((merchant) => ({
      url: `${MARKETPLACE_URL}/marketplace/store/${merchant.store_slug}`,
      ...(merchant.updated_at ? { lastModified: new Date(merchant.updated_at) } : {}),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));

  let productPages: MetadataRoute.Sitemap = [];

  if (merchantIds.length > 0) {
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('slug, updated_at')
      .eq('is_active', true)
      .in('merchant_id', merchantIds);

    if (productError) {
      console.error('Marketplace sitemap product error:', productError.message);
    }

    productPages = (products || [])
      .filter((product) => product.slug)
      .map((product) => ({
        url: `${MARKETPLACE_URL}/marketplace/p/${product.slug}`,
        ...(product.updated_at ? { lastModified: new Date(product.updated_at) } : {}),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
  }

  return [...staticPages, ...merchantPages, ...productPages];
}
