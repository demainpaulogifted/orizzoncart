import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://orizzoncart.name.ng';

function escapeXml(value: string): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function absoluteUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const merchantId = searchParams.get('merchant_id');
  const platform = searchParams.get('platform') || 'json';

  if (!merchantId) {
    return NextResponse.json({ error: 'merchant_id is required' }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: merchant } = await supabase
    .from('merchants')
    .select('store_slug, business_name')
    .eq('id', merchantId)
    .maybeSingle();

  const storeSlug = merchant?.store_slug || 'store';
  const storeName = merchant?.business_name || 'OrizzonCart Store';

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('merchant_id', merchantId)
    .eq('is_active', true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const feed = (products || []).map((p: any) => {
    const imageUrl =
      p.images && p.images.length > 0 ? absoluteUrl(p.images[0].url) : '';
    const productLink = `${BASE_URL}/store/${storeSlug}/p/${p.slug}`;
    const inStock = (p.inventory_quantity ?? 0) > 0;

    return {
      id: String(p.id),
      title: p.name,
      description: p.description || p.name,
      link: productLink,
      image_link: imageUrl,
      price: `${Number(p.price || 0).toFixed(2)} NGN`,
      availability: inStock ? 'in stock' : 'out of stock',
      condition: 'new',
    };
  });

  // GOOGLE FORMAT (XML) - Google Merchant Center reads this automatically
  if (platform === 'google') {
    const items = feed
      .filter((p) => p.image_link)
      .map((p) => {
        return [
          '  <item>',
          `    <g:id>${escapeXml(p.id)}</g:id>`,
          `    <g:title>${escapeXml(p.title)}</g:title>`,
          `    <g:description>${escapeXml(p.description)}</g:description>`,
          `    <g:link>${escapeXml(p.link)}</g:link>`,
          `    <g:image_link>${escapeXml(p.image_link)}</g:image_link>`,
          `    <g:price>${escapeXml(p.price)}</g:price>`,
          `    <g:availability>${escapeXml(p.availability)}</g:availability>`,
          `    <g:condition>${escapeXml(p.condition)}</g:condition>`,
          '  </item>',
        ].join('\n');
      })
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>${escapeXml(storeName)}</title>
  <link>${escapeXml(`${BASE_URL}/store/${storeSlug}`)}</link>
  <description>${escapeXml(`${storeName} product catalog`)}</description>
${items}
</channel>
</rss>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }

  // DEFAULT FORMAT (JSON) - for our own dashboard and future Meta/TikTok
  return NextResponse.json({
    success: true,
    count: feed.length,
    platform_ready_products: feed,
  });
}