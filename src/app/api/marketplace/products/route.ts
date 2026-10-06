import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const admin = createAdminClient();

  // Fetch all active merchants who are ON the marketplace and have ACTIVE payments
  const { data: merchants } = await admin
    .from('merchants')
    .select('id, store_slug, store_name, logo_url')
    .eq('is_on_marketplace', true)
    .eq('payment_receiving_status', 'ACTIVE')
    .eq('is_active', true);

  if (!merchants || merchants.length === 0) {
    return NextResponse.json({ products: [] });
  }

  const merchantIds = merchants.map(m => m.id);

  // Fetch all active products from those merchants
  const { data: products, error } = await admin
    .from('products')
    .select(`
      id,
      name,
      slug,
      price,
      images,
      merchant_id
    `)
    .in('merchant_id', merchantIds)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(50); // Load first 50 products

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Attach store info to each product
  const enrichedProducts = (products || []).map(p => {
    const merchant = merchants.find(m => m.id === p.merchant_id);
    return {
      ...p,
      store_slug: merchant?.store_slug,
      store_name: merchant?.store_name,
      store_logo: merchant?.logo_url,
    };
  });

  return NextResponse.json({ products: enrichedProducts });
}