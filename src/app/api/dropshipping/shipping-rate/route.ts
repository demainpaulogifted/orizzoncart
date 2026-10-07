import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

// ============================================
// CJ SIGNING (live API)
// ============================================
function signCJRequest(params: Record<string, string>, secret: string): string {
  const sorted = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join('&');
  return crypto.createHash('md5').update(sorted + secret).digest('hex');
}

async function getCJShippingRate(
  apiKey: string,
  apiSecret: string,
  productId: string,
  country: string,
  quantity: number
): Promise<number> {
  const params: Record<string, string> = {
    method: 'cjdropshipping.shipping.get',
    app_key: apiKey,
    timestamp: Math.floor(Date.now() / 1000).toString(),
    productId,
    country,
    quantity: quantity.toString(),
  };
  params.sign = signCJRequest(params, apiSecret);

  try {
    const res = await fetch('https://api.cjdropshipping.com/api/router.do', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(params),
    });
    const data = await res.json();
    if (!res.ok || data.code !== 200) return 0;

    const methods = data.data?.shippingMethods || [];
    if (!methods.length) return 0;

    const cheapest = methods.reduce(
      (min: number, m: any) => Math.min(min, Number(m.shippingFee || 0)),
      Infinity
    );
    return cheapest === Infinity ? 0 : cheapest;
  } catch {
    return 0;
  }
}

// ============================================
// SMART ESTIMATION ENGINE (per country)
// Used for suppliers until real API access is approved
// ============================================
const COUNTRY_MULTIPLIERS: Record<string, number> = {
  nigeria: 1.8, ghana: 1.6, kenya: 1.6, southafrica: 1.5, egypt: 1.5,
  unitedstates: 1.0, canada: 1.1, unitedkingdom: 1.1, australia: 1.2,
  germany: 1.2, france: 1.2, netherlands: 1.2, spain: 1.2, italy: 1.2,
  uae: 1.3, 'saudi arabia': 1.3, qatar: 1.3, india: 1.1, china: 0.8,
  brazil: 1.5, mexico: 1.4, japan: 1.2, turkey: 1.3, pakistan: 1.4,
};

const DEFAULT_BASE_COST: Record<string, number> = {
  cj: 5000,
  aliexpress: 6000,
  alibaba: 8000,
};

function estimateShipping(supplier: string, savedCost: number, country: string, quantity: number): number {
  const base = savedCost > 0 ? savedCost : DEFAULT_BASE_COST[supplier.toLowerCase()] || 6000;
  const mult = COUNTRY_MULTIPLIERS[country.toLowerCase()] ?? 1.4;
  return Math.round(base * mult * quantity);
}

// ============================================
// 🔌 REAL API SLOT — ALIBABA
// When your Alibaba developer app is approved (developer.alibaba.com),
// replace the body of this function with the real freight API call.
// ============================================
async function getAlibabaShippingRate(
  _conn: any,
  _productId: string,
  country: string,
  quantity: number,
  savedCost: number
) {
  return { cost: estimateShipping('alibaba', savedCost, country, quantity), method: 'estimated' };
}

// ============================================
// 🔌 REAL API SLOT — ALIEXPRESS
// When your AliExpress app is approved (openservice.aliexpress.com),
// replace the body with the real TOP-protocol freight call.
// ============================================
async function getAliExpressShippingRate(
  _conn: any,
  _productId: string,
  country: string,
  quantity: number,
  savedCost: number
) {
  return { cost: estimateShipping('aliexpress', savedCost, country, quantity), method: 'estimated' };
}

// ============================================
// SUPPLIER ROUTER
// ============================================
async function getRate(
  supplier: string,
  conn: any,
  productId: string,
  country: string,
  quantity: number,
  savedCost: number
) {
  switch (supplier.toLowerCase()) {
    case 'cj':
      if (conn) {
        const live = await getCJShippingRate(conn.api_key, conn.api_secret || '', productId, country, quantity);
        if (live > 0) return { cost: live, method: 'live' };
      }
      return { cost: estimateShipping('cj', savedCost, country, quantity), method: 'estimated' };

    case 'alibaba':
      return getAlibabaShippingRate(conn, productId, country, quantity, savedCost);

    case 'aliexpress':
      return getAliExpressShippingRate(conn, productId, country, quantity, savedCost);

    default:
      return { cost: estimateShipping(supplier, savedCost, country, quantity), method: 'estimated' };
  }
}

// ============================================
// MAIN ENDPOINT
// ============================================
export async function POST(request: Request) {
  const body = await request.json();
  const { merchantId, items, country } = body;

  if (!merchantId || !Array.isArray(items) || !country) {
    return NextResponse.json({ error: 'merchantId, items array, and country required' }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: connections } = await admin
    .from('dropshipping_connections')
    .select('*')
    .eq('merchant_id', merchantId)
    .eq('status', 'connected');

  const connectionMap = new Map((connections || []).map((c: any) => [c.supplier, c]));

  let totalShippingCost = 0;
  const breakdown: any[] = [];

  for (const item of items) {
    const { data: product } = await admin
      .from('products')
      .select('supplier, supplier_product_id, supplier_shipping_cost')
      .eq('id', item.product_id)
      .maybeSingle();

    if (!product?.supplier || !product.supplier_product_id) continue;

    const result = await getRate(
      product.supplier,
      connectionMap.get(product.supplier),
      product.supplier_product_id,
      country,
      item.quantity || 1,
      Number(product.supplier_shipping_cost) || 0
    );

    totalShippingCost += result.cost;
    breakdown.push({
      product_id: item.product_id,
      supplier: product.supplier,
      shipping_cost: result.cost,
      method: result.method, // 'live' or 'estimated'
    });
  }

  return NextResponse.json({ shipping_cost: totalShippingCost, breakdown });
}