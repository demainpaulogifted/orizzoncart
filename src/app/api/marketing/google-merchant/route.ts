
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { getStoreUrl } from '@/lib/store-url';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const MARKETPLACE_URL = (
  process.env.NEXT_PUBLIC_MARKETPLACE_URL ||
  'https://marketplace.orizzoncart.com.ng'
).replace(/\/$/, '');

const PAGE_SIZE = 1000;
const MERCHANT_BATCH_SIZE = 100;

function escapeXml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function absoluteImageUrl(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) return '';

  const url = value.trim();

  if (/^https?:\/\//i.test(url)) return url;

  if (url.startsWith('/')) return `${MARKETPLACE_URL}${url}`;

  return '';
}

function getProductImage(images: unknown): string {
  if (!Array.isArray(images) || images.length === 0) return '';

  const first = images[0];

  if (typeof first === 'string') {
    return absoluteImageUrl(first);
  }

  if (first && typeof first === 'object' && 'url' in first) {
    return absoluteImageUrl((first as { url?: unknown }).url);
  }

  return '';
}

function getAvailability(product: any): string {
  const tracksInventory = product.track_inventory !== false;

  if (!tracksInventory) return 'in stock';

  const stock = Number(
    product.stock ?? product.inventory_quantity ?? 0
  );

  if (Number.isFinite(stock) && stock > 0) {
    return 'in stock';
  }

  if (product.allow_backorders === true) {
    return 'backorder';
  }

  return 'out of stock';
}

function makeProductItem(product: any, merchant: any): string | null {
  const name = String(product.name || '').trim();
  const price = Number(product.price);
  const imageUrl = getProductImage(product.images);

  // Google requires a title, valid price, product URL and image.
  if (!name || !Number.isFinite(price) || price <= 0 || !imageUrl) {
    return null;
  }

  if (!merchant.store_slug) return null;

  const storeUrl = getStoreUrl(merchant.store_slug).replace(/\/$/, '');
  const identifier = product.slug || product.id;
  const productUrl = `${storeUrl}/p/${encodeURIComponent(identifier)}`;

  const description = String(product.description || name)
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 5000);

  const category = String(product.category || '').trim();

  const fields = [
    `    <g:id>${escapeXml(product.id)}</g:id>`,
    `    <g:title>${escapeXml(name.slice(0, 150))}</g:title>`,
    `    <g:description>${escapeXml(description)}</g:description>`,
    `    <g:link>${escapeXml(productUrl)}</g:link>`,
    `    <g:image_link>${escapeXml(imageUrl)}</g:image_link>`,
    `    <g:price>${price.toFixed(2)} NGN</g:price>`,
    `    <g:availability>${getAvailability(product)}</g:availability>`,
    '    <g:condition>new</g:condition>',
  ];

  if (category) {
    fields.push(`    <g:product_type>${escapeXml(category)}</g:product_type>`);
  }

  return `  <item>\n${fields.join('\n')}\n  </item>`;
}

export async function GET() {
  try {
    const admin = createAdminClient();

    // Only stores approved and active on the OrizzonCart marketplace.
    const { data: merchants, error: merchantError } = await admin
      .from('merchants')
      .select('id, store_slug, store_name, merchant_type')
      .eq('is_on_marketplace', true)
      .eq('payment_receiving_status', 'ACTIVE')
      .eq('is_verified', true)
      .eq('is_active', true)
      .eq('merchant_type', 'physical');

    if (merchantError) {
      console.error('Google Merchant feed merchant query failed:', merchantError);
      return new Response('Could not load marketplace stores.', {
        status: 500,
      });
    }

    const items: string[] = [];
    const merchantList = merchants || [];

    // Batch stores to avoid oversized Supabase queries.
    for (
      let merchantOffset = 0;
      merchantOffset < merchantList.length;
      merchantOffset += MERCHANT_BATCH_SIZE
    ) {
      const merchantBatch = merchantList.slice(
        merchantOffset,
        merchantOffset + MERCHANT_BATCH_SIZE
      );

      const merchantIds = merchantBatch
        .map((merchant) => merchant.id)
        .filter(Boolean);

      if (merchantIds.length === 0) continue;

      const merchantById = new Map(
        merchantBatch.map((merchant) => [merchant.id, merchant])
      );

      // Paginate products so the feed does not stop at the first 1,000.
      for (let productOffset = 0; ; productOffset += PAGE_SIZE) {
        const { data: products, error: productError } = await admin
          .from('products')
          .select('*')
          .in('merchant_id', merchantIds)
          .eq('is_active', true)
          .eq('is_digital', false)
          .order('id', { ascending: true })
          .range(productOffset, productOffset + PAGE_SIZE - 1);

        if (productError) {
          console.error('Google Merchant feed product query failed:', productError);
          return new Response('Could not load marketplace products.', {
            status: 500,
          });
        }

        const productList = products || [];

        for (const product of productList) {
          const merchant = merchantById.get(product.merchant_id);
          if (!merchant) continue;

          const item = makeProductItem(product, merchant);
          if (item) items.push(item);
        }

        if (productList.length < PAGE_SIZE) break;
      }
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>OrizzonCart Marketplace</title>
  <link>${escapeXml(MARKETPLACE_URL)}</link>
  <description>Eligible physical products from approved OrizzonCart marketplace stores.</description>
${items.join('\n')}
</channel>
</rss>`;

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  } catch (error) {
    console.error('Google Merchant feed unexpected error:', error);

    return new Response('Google Merchant feed is temporarily unavailable.', {
      status: 500,
    });
  }
}
