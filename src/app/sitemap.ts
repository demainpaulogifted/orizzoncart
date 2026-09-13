import type { MetadataRoute } from 'next';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export const revalidate = 3600; // rebuild at most once per hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://orizzoncart.name.ng').replace(
    /\/$/,
    ''
  );

  const now = new Date();

  // Public marketing + utility pages (add help/blog when those routes exist)
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${appUrl}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${appUrl}/signup`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${appUrl}/track-order`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    // Legal / trust (include once you create these routes)
    { url: `${appUrl}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${appUrl}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${appUrl}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${appUrl}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    // Content hubs (include once you create these routes)
    { url: `${appUrl}/help`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${appUrl}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
  ];

  try {
    const admin = createAdminClient();

    // One query for stores
    const { data: merchants } = await admin
      .from('merchants')
      .select('id, store_slug, updated_at')
      .not('store_slug', 'is', null);

    if (!merchants?.length) {
      return staticPages;
    }

    const merchantIds = merchants.map((m) => m.id);

    // One query for all active products (avoids N+1)
    const { data: products } = await admin
      .from('products')
      .select('id, merchant_id, updated_at')
      .in('merchant_id', merchantIds)
      .eq('is_active', true);

    const productsByMerchant = new Map<string, { id: string; updated_at: string | null }[]>();
    for (const p of products || []) {
      const list = productsByMerchant.get(p.merchant_id) || [];
      list.push({ id: p.id, updated_at: p.updated_at });
      productsByMerchant.set(p.merchant_id, list);
    }

    const storeUrls: MetadataRoute.Sitemap = [];

    for (const m of merchants) {
      if (!m.store_slug) continue;

      storeUrls.push({
        url: `\( {appUrl}/store/ \){m.store_slug}`,
        lastModified: m.updated_at ? new Date(m.updated_at) : now,
        changeFrequency: 'daily',
        priority: 0.9,
      });

      const storeProducts = productsByMerchant.get(m.id) || [];
      for (const p of storeProducts) {
        storeUrls.push({
          url: `\( {appUrl}/store/ \){m.store_slug}/p/${p.id}`,
          lastModified: p.updated_at ? new Date(p.updated_at) : now,
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
    }

    return [...staticPages, ...storeUrls];
  } catch (err) {
    console.error('sitemap error:', err);
    // Never break SEO if DB fails — still return static pages
    return staticPages;
  }
}