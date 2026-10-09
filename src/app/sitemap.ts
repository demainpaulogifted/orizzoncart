import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/admin';

export const revalidate = 3600;

const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL || 'https://orizzoncart.name.ng'
).replace(/\/$/, '');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/marketplace`,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/marketplace/categories`,
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/about`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/contact`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/terms`,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/privacy`,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];

  const staticBlogPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/blog/start-online-store-nigeria`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/blog/whatsapp-automated-store-nigeria`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  const {
    data: activeMerchants,
    error: merchantsError,
  } = await supabase
    .from('merchants')
    .select('id, store_slug, updated_at')
    .eq('payment_receiving_status', 'ACTIVE')
    .eq('is_active', true)
    .eq('is_verified', true)
    .eq('is_on_marketplace', true);

  if (merchantsError) {
    console.error(
      'Failed to load eligible merchants for sitemap:',
      merchantsError.message
    );
  }

  const merchantPages: MetadataRoute.Sitemap = [];

  for (const merchant of activeMerchants || []) {
    if (!merchant.store_slug) continue;

    const storeUrl =
      `https://${merchant.store_slug}.orizzoncart.name.ng`;

    const lastModified = merchant.updated_at
      ? new Date(merchant.updated_at)
      : undefined;

    // Merchant storefront subdomain
    merchantPages.push({
      url: storeUrl,
      ...(lastModified ? { lastModified } : {}),
      changeFrequency: 'daily',
      priority: 0.9,
    });

    // Merchant's marketplace profile
    merchantPages.push({
      url: `${SITE_URL}/marketplace/store/${encodeURIComponent(merchant.store_slug)}`,
      ...(lastModified ? { lastModified } : {}),
      changeFrequency: 'daily',
      priority: 0.8,
    });

    // Active products belonging to this eligible merchant
    const {
      data: products,
      error: productsError,
    } = await supabase
      .from('products')
      .select('id, slug, updated_at')
      .eq('merchant_id', merchant.id)
      .eq('is_active', true);

    if (productsError) {
      console.error(
        `Failed to load products for merchant ${merchant.id}:`,
        productsError.message
      );
      continue;
    }

    for (const product of products || []) {
      const identifier = product.slug || product.id;

      if (!identifier) continue;

      merchantPages.push({
        url: `${storeUrl}/p/${encodeURIComponent(identifier)}`,
        ...(product.updated_at
          ? { lastModified: new Date(product.updated_at) }
          : {}),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  }

  return [...staticPages, ...staticBlogPages, ...merchantPages];
}