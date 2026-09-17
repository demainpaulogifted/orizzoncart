import type { MetadataRoute } from 'next';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export const revalidate = 3600;

const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL || 'https://www.orizzoncart.name.ng'
).replace(/\/$/, '');

type MerchantRow = {
  id: string;
  store_slug: string | null;
  updated_at: string | null;
};

type ProductRow = {
  id: string;
  merchant_id: string;
  updated_at: string | null;
  images: unknown;
  slug: string | null;
};

type StorePageRow = {
  merchant_id: string;
  slug: string | null;
  updated_at: string | null;
};

function absoluteUrl(base: string, path: string): string {
  return new URL(path, `${base}/`).toString();
}

function safeDate(
  value: string | null | undefined,
  fallback: Date
): Date {
  if (!value) return fallback;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? fallback : date;
}

function getImageUrls(images: unknown): string[] {
  if (!Array.isArray(images)) {
    return [];
  }

  return images
    .slice(0, 3)
    .map((image: unknown): string | null => {
      if (typeof image === 'string' && image.trim()) {
        return image.trim();
      }

      if (
        image &&
        typeof image === 'object' &&
        'url' in image &&
        typeof image.url === 'string' &&
        image.url.trim()
      ) {
        return image.url.trim();
      }

      return null;
    })
    .filter(
      (url: string | null): url is string => url !== null
    );
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

  try {
    const admin = createAdminClient();

    const {
      data: merchantsData,
      error: merchantsError,
    } = await admin
      .from('merchants')
      .select('id, store_slug, updated_at')
      .eq('payment_receiving_status', 'ACTIVE')
      .not('store_slug', 'is', null);

    if (merchantsError) {
      console.error(
        'Sitemap merchants error:',
        merchantsError
      );

      return mainSite;
    }

    const merchants =
      (merchantsData || []) as MerchantRow[];

    if (merchants.length === 0) {
      return mainSite;
    }

    const merchantIds = merchants.map(
      (merchant) => merchant.id
    );

    const [
      { data: productsData, error: productsError },
      { data: pagesData, error: pagesError },
    ] = await Promise.all([
      admin
        .from('products')
        .select(
          'id, merchant_id, updated_at, images, slug'
        )
        .in('merchant_id', merchantIds)
        .eq('is_active', true),

      admin
        .from('store_pages')
        .select(
          'merchant_id, slug, updated_at'
        )
        .in('merchant_id', merchantIds)
        .eq('is_active', true),
    ]);

    if (productsError) {
      console.error(
        'Sitemap products error:',
        productsError
      );
    }

    if (pagesError) {
      console.error(
        'Sitemap pages error:',
        pagesError
      );
    }

    const products =
      (productsData || []) as ProductRow[];

    const pages =
      (pagesData || []) as StorePageRow[];

    const productsByMerchant =
      new Map<string, ProductRow[]>();

    for (const product of products) {
      const list =
        productsByMerchant.get(product.merchant_id) ||
        [];

      list.push(product);

      productsByMerchant.set(
        product.merchant_id,
        list
      );
    }

    const pagesByMerchant =
      new Map<string, StorePageRow[]>();

    for (const page of pages) {
      const list =
        pagesByMerchant.get(page.merchant_id) ||
        [];

      list.push(page);

      pagesByMerchant.set(
        page.merchant_id,
        list
      );
    }

    const feed: MetadataRoute.Sitemap = [];

    for (const merchant of merchants) {
      const storeSlug =
        String(merchant.store_slug || '').trim();

      if (!storeSlug) {
        continue;
      }

      const base =
        `https://${storeSlug}.orizzoncart.name.ng`;

      /*
       * Store homepage
       */
      feed.push({
        url: `${base}/`,
        lastModified: safeDate(
          merchant.updated_at,
          now
        ),
        changeFrequency: 'daily',
        priority: 0.6,
      });

      /*
       * Products
       */
      const merchantProducts =
        productsByMerchant.get(merchant.id) || [];

      for (const product of merchantProducts) {
        const productSlug =
          String(
            product.slug || product.id || ''
          ).trim();

        if (!productSlug) {
          continue;
        }

        const imageUrls =
          getImageUrls(product.images);

        feed.push({
          url:
            `${base}/p/` +
            encodeURIComponent(productSlug),

          lastModified: safeDate(
            product.updated_at,
            now
          ),

          changeFrequency: 'weekly',

          priority: 0.5,

          ...(imageUrls.length > 0
            ? { images: imageUrls }
            : {}),
        });
      }

      /*
       * Store information pages
       */
      const merchantPages =
        pagesByMerchant.get(merchant.id) || [];

      for (const page of merchantPages) {
        const pageSlug =
          String(page.slug || '').trim();

        if (!pageSlug) {
          continue;
        }

        feed.push({
          url:
            `${base}/info/` +
            encodeURIComponent(pageSlug),

          lastModified: safeDate(
            page.updated_at,
            now
          ),

          changeFrequency: 'monthly',

          priority: 0.4,
        });
      }
    }

    return [...mainSite, ...feed];
  } catch (error) {
    console.error(
      'Sitemap generation error:',
      error
    );

    return mainSite;
  }
}