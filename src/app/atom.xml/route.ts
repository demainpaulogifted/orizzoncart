import {
  BLOG_ARTICLES,
  MAIN_URL,
  MARKETPLACE_URL,
  escapeXml,
  getMarketplaceProducts,
  getMarketplaceProductUrl,
  getProductImage,
  getProductAvailability,
} from '@/lib/seo-feeds';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  const host = new URL(request.url).hostname.toLowerCase();
  const isMarketplace = host === 'marketplace.orizzoncart.com.ng';
  const siteUrl = isMarketplace ? MARKETPLACE_URL : MAIN_URL;
  const updated = new Date().toISOString();

  try {
    let entries = '';

    if (isMarketplace) {
      const products = await getMarketplaceProducts();

      entries = products.map((product) => {
        const url = getMarketplaceProductUrl(product);
        const image = getProductImage(product.images);
        const description = String(product.description || product.name)
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 4000);
        const productUpdated = product.updated_at
          ? new Date(product.updated_at).toISOString()
          : updated;
        const price = Number(product.price);
        const priceText = Number.isFinite(price)
          ? `Price: NGN ${price.toFixed(2)}. `
          : '';

        return `<entry>
<title>${escapeXml(product.name)}</title>
<link href="${escapeXml(url)}" rel="alternate" />
<id>${escapeXml(url)}</id>
<updated>${productUpdated}</updated>
<summary>${escapeXml(`${priceText}${description} Availability: ${getProductAvailability(product)}.`)}</summary>
${image ? `<link href="${escapeXml(image)}" rel="enclosure" />` : ''}
</entry>`;
      }).join('\n');
    } else {
      entries = BLOG_ARTICLES.map((article) => {
        const url = `${MAIN_URL}/blog/${article.slug}`;
        return `<entry>
<title>${escapeXml(article.title)}</title>
<link href="${url}" rel="alternate" />
<id>${url}</id>
<updated>${updated}</updated>
<summary>${escapeXml(article.description)}</summary>
</entry>`;
      }).join('\n');
    }

    const title = isMarketplace
      ? 'OrizzonCart Marketplace Products'
      : 'OrizzonCart Blog';

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
<title>${escapeXml(title)}</title>
<id>${siteUrl}/</id>
<link href="${siteUrl}/atom.xml" rel="self" />
<link href="${siteUrl}" rel="alternate" />
<updated>${updated}</updated>
${entries}
</feed>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/atom+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Atom feed generation failed:', error);
    return new Response('Atom feed temporarily unavailable.', { status: 500 });
  }
}
