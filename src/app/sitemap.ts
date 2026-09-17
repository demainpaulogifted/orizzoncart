import type { MetadataRoute } from 'next';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export const revalidate = 3600;

const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL || 'https://www.orizzoncart.name.ng'
).replace(/\/$/, '');

function absoluteUrl(base: string, path: string): string {
  return new URL(path, `${base}/`).toString();
}

function safeDate(value: string | null | undefined, fallback: Date): Date {
  if (!value) return fallback;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const mainSite: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl(SITE_URL, '/'),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: absoluteUrl(SITE_URL, '/about'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: absoluteUrl(SITE_URL, '/contact'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: absoluteUrl(SITE_URL, '/track-order'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: absoluteUrl(SITE_URL, '/terms'),
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: absoluteUrl(SITE_URL, '/privacy'),
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];

  const feed: MetadataRoute.Sitemap = [];

  try {
    const admin = createAdminClient();

    const { data: merchants, error: merchantsError } = await admin
      .from('merchants')
      .select('id, store_slug, updated_at')
      .eq('payment_receiving_status', 'ACTIVE')
      .not('store_slug', 'is', null);

    if (merchantsError) {
      console.error('Sitemap merchants error:', merchantsError);
      return mainSite;
    }

    if (!merchants?.length) {
      return mainSite;
    }

    const merchantIds = merchants.map((merchant) => merchant.id);

    const [{ data: products, error: productsError }, { data: pages, error: pagesError }] =
      await Promise.all([
        admin
          .from('products')
          .select('id, merchant_id, updated_at, images, slug')
          .in('merchant_id', merchantIds)
          .eq('is_active', true),

        admin
          .from('store_pages')
          .select('merchant_id, slug, updated_at')
          .in('merchant_id', merchantIds)
          .eq('is_active', true),
      ]);

    if (productsError) {
      console.error('Sitemap products error:', productsError);
    }

    if (pagesError) {
      console.error('Sitemap pages error:', pagesError);
    }

    const productsByMerchant = new Map<string, any[]>();

    for (const product of products || []) {
      const list = productsByMerchant.get(product.merchant_id) || [];
      list.push(product);
      productsByMerchant.set(product.merchant_id, list);
    }

    const pagesByMerchant = new Map<string, any[]>();

    for (const page of pages || []) {
      const list = pagesByMerchant.get(page.merchant_id) || [];
      list.push(page);
      pagesByMerchant.set(page.merchant_id, list);
    }

    for (const merchant of merchants) {
      if (!merchant.store_slug) continue;

      const storeSlug = String(merchant.store_slug).trim();

      if (!storeSlug) continue;

      const base = `https://${storeSlug}.orizzoncart.name.ng`;

      feed.push({
        url: `${base}/`,
        lastModified: safeDate(merchant.updated_at, now),
        changeFrequency: 'daily',
        priority: 0.6,
      });

      for (const product of productsByMerchant.get(merchant.id) || []) {
        const productSlug = String(product.slug || product.id || '').trim();

        if (!productSlug) continue;

        const imageUrls = (Array.isArray(product.images) ? product.images : [])
          .slice(0, 3)
          .map((image: unknown) => {
            if (typeof image === 'string') return image;
            if (
              image &&
              typeof image === 'object' &&
              'url' in image &&
              typeof image.url === 'string'
            ) {
              return image.url;
            }
            return null;
          })
          .filter((url): url is string => Boolean(url));

        feed.push({
          url: `${base}/p/${encodeURIComponent(productSlug)}`,
          lastModified: safeDate(product.updated_at, now),
          changeFrequency: 'weekly',
          priority: 0.5,
          ...(imageUrls.length > 0 ? { images: imageUrls } : {}),
        });
      }

      for (const page of pagesByMerchant.get(merchant.id) || []) {
        const pageSlug = String(page.slug || '').trim();

        if (!pageSlug) continue;

        feed.push({
          url: `${base}/info/${encodeURIComponent(pageSlug)}`,
          lastModified: safeDate(page.updated_at, now),
          changeFrequency: 'monthly',
          priority: 0.4,
        });
      }
    }

    return [...mainSite, ...feed];
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return mainSite;
  }
}