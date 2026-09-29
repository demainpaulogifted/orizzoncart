import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const store_slug = searchParams.get('store_slug');
  const identifier = searchParams.get('identifier');

  if (!store_slug || !identifier) {
    return NextResponse.json({ error: 'Missing store_slug or identifier in URL' }, { status: 400 });
  }

  const admin = createAdminClient();

  // 1. Check Merchant
  const { data: merchant, error: merchantError } = await admin
    .from('merchants')
    .select('*')
    .eq('store_slug', store_slug)
    .maybeSingle();

  if (!merchant) {
    return NextResponse.json({ step: 'merchant_failed', error: merchantError?.message, store_slug });
  }

  // 2. Check Product
  const decodedIdentifier = decodeURIComponent(identifier);
  const queryString = `slug.eq.${decodedIdentifier},id.eq.${decodedIdentifier}`;

  const { data: product, error: productError } = await admin
    .from('products')
    .select('*')
    .eq('merchant_id', merchant.id)
    .eq('is_active', true)
    .or(queryString)
    .maybeSingle();

  return NextResponse.json({
    status: product ? 'FOUND ✅' : 'NOT_FOUND ❌',
    merchant_id: merchant.id,
    searched_identifier: decodedIdentifier,
    exact_query_used: queryString,
    product_data: product,
    product_error: productError?.message || null,
  });
}