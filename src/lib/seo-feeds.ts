import { createClient } from '@/lib/supabase/admin';

export const MAIN_URL = 'https://orizzoncart.com.ng';
export const MARKETPLACE_URL = 'https://marketplace.orizzoncart.com.ng';

export const BLOG_ARTICLES = [
  {
    title: 'How to Start an Online Store in Nigeria',
    slug: 'start-online-store-nigeria',
    description: 'Learn how to start an online store in Nigeria and build your online business.',
  },
  {
    title: 'How to Turn Your WhatsApp Business into a Fully Automated Store',
    slug: 'whatsapp-automated-store-nigeria',
    description: 'Discover how to automate your WhatsApp business and manage online orders.',
  },
  {
    title: 'Where to Sell Your Products Online in Nigeria',
    slug: 'where-to-sell-products-online-nigeria',
    description: 'Explore platforms and opportunities for selling products online in Nigeria.',
  },
  {
    title: 'How to Find Customers Online in Nigeria',
    slug: 'how-to-find-customers-online-nigeria',
    description: 'Practical ways to attract customers and grow your Nigerian online business.',
  },
];

export function escapeXml(value: unknown): string {
  return String(value ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function getProductImage(images: unknown): string {
  if (!Array.isArray(images)) return '';

  for (const image of images) {
    const candidate =
      typeof image === 'string'
        ? image
        : image && typeof image === 'object' && 'url' in image
          ? String((image as { url?: unknown }).url ?? '')
          : '';

    if (!candidate.trim()) continue;

    try {
      const url = candidate.startsWith('/')
        ? new URL(candidate, MARKETPLACE_URL)
        : new URL(candidate);

      if (url.protocol === 'https:' || url.protocol === 'http:') {
        return url.toString();
      }
    } catch {
      // Ignore invalid image URLs.
    }
  }

  return '';
}

export async function getMarketplaceProducts(): Promise<any[]> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return [];
  }

  const admin = createClient();

  const { data: merchants, error: merchantError } = await admin
    .from('merchants')
    .select('id')
    .eq('is_on_marketplace', true)
    .eq('payment_receiving_status', 'ACTIVE')
    .eq('is_verified', true)
    .eq('is_active', true)
    .eq('merchant_type', 'physical');

  if (merchantError) {
    console.error('Public product feed merchant query failed:', merchantError);
    throw new Error('Could not load eligible Marketplace stores.');
  }

  const merchantIds = (merchants || []).map((merchant) => merchant.id);
  if (!merchantIds.length) return [];

  const allProducts: any[] = [];
  const merchantBatchSize = 100;
  const pageSize = 1000;

  for (let offset = 0; offset < merchantIds.length; offset += merchantBatchSize) {
    const batch = merchantIds.slice(offset, offset + merchantBatchSize);

    for (let page = 0; ; page++) {
      const { data, error } = await admin
        .from('products')
        .select('*')
        .in('merchant_id', batch)
        .eq('is_active', true)
        .eq('is_digital', false)
        .order('id', { ascending: true })
        .range(page * pageSize, page * pageSize + pageSize - 1);

      if (error) {
        console.error('Public product feed product query failed:', error);
        throw new Error('Could not load Marketplace products.');
      }

      const products = data || [];
      allProducts.push(...products);

      if (products.length < pageSize) break;
    }
  }

  return allProducts.filter((product) => product.slug && product.name);
}

export function getMarketplaceProductUrl(product: any): string {
  if (!product?.slug) return '';
  return `${MARKETPLACE_URL}/marketplace/p/${encodeURIComponent(String(product.slug))}`;
}

export function getProductAvailability(product: any): string {
  if (product.track_inventory === false) return 'in_stock';

  const stock = Number(product.stock ?? product.inventory_quantity ?? 0);

  if (Number.isFinite(stock) && stock > 0) return 'in_stock';
  if (product.allow_backorders === true) return 'backorder';

  return 'out_of_stock';
}
