import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const store_slug = searchParams.get('store_slug');
  const identifier = searchParams.get('identifier');

  const admin = createAdminClient();

  const { data: merchant } = await admin
    .from('merchants')
    .select('id, store_name, store_slug, payment_receiving_status, cart_status, checkout_status')
    .eq('store_slug', store_slug || '')
    .maybeSingle();

  if (!merchant) {
    return NextResponse.json({ step: 'merchant_not_found', store_slug });
  }

  const { data: allProducts, error: productsError } = await admin
    .from('products')
    .select('id, slug, name, is_active')
    .eq('merchant_id', merchant.id);

  const decoded = identifier ? decodeURIComponent(identifier) : '';
  const match = (allProducts || []).find((p: any) => p.slug === decoded || p.id === decoded);

  return NextResponse.json({
    merchant,
    searched_identifier: decoded,
    exact_match: match || null,
    all_products_for_this_merchant: allProducts || [],
    products_error: productsError?.message || null,
  });
}