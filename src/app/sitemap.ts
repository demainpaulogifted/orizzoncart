import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/admin';

export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient();
  const baseUrl = 'https://orizzoncart.name.ng';

  // Static platform pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/track-order`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];

  // Fetch ONLY active merchants (paid activation fee)
  const { data: activeMerchants, error: merchantError } = await supabase
    .from('merchants')
    .select('id, store_slug, store_name, updated_at')
    .eq('payment_receiving_status', 'ACTIVE')
    .eq('is_active', true);

  if (merchantError || !activeMerchants) {
    console.error('Failed to fetch merchants:', merchantError);
    return staticPages;
  }

  // Build merchant and product URLs
  const merchantPages: MetadataRoute.Sitemap = [];

  for (const merchant of activeMerchants) {
    const storeUrl = `https://${merchant.store_slug}.orizzoncart.name.ng`;

    // Add store homepage
    merchantPages.push({
      url: storeUrl,
      lastModified: merchant.updated_at ? new Date(merchant.updated_at) : new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    });

    // Fetch active products for this merchant
    const { data: products } = await supabase
      .from('products')
      .select('id, slug, name, updated_at')
      .eq('merchant_id', merchant.id)
      .eq('is_active', true);

    if (products) {
      for (const product of products) {
        const productUrl = `${storeUrl}/p/${product.slug || product.id}`;
        merchantPages.push({
          url: productUrl,
          lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
    }
  }

  return [...staticPages, ...merchantPages];
}
