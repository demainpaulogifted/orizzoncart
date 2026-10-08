import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { getActiveMerchant } from '@/lib/active-merchant';
import { generateSlug } from '@/lib/utils';

// Extract a Product from embedded JSON-LD (works even while CJ API is down)
function parseJsonLd(html: string): any | null {
  const re = /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    try {
      const obj = JSON.parse(m[1]);
      const nodes = Array.isArray(obj) ? obj : obj['@graph'] ? obj['@graph'] : [obj];
      for (const n of nodes) {
        const type = String(n['@type'] || '');
        if (type.includes('Product')) return n;
      }
    } catch {}
  }
  return null;
}

function meta(html: string, prop: string): string {
  const re = new RegExp(`<meta[^>]+property="${prop}"[^>]+content="([^"]*)"`, 'i');
  const alt = new RegExp(`<meta[^>]+name="${prop}"[^>]+content="([^"]*)"`, 'i');
  return (html.match(re)?.[1] || html.match(alt)?.[1] || '').trim();
}

export async function POST(request: Request) {
  const body = await request.json();
  const { url, sellingPrice } = body;

  if (!url || !/^https?:\/\//i.test(url)) {
    return NextResponse.json({ error: 'Paste a valid product link' }, { status: 400 });
  }
  if (!/cjdropshipping/i.test(url)) {
    return NextResponse.json({ error: 'Link must be a CJ Dropshipping product page' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

  const merchant = await getActiveMerchant(user.id);
  if (!merchant) return NextResponse.json({ error: 'No store' }, { status: 404 });

  // Fetch the public product page (website is up even while API is upgrading)
  let html = '';
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      cache: 'no-store',
    });
    html = await res.text();
  } catch {
    return NextResponse.json({ error: 'Could not load that CJ page' }, { status: 500 });
  }

  const ld = parseJsonLd(html);
  const title = ld?.name || meta(html, 'og:title') || (html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] || '').trim();
  if (!title) return NextResponse.json({ error: 'Could not read product from that page' }, { status: 422 });

  // Images
  let images: any[] = [];
  if (Array.isArray(ld?.image)) images = ld.image.map((i: any) => (typeof i === 'string' ? { url: i } : { url: i.url }));
  else if (typeof ld?.image === 'string') images = [{ url: ld.image }];
  else if (ld?.image?.url) images = [{ url: ld.image.url }];
  if (!images.length && meta(html, 'og:image')) images = [{ url: meta(html, 'og:image') }];

  // Price (cost) from JSON-LD offers or meta
  const offer = Array.isArray(ld?.offers) ? ld.offers[0] : ld?.offers;
  const cost = Number(offer?.price ?? offer?.lowPrice ?? meta(html, 'product:price:amount') ?? meta(html, 'og:price:amount') ?? 0);

  // Supplier product id from URL
  const u = new URL(url);
  const supplierProductId =
    u.searchParams.get('productId') ||
    u.pathname.split('/').filter(Boolean).pop()?.replace(/\.html?$/i, '') ||
    'cj-' + Date.now();

  const price = Number(sellingPrice) || Math.round((cost || 0) * 2.5) || 0;

  const admin = createAdminClient();
  const { error } = await admin.from('products').insert({
    merchant_id: merchant.id,
    name: title,
    slug: generateSlug(title),
    description: ld?.description || '',
    price,
    supplier_cost: cost,
    supplier_shipping_cost: 0,
    supplier: 'cj',
    supplier_product_id: supplierProductId,
    category: 'General',
    images,
    is_active: true,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, title, cost });
}