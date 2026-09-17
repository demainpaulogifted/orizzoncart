import type { MetadataRoute } from 'next';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const app = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.orizzoncart.name.ng').replace(/\/$/, '');
  const admin = createAdminClient();
  const now = new Date();

  const mainSite: MetadataRoute.Sitemap = [
    { url: `${app}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${app}/signup`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${app}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${app}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${app}/track-order`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${app}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${app}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
  ];

  const feed: MetadataRoute.Sitemap = [];

  try {
    const { data: merchants } = await admin
      .from('merchants')
      .select('id, store_slug, updated_at')
      .eq('payment_receiving_status', 'ACTIVE')
      .not('store_slug', 'is', null);

    if (!merchants?.length) return mainSite;

    const merchantIds = merchants.map((m) => m.id);

    const { data: products } = await admin
      .from('products')
      .select('id, merchant_id, updated_at, images, name, slug')
      .in('merchant_id', merchantIds)
      .eq('is_active', true);

    const { data: pages } = await admin
      .from('store_pages')
      .select('merchant_id, slug, updated_at')
      .in('merchant_id', merchantIds)
      .eq('is_active', true);

    const productsByMerchant = new Map<string, any[]>();
    for (const p of products || []) {
      const list = productsByMerchant.get(p.merchant_id) || [];
      list.push(p);
      productsByMerchant.set(p.merchant_id, list);
    }

    const pagesByMerchant = new Map<string, any[]>();
    for (const pg of pages || []) {
      const list = pagesByMerchant.get(pg.merchant_id) || [];
      list.push(pg);
      pagesByMerchant.set(pg.merchant_id, list);
    }

    for (const m of merchants) {
      if (!m.store_slug) continue;
      const base = `https://${m.store_slug}.orizzoncart.name.ng`;

      feed.push({
        url: `${base}/`,
        lastModified: m.updated_at ? new Date(m.updated_at) : now,
        changeFrequency: 'daily',
        priority: 0.6,
      });

      for (const p of productsByMerchant.get(m.id) || []) {
        const imageUrls = (p.images || []).slice(0, 3).map((i: any) => (typeof i === 'string' ? i : i.url)).filter(Boolean);
        feed.push({
          url: `${base}/p/${p.slug || p.id}`,
          lastModified: p.updated_at ? new Date(p.updated_at) : now,
          changeFrequency: 'weekly',
          priority: 0.5,
          ...(imageUrls.length > 0 && { images: imageUrls.map((url: string) => ({ url, title: p.name })) }),
        } as any);
      }

      for (const pg of pagesByMerchant.get(m.id) || []) {
        feed.push({
          url: `${base}/info/${pg.slug}`,
          lastModified: pg.updated_at ? new Date(pg.updated_at) : now,
          changeFrequency: 'monthly',
          priority: 0.4,
        });
      }
    }

    return [...mainSite, ...feed];
  } catch (err) {
    console.error('sitemap error:', err);
    return mainSite;
  }
}