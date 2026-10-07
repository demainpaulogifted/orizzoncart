import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

// ============================================
// SIGNATURE HELPERS
// ============================================
function signCJRequest(params: Record<string, string>, secret: string): string {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  return crypto.createHash('md5').update(sorted + secret).digest('hex');
}

// ============================================
// CJ DROPSHIPPING ADAPTER
// ============================================
async function getCJShippingRate(
  apiKey: string,
  apiSecret: string,
  productId: string,
  country: string,
  quantity: number = 1
): Promise<number> {
  const params: Record<string, string> = {
    method: 'cjdropshipping.shipping.get',
    app_key: apiKey,
    timestamp: Math.floor(Date.now() / 1000).toString(),
    productId: productId,
    country: country,
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

    if (!res.ok || data.code !== 200) {
      console.error('CJ shipping rate error:', data.message);
      return 0;
    }

    const shippingMethods = data.data?.shippingMethods || [];
    if (shippingMethods.length === 0) return 0;

    // Pick the cheapest shipping method
    const cheapest = shippingMethods.reduce((min: any, method: any) => {
      const price = Number(method.shippingFee || 0);
      return price < min.price ? { price, method } : min;
    }, { price: Infinity, method: null });

    return cheapest.price === Infinity ? 0 : cheapest.price;
  } catch (e) {
    console.error('Failed to fetch CJ shipping rate:', e);
    return 0;
  }
}

// ============================================
// ALIBABA ADAPTER (Placeholder - implement when ready)
// ============================================
async function getAlibabaShippingRate(
  apiKey: string,
  apiSecret: string,
  productId: string,
  country: string,
  quantity: number = 1
): Promise<number> {
  // Alibaba API implementation
  // TODO: Implement when you get Alibaba API access
  console.log('Alibaba shipping rate requested for:', { productId, country, quantity });
  return 0; // Placeholder
}

// ============================================
// ALIEXPRESS ADAPTER (Placeholder - implement when ready)
// ============================================
async function getAliExpressShippingRate(
  apiKey: string,
  apiSecret: string,
  productId: string,
  country: string,
  quantity: number = 1
): Promise<number> {
  // AliExpress API implementation
  // TODO: Implement when you get AliExpress API access
  console.log('AliExpress shipping rate requested for:', { productId, country, quantity });
  return 0; // Placeholder
}

// ============================================
// SUPPLIER ROUTER
// ============================================
async function getSupplierShippingRate(
  supplier: string,
  apiKey: string,
  apiSecret: string,
  productId: string,
  country: string,
  quantity: number
): Promise<number> {
  switch (supplier.toLowerCase()) {
    case 'cj':
      return getCJShippingRate(apiKey, apiSecret, productId, country, quantity);
    
    case 'alibaba':
      return getAlibabaShippingRate(apiKey, apiSecret, productId, country, quantity);
    
    case 'aliexpress':
      return getAliExpressShippingRate(apiKey, apiSecret, productId, country, quantity);
    
    default:
      console.warn(`Unknown supplier: ${supplier}`);
      return 0;
  }
}

// ============================================
// MAIN API ENDPOINT
// ============================================
export async function POST(request: Request) {
  const body = await request.json();
  const { merchantId, items, country } = body;

  if (!merchantId || !items || !Array.isArray(items) || !country) {
    return NextResponse.json(
      { error: 'merchantId, items array, and country required' },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  // Get all supplier connections for this merchant
  const { data: connections } = await admin
    .from('dropshipping_connections')
    .select('*')
    .eq('merchant_id', merchantId)
    .eq('status', 'connected');

  if (!connections || connections.length === 0) {
    return NextResponse.json({ error: 'No suppliers connected' }, { status: 400 });
  }

  // Create a map of supplier -> connection for quick lookup
  const connectionMap = new Map(
    connections.map((c: any) => [c.supplier, c])
  );

  let totalShippingCost = 0;
  const breakdown: any[] = [];

  // Calculate shipping for each dropship item
  for (const item of items) {
    const { data: product } = await admin
      .from('products')
      .select('supplier, supplier_product_id')
      .eq('id', item.product_id)
      .maybeSingle();

    if (!product?.supplier || !product.supplier_product_id) {
      continue; // Not a dropship product
    }

    const connection = connectionMap.get(product.supplier);
    if (!connection) {
      console.warn(`No connection found for supplier: ${product.supplier}`);
      continue;
    }

    const rate = await getSupplierShippingRate(
      product.supplier,
      connection.api_key,
      connection.api_secret || '',
      product.supplier_product_id,
      country,
      item.quantity || 1
    );

    totalShippingCost += rate;
    breakdown.push({
      product_id: item.product_id,
      supplier: product.supplier,
      shipping_cost: rate,
    });
  }

  return NextResponse.json({
    shipping_cost: totalShippingCost,
    breakdown, // Optional: shows shipping cost per item
  });
}