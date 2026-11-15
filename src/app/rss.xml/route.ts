import {
  BLOG_ARTICLES,
  MAIN_URL,
  MARKETPLACE_URL,
  escapeXml,
  getMarketplaceProducts,
  getMarketplaceProductUrl,
  getProductAvailability,
  getProductImage,
} from '@/lib/seo-feeds';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  const host = new URL(request.url).hostname.toLowerCase();
  const isMarketplace = host === 'marketplace.orizzoncart.com.ng';

  try {
    let items = '';

    if (isMarketplace) {
      const products = await getMarketplaceProducts();

      items = products.map((product) => {
        const url = getMarketplaceProductUrl(product);
        const image = getProductImage(product.images);
        const description = String(product.description || product.name)
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 4000);
        const price = Number(product.price);
        const priceText = Number.isFinite(price) ? `Price: NGN ${price.toFixed(2)}. ` : '';
        const imageTag = image
          ? `<media:content url="${escapeXml(image)}" medium="image" />`
          : '';

        return `<item>
<title>${escapeXml(product.name)}</title>
<link>${escapeXml(url)}</link>
<guid isPermaLink="true">${escapeXml(url)}</guid>
<description>${escapeXml(priceText + description)}</description>
${imageTag}
<category>${escapeXml(product.category || 'Products')}</category>
<availability>${escapeXml(getProductAvailability(product))}</availability>
${product.updated_at ? `<pubDate>${new Date(product.updated_at).toUTCString()}</pubDate>` : ''}
</item>`;
      }).join('\n');
    } else {
      items = BLOG_ARTICLES.map((article) => {
        const url = `${MAIN_URL}/blog/${article.slug}`;
        return `<item>
<title>${escapeXml(article.title)}</title>
<link>${escapeXml(url)}</link>
<guid isPermaLink="true">${escapeXml(url)}</guid>
<description>${escapeXml(article.description)}</description>
<category>Business and e-commerce</category>
</item>`;
      }).join('\n');
    }

    const siteUrl = isMarketplace ? MARKETPLACE_URL : MAIN_URL;
    const title = isMarketplace ? 'OrizzonCart Marketplace Products' : 'OrizzonCart Blog';
    const description = isMarketplace
      ? 'Products from eligible, approved OrizzonCart Marketplace stores.'
      : 'Business growth, online selling and e-commerce guides from OrizzonCart.';

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
<channel>
<title>${escapeXml(title)}</title>
<link>${siteUrl}</link>
<description>${escapeXml(description)}</description>
<language>en-ng</language>
<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
</channel>
</rss>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('RSS feed generation failed:', error);
    return new Response('RSS feed temporarily unavailable.', { status: 500 });
  }
}
