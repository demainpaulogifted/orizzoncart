import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { getActiveMerchant } from '@/lib/active-merchant';

const CJ_BASE = 'https://api.cjdropshipping.com';

// Never crash on non-JSON replies — capture raw text for diagnostics
async function safeJson(res: Response) {
  const text = await res.text();
  try {
    return { data: JSON.parse(text), text };
  } catch {
    return { data: null, text };
  }
}

function extractList(data: any): any[] {
  if (!data) return [];
  const d = data.data ?? data.result ?? data;
  return d?.products || d?.list || d?.items || (Array.isArray(d) ? d : []);
}

function normalizeProduct(p: any) {
  const imgs = p.imageList || p.images || (p.mainImage ? [p.mainImage] : []) || [];
  return {
    supplier_product_id: p.productId || p.product_id || p.id,
    title: p.productNameEn || p.productName || p.title || p.name || 'Untitled',
    description: p.productDescEn || p.productDesc || p.description || '',
    images: (imgs as any[]).map((i) =>
      typeof i === 'string' ? { url: i } : { url: i.imageUrl || i.url || i.bigImageUrl }
    ),
    cost: Number(p.price ?? p.salePrice ?? p.cost ?? 0),
    shipping_cost: Number(p.shippingCost ?? p.logisticsPrice ?? p.shippingFee ?? 0),
    category: p.categoryNameEn || p.categoryName || p.category || 'General',
  };
}

// ---------- NEW CJ API (CJ-Access-Token) ----------
async function cjSearchV2(token: string, keyword: string): Promise<{ list: any[] | null; raw: string }> {
  // Candidate 1: GET
  try {
    const res = await fetch(
      `${CJ_BASE}/api2/v2/product/productList?keyword=${encodeURIComponent(keyword)}&page=1&limit=20`,
      { headers: { 'CJ-Access-Token': token }, cache: 'no-store' }
    );
    const { data, text } = await safeJson(res);
    if (data && res.ok) {
      const list = extractList(data);
      if (list.length || data.code === 200 || data.success === true) return { list, raw: text };
    }
  } catch {}

  // Candidate 2: POST JSON
  try {
    const res = await fetch(`${CJ_BASE}/api2/v2/product/productList`, {
      method: 'POST',
      headers: { 'CJ-Access-Token': token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword, page: 1, limit: 20 }),
    });
    const { data, text } = await safeJson(res);
    if (data && res.ok) {
      const list = extractList(data);
      if (list.length || data.code === 200 || data.success === true) return { list, raw: text };
    }
  } catch {}

  return { list: null, raw: '' };
}

// ---------- LEGACY CJ API (router.do + MD5 sign) ----------
async function cjSearchLegacy(apiKey: string, apiSecret: string, keyword: string): Promise<{ list: any[] | null; raw: string }> {
  const params: Record<string, string> = {
    method: 'cjdropshipping.product.search',
    app_key: apiKey,
    timestamp: Math.floor(Date.now() / 1000).toString(),
    keyword,
    page: '1',
    page_size: '20',
  };
  const sorted = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join('&');
  params.sign = crypto.createHash('md5').update(sorted + (apiSecret || '')).digest('hex');

  const res = await fetch(`${CJ_BASE}/api/router.do`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params),
  });
  const { data, text } = await safeJson(res);
  if (data?.code === 200) return { list: extractList(data), raw: text };
  return { list: null, raw: text.slice(0, 300) };
}

// ---------- MAIN ----------
export async function POST(request: Request) {
  const body = await request.json();
  const { supplier, keyword, page = 1 } = body;

  if (!supplier || !keyword) {
    return NextResponse.json({ error: 'Supplier and keyword required' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

  const merchant = await getActiveMerchant(user.id);
  if (!merchant) return NextResponse.json({ error: 'No store' }, { status: 404 });

  const admin = createAdminClient();
  const { data: connection } = await admin
    .from('dropshipping_connections')
    .select('*')
    .eq('merchant_id', merchant.id)
    .eq('supplier', supplier)
    .eq('status', 'connected')
    .maybeSingle();

  if (!connection) {
    return NextResponse.json({ error: `Not connected to ${supplier}` }, { status: 400 });
  }

  if (supplier !== 'cj') {
    return NextResponse.json({ error: 'Supplier not supported yet' }, { status: 400 });
  }

  // 1) Try the NEW token API first
  const v2 = await cjSearchV2(connection.api_key, keyword);
  // 2) Fall back to legacy signed API
  const legacy = v2.list ? { list: null as any[] | null, raw: '' } : await cjSearchLegacy(connection.api_key, connection.api_secret || '', keyword);

  const list = v2.list || legacy.list;

  if (!list) {
    // Surface CJ's raw reply so we can adapt instantly — no more cryptic JSON crashes
    return NextResponse.json(
      { error: `CJ API needs adjustment. Raw reply: ${v2.raw || legacy.raw || 'no response'}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ products: list.map(normalizeProduct) });
}