import type { MetadataRoute } from 'next';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://orizzoncart.name.ng').replace(/\/$/, '');
  const admin = createAdminClient();
  const now = new Date();

  // Only include LIVE static pages - removed placeholders that return 404
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${appUrl}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${appUrl}/signup`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${appUrl}/track-order`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${appUrl}/stores`, lastModified: now, changeFrequency: 'daily', priority: 0.85 }, // New Stores Index
  ];

  try {
    const { data: merchants } = await admin
      .from('merchants')
      .select('id, store_slug, updated_at')
      .not('store_slug', 'is', null);

    if (!merchants?.length) return staticPages;

    const merchantIds = merchants.map((m) => m.id);
    
    // Fetch products with images for Google Images SEO
    const { data: products } = await admin
      .from('products')
      .select('id, merchant_id, updated_at, images, name')
      .in('merchant_id', merchantIds)
      .eq('is_active', true);

    const productsByMerchant = new Map<string, any[]>();
    for (const p of products || []) {
      const list = productsByMerchant.get(p.merchant_id) || [];
      list.push(p);
      productsByMerchant.set(p.merchant_id, list);
    }

    const storeUrls: MetadataRoute.Sitemap = [];
    for (const m of merchants) {
      if (!m.store_slug) continue;

      // Store Page
      storeUrls.push({
        url: `${appUrl}/store/${m.store_slug}`,
        lastModified: m.updated_at ? new Date(m.updated_at) : now,
        changeFrequency: 'daily',
        priority: 0.9,
      });

      // Product Pages with Image Support for Google Images
      const storeProducts = productsByMerchant.get(m.id) || [];
      for (const p of storeProducts) {
        const imageUrl = p.images?.[0]?.url;
        storeUrls.push({
          url: `${appUrl}/store/${m.store_slug}/p/${p.id}`,
          lastModified: p.updated_at ? new Date(p.updated_at) : now,
          changeFrequency: 'weekly',
          priority: 0.7,
          ...(imageUrl && {
            images: [{ url: imageUrl, title: p.name }]
          })
        });
      }
    }

    return [...staticPages, ...storeUrls];
  } catch (err) {
    console.error('sitemap error:', err);
    // Graceful fallback: never break SEO if DB fails
    return staticPages;
  }
}