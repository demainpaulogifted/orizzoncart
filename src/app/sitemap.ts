import type { MetadataRoute } from 'next';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://orizzoncart.name.ng').replace(/\/$/, '');
  const admin = createAdminClient();

  const { data: merchants } = await admin.from('merchants').select('store_slug, updated_at');

  const storeUrls: MetadataRoute.Sitemap = (merchants || []).map((m: any) => ({
    url: `${appUrl}/store/${m.store_slug}`,
    lastModified: m.updated_at ? new Date(m.updated_at) : new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  return [
    { url: `${appUrl}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${appUrl}/signup`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${appUrl}/track-order`, changeFrequency: 'monthly', priority: 0.7 },
    ...storeUrls,
  ];
}