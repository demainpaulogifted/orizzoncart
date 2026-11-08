import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const productId = body.product_id as string | undefined;
    const source = body.source as 'marketplace' | 'storefront' | undefined;

    if (!productId || (source !== 'marketplace' && source !== 'storefront')) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: product } = await admin
      .from('products')
      .select('id, merchant_id')
      .eq('id', productId)
      .maybeSingle();

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    await admin.from('product_views').insert({
      product_id: product.id,
      merchant_id: product.merchant_id,
      source,
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 });
  }
}
