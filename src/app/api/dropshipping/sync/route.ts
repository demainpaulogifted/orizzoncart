import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

function signCJRequest(params: Record<string, string>, secret: string): string {
  const sorted = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&');
  return crypto.createHash('md5').update(sorted + secret).digest('hex');
}

async function getCJProductDetail(apiKey: string, apiSecret: string, productId: string) {
  const params: Record<string, string> = {
    method: 'cjdropshipping.product.detail',
    app_key: apiKey,
    timestamp: Math.floor(Date.now() / 1000).toString(),
    productId: productId,
  };
  params.sign = signCJRequest(params, apiSecret);

  const res = await fetch('https://api.cjdropshipping.com/api/router.do', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params),
  });
  const data = await res.json();
  if (!res.ok || data.code !== 200) return null;
  
  return {
    cost: Number(data.data?.price || 0),
    in_stock: data.data?.status === '1' || data.data?.status === 'active', // CJ uses different status codes, adjust as needed
    images: data.data?.imageList || [],
  };
}

export async function POST(request: Request) {
  const admin = createAdminClient();
  
  // 1. Get all active dropshipped products
  const { data: products } = await admin
    .from('products')
    .select('id, merchant_id, price, supplier_cost, supplier_product_id, auto_sync_price, auto_sync_stock')
    .not('supplier', 'is', null)
    .eq('is_active', true);

  if (!products || products.length === 0) {
    return NextResponse.json({ message: 'No dropship products to sync' });
  }

  // 2. Get unique merchant IDs to fetch their API connections
  const merchantIds = [...new Set(products.map(p => p.merchant_id))];
  const { data: connections } = await admin
    .from('dropshipping_connections')
    .select('*')
    .in('merchant_id', merchantIds)
    .eq('supplier', 'cj')
    .eq('status', 'connected');

  const connMap = new Map((connections || []).map(c => [c.merchant_id, c]));

  let updatedCount = 0;
  let outOfStockCount = 0;

  // 3. Loop through products and sync
  for (const product of products) {
    const conn = connMap.get(product.merchant_id);
    if (!conn || !product.supplier_product_id) continue;

    try {
      const details = await getCJProductDetail(conn.api_key, conn.api_secret || '', product.supplier_product_id);
      if (!details) continue;

      const updateData: any = {
        last_synced_at: new Date().toISOString(),
      };

      // A. Handle Price Changes (Protect Profit Margin)
      if (details.cost > 0 && details.cost !== product.supplier_cost) {
        updateData.supplier_cost = details.cost;
        
        if (product.auto_sync_price) {
          // Calculate original markup ratio (e.g., if cost was 100 and price was 250, ratio is 2.5)
          const oldCost = product.supplier_cost || 1;
          const markupRatio = product.price / oldCost;
          // Apply same ratio to new cost
          const newSellingPrice = Math.round(details.cost * markupRatio);
          updateData.price = newSellingPrice;
        }
      }

      // B. Handle Stock Changes
      if (!details.in_stock && product.auto_sync_stock) {
        updateData.is_active = false; // Hide product from store if out of stock
        outOfStockCount++;
      }

      await admin.from('products').update(updateData).eq('id', product.id);
      updatedCount++;

      // Be nice to CJ's API rate limits
      await new Promise(resolve => setTimeout(resolve, 200)); 
    } catch (e) {
      console.error(`Failed to sync product ${product.id}:`, e);
    }
  }

  return NextResponse.json({ 
    success: true, 
    updated: updatedCount, 
    hidden_out_of_stock: outOfStockCount 
  });
}