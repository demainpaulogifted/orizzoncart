import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/admin';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient();
  const baseUrl = 'https://orizzoncart.name.ng';

  // 1. Static Platform Pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
  ];

  // 2. Static Blog Posts (the ones that exist in your repo)
  const staticBlogPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/blog/start-online-store-nigeria`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/whatsapp-automated-store-nigeria`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  // 3. Active Merchants & Products
  const { data: activeMerchants } = await supabase
    .from('merchants')
    .select('id, store_slug, updated_at')
    .eq('payment_receiving_status', 'ACTIVE')
    .eq('is_active', true);

  const merchantPages: MetadataRoute.Sitemap = [];
  if (activeMerchants) {
    for (const merchant of activeMerchants) {
      const storeUrl = `https://${merchant.store_slug}.orizzoncart.name.ng`;
      merchantPages.push({
        url: storeUrl,
        lastModified: merchant.updated_at ? new Date(merchant.updated_at) : new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      });

      const { data: products } = await supabase
        .from('products')
        .select('id, slug, updated_at')
        .eq('merchant_id', merchant.id)
        .eq('is_active', true);

      if (products) {
        for (const product of products) {
          merchantPages.push({
            url: `\( {storeUrl}/p/ \){product.slug || product.id}`,
            lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
          });
        }
      }
    }
  }

  return [...staticPages, ...staticBlogPages, ...merchantPages];
}