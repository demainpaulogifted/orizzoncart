import type { MetadataRoute } from 'next';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://orizzoncart.name.ng').replace(/\/$/, '');
  const admin = createAdminClient();

  const { data: merchants } = await admin.from('merchants').select('store_slug, id, updated_at');
  const urls: MetadataRoute.Sitemap = [
    { url: `${appUrl}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${appUrl}/signup`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${appUrl}/track-order`, changeFrequency: 'monthly', priority: 0.7 },
  ];

  for (const m of merchants || []) {
    urls.push({
      url: `${appUrl}/store/${m.store_slug}`,
      lastModified: m.updated_at ? new Date(m.updated_at) : new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    });
    
    const { data: products } = await admin
      .from('products')
      .select('id, updated_at')
      .eq('merchant_id', m.id)
      .eq('is_active', true);
    
    for (const p of products || []) {
      urls.push({
        url: `${appUrl}/store/${m.store_slug}/p/${p.id}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  }
  
  return urls;
}