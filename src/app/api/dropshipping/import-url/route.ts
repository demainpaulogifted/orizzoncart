import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { getActiveMerchant } from '@/lib/active-merchant';
import { generateSlug } from '@/lib/utils';

const USD_NGN = Number(process.env.USD_NGN_RATE || 1700);

const COUNTRY_MULTIPLIERS: Record<string, number> = {
  nigeria: 1.8, ghana: 1.6, kenya: 1.6, southafrica: 1.5, egypt: 1.5,
  unitedstates: 1.0, canada: 1.1, unitedkingdom: 1.1, australia: 1.2,
  germany: 1.2, france: 1.2, uae: 1.3, china: 0.8,
};

function estimateShip(baseNgn: number, country: string) {
  const mult = COUNTRY_MULTIPLIERS[country.toLowerCase()] ?? 1.4;
  return Math.round(baseNgn * mult);
}

// 🛡️ Detect CJ's anti-bot wall so we never import garbage again
const BLOCK_RE = /human verification|verifying|just a moment|checking your browser|access denied|captcha|attention required/i;

function parseJsonLd(html: string): any | null {
  const re = /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    try {
      const obj = JSON.parse(m[1]);
      const nodes = Array.isArray(obj) ? obj : obj['@graph'] ? obj['@graph'] : [obj];
      for (const n of nodes) {
        if (String(n['@type'] || '').includes('Product')) return n;
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

async function fetchPage(url: string): Promise<string> {
  const key = process.env.SCRAPE_API_KEY;
  const provider = process.env.SCRAPE_PROVIDER || 'scraperapi';
  const target = key
    ? provider === 'zenrows'
      ? `https://api.zenrows.com/v1/?apikey=${key}&url=${encodeURIComponent(url)}`
      : `https://api.scraperapi.com/?api_key=${key}&url=${encodeURIComponent(url)}`
    : url;

  const res = await fetch(target, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
      Accept: 'text/html,application/xhtml+xml',
    },
    cache: 'no-store',
  });
  return res.text();
}

export async function POST(request: Request) {
  const body = await request.json();
  const { url, sellingPrice, draft } = body;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

  const merchant = await getActiveMerchant(user.id);
  if (!merchant) return NextResponse.json({ error: 'No store' }, { status: 404 });

  const admin = createAdminClient();

  // ---------- SAVE MODE: insert the confirmed draft ----------
  if (draft && sellingPrice) {
    const { error } = await admin.from('products').insert({
      merchant_id: merchant.id,
      name: draft.title,
      slug: generateSlug(draft.title),
      description: draft.description || '',
      price: Number(sellingPrice),
      supplier_cost: Number(draft.costNgn) || 0,
      supplier_shipping_cost: Number(draft.shippingNg) || 0,
      supplier: 'cj',
      supplier_product_id: draft.supplierProductId,
      category: 'General',
      images: draft.images || [],
      is_active: true,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, title: draft.title });
  }

  // ---------- PARSE MODE: fetch + read real product data ----------
  if (!url || !/^https?:\/\//i.test(url)) {
    return NextResponse.json({ error: 'Paste a valid product link' }, { status: 400 });
  }
  if (!/cjdropshipping/i.test(url)) {
    return NextResponse.json({ error: 'Link must be a CJ Dropshipping product page' }, { status: 400 });
  }

  let html = '';
  try {
    html = await fetchPage(url);
  } catch {
    return NextResponse.json({ error: 'Could not load that CJ page' }, { status: 500 });
  }

  // 🛡️ Reject anti-bot walls instead of importing garbage
  if (BLOCK_RE.test(html.slice(0, 3000))) {
    return NextResponse.json(
      { error: 'CJ blocked the fetch (human verification). Add SCRAPE_API_KEY (free ScraperAPI/ZenRows key) in Vercel env vars to bypass it, then retry.' },
      { status: 422 }
    );
  }

  const ld = parseJsonLd(html);
  const title = ld?.name || meta(html, 'og:title') || (html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] || '').trim();
  if (!title || BLOCK_RE.test(title)) {
    return NextResponse.json(
      { error: 'CJ served a verification page, not the product. Add SCRAPE_API_KEY in Vercel env vars (free tier) and retry.' },
      { status: 422 }
    );
  }

  // Images
  let images: any[] = [];
  if (Array.isArray(ld?.image)) images = ld.image.map((i: any) => (typeof i === 'string' ? { url: i } : { url: i.url }));
  else if (typeof ld?.image === 'string') images = [{ url: ld.image }];
  else if (ld?.image?.url) images = [{ url: ld.image.url }];
  if (!images.length && meta(html, 'og:image')) images = [{ url: meta(html, 'og:image') }];

  // 💰 Cost + currency → convert to ₦
  const offer = Array.isArray(ld?.offers) ? ld.offers[0] : ld?.offers;
  const cost = Number(offer?.price ?? offer?.lowPrice ?? meta(html, 'product:price:amount') ?? meta(html, 'og:price:amount') ?? 0);
  const currency = String(offer?.priceCurrency || 'USD').toUpperCase();
  const costNgn = currency === 'NGN' ? Math.round(cost) : Math.round(cost * USD_NGN);

  // 🚚 Estimated shipping per country (live once CJ API returns)
  const shipBase = Math.max(5000, Math.round(costNgn * 0.3));
  const shipping: Record<string, number> = {
    Nigeria: estimateShip(shipBase, 'nigeria'),
    'United States': estimateShip(shipBase, 'unitedstates'),
    'United Kingdom': estimateShip(shipBase, 'unitedkingdom'),
    Ghana: estimateShip(shipBase, 'ghana'),
    UAE: estimateShip(shipBase, 'uae'),
  };

  const u = new URL(url);
  const supplierProductId =
    u.searchParams.get('productId') ||
    u.pathname.split('/').filter(Boolean).pop()?.replace(/\.html?$/i, '') ||
    'cj-' + Date.now();

  return NextResponse.json({
    draft: {
      url, title,
      description: ld?.description || '',
      images, cost, currency, costNgn,
      supplierProductId,
      shippingNg: shipping['Nigeria'],
      shipping,
    },
  });
}