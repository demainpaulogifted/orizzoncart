import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { getActiveMerchant } from '@/lib/active-merchant';

function signCJRequest(params: Record<string, string>, secret: string): string {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  return crypto.createHash('md5').update(sorted + secret).digest('hex');
}

async function searchCJ(
  apiKey: string,
  apiSecret: string,
  keyword: string,
  page: number = 1
) {
  const params: Record<string, string> = {
    method: 'cjdropshipping.product.search',
    app_key: apiKey,
    timestamp: Math.floor(Date.now() / 1000).toString(),
    keyword: keyword,
    page: page.toString(),
    page_size: '20',
  };

  params.sign = signCJRequest(params, apiSecret);

  const res = await fetch('https://api.cjdropshipping.com/api/router.do', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params),
  });

  const data = await res.json();
  if (!res.ok || data.code !== 200) {
    throw new Error(data.message || 'CJ search failed');
  }

  return (data.data?.products || []).map((p: any) => ({
    supplier_product_id: p.productId,
    title: p.productNameCn || p.productNameEn,
    description: p.productDescCn || p.productDescEn,
    images: (p.imageList || []).map((img: any) => ({
      url: img.imageUrl,
      alt: p.productNameEn,
    })),
    cost: Number(p.price),
    shipping_cost: Number(p.shippingCost || 0),
    category: p.categoryNameCn || p.categoryNameEn || 'General',
  }));
}

export async function POST(request: Request) {
  const body = await request.json();
  const { supplier, keyword, page = 1 } = body;

  if (!supplier || !keyword) {
    return NextResponse.json(
      { error: 'Supplier and keyword required' },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

  const admin = createAdminClient();
  const merchant = await getActiveMerchant(user.id);
  if (!merchant) return NextResponse.json({ error: 'No store' }, { status: 404 });

  const { data: connection } = await admin
    .from('dropshipping_connections')
    .select('*')
    .eq('merchant_id', merchant.id)
    .eq('supplier', supplier)
    .eq('status', 'connected')
    .maybeSingle();

  if (!connection) {
    return NextResponse.json(
      { error: `Not connected to ${supplier}` },
      { status: 400 }
    );
  }

  try {
    let products;
    if (supplier === 'cj') {
      products = await searchCJ(
        connection.api_key,
        connection.api_secret || '',
        keyword,
        page
      );
    } else {
      return NextResponse.json(
        { error: 'Supplier not supported yet' },
        { status: 400 }
      );
    }

    return NextResponse.json({ products });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}