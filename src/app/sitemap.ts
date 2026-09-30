import type { MetadataRoute } from 'next';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export const revalidate = 3600;

const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL || 'https://www.orizzoncart.name.ng'
).replace(/\/$/, '');

function absoluteUrl(base: string, path: string): string {
  return new URL(path, base + '/').toString();
}

function safeDate(value: string | null | undefined, fallback: Date): Date {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const mainSite: MetadataRoute.Sitemap = [
    { url: absoluteUrl(SITE_URL, '/'), lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: absoluteUrl(SITE_URL, '/signup'), lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: absoluteUrl(SITE_URL, '/about'), lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: absoluteUrl(SITE_URL, '/contact'), lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: absoluteUrl(SITE_URL, '/track-order'), lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: absoluteUrl(SITE_URL, '/terms'), lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
    { url: absoluteUrl(SITE_URL, '/privacy'), lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
  ];

  try {
    const admin = createAdminClient();

    // ONLY payment-activated stores — no products, no info pages for now
    const { data: merchants, error } = await admin
      .from('merchants')
      .select('store_slug, updated_at')
      .eq('payment_receiving_status', 'ACTIVE')
      .not('store_slug', 'is', null);

    if (error || !merchants?.length) return mainSite;

    const storeUrls: MetadataRoute.Sitemap = [];

    for (const m of merchants) {
      const slug = String(m.store_slug || '').trim();
      if (!slug) continue;

      storeUrls.push({
        url: 'https://' + slug + '.orizzoncart.name.ng/',
        lastModified: safeDate(m.updated_at, now),
        changeFrequency: 'daily',
        priority: 0.7,
      });
    }

    return [...mainSite, ...storeUrls];
  } catch (err) {
    console.error('Sitemap generation error:', err);
    return mainSite;
  }
}