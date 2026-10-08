import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { getActiveMerchant } from '@/lib/active-merchant';

const CJ_BASE = 'https://api.cjdropshipping.com';

async function probe(name: string, url: string, init: RequestInit) {
  try {
    const res = await fetch(url, { ...init, cache: 'no-store' });
    const text = await res.text();
    let data: any = null;
    try { data = JSON.parse(text); } catch {}
    return { name, status: res.status, data, text };
  } catch (e: any) {
    return { name, status: 0, data: null, text: String(e.message) };
  }
}

function H(token: string, extra: Record<string, string> = {}) {
  return { 'CJ-Access-Token': token, Authorization: `Bearer ${token}`, ...extra };
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

function mcpInit(token: string): RequestInit {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...H(token) },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }),
  };
}

function legacyInit(apiKey: string, apiSecret: string, keyword: string): RequestInit {
  const params: Record<string, string> = {
    method: 'cjdropshipping.product.search',
    app_key: apiKey,
    timestamp: Math.floor(Date.now() / 1000).toString(),
    keyword,
    page: '1',
    page_size: '20',
  };
  const sorted = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join('&');
  params.sign = crypto.createHash('md5').update(sorted + apiSecret).digest('hex');
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params),
  };
}

export async function POST(request: Request) {
  const body = await request.json();
  const { supplier, keyword } = body;

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

  if (!connection) return NextResponse.json({ error: `Not connected to ${supplier}` }, { status: 400 });
  if (supplier !== 'cj') return NextResponse.json({ error: 'Supplier not supported yet' }, { status: 400 });

  const token: string = connection.api_key;
  const secret: string = connection.api_secret || '';
  const kw = encodeURIComponent(keyword);

  const candidates: [string, string, RequestInit][] = [
    // MCP discovery — CJ lists its own tools if alive
    ['mcp', `${CJ_BASE}/mcp`, mcpInit(token)],
    ['mcp-sse', `${CJ_BASE}/api2/v2/mcp`, mcpInit(token)],
    // More REST path shapes
    ['v2-search', `${CJ_BASE}/api2/v2/product/search?keyword=${kw}&page=1&limit=20`, { headers: H(token) }],
    ['v2-list', `${CJ_BASE}/api2/v2/product/list?keyword=${kw}&page=1&limit=20`, { headers: H(token) }],
    ['v2-products', `${CJ_BASE}/api2/v2/products?keyword=${kw}&page=1&limit=20`, { headers: H(token) }],
    ['api-productList', `${CJ_BASE}/api/product/productList?keyword=${kw}&page=1&limit=20`, { headers: H(token) }],
    ['openapi', `${CJ_BASE}/openapi/product/productList?keyword=${kw}&page=1&limit=20`, { headers: H(token) }],
    ['legacy-signed', `${CJ_BASE}/api/router.do`, legacyInit(token, secret, keyword)],
  ];

  const results: string[] = [];
  for (const [name, url, init] of candidates) {
    const r = await probe(name, url, init);

    // 🎯 MCP alive? CJ just told us its exact tool names
    const tools = r.data?.result?.tools;
    if (Array.isArray(tools) && tools.length) {
      return NextResponse.json(
        { error: `MCP ALIVE! tools: ${tools.map((t: any) => t.name).join(', ')}` },
        { status: 500 }
      );
    }

    const list = extractList(r.data);
    if (list.length) {
      return NextResponse.json({ products: list.map(normalizeProduct), source: name });
    }
    results.push(`${name}→${r.status}:${r.text.replace(/\s+/g, ' ').slice(0, 60)}`);
  }

  return NextResponse.json({ error: `CJ probe report: ${results.join(' | ')}` }, { status: 500 });
}