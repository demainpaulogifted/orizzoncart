import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug');
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });

  const admin = createAdminClient();
  const { data: merchant } = await admin
    .from('merchants')
    .select('id, cart_status, checkout_status, payment_receiving_status, maintenance_expires_at')
    .eq('store_slug', slug)
    .single();

  if (!merchant) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

  const expired = merchant.maintenance_expires_at && new Date(merchant.maintenance_expires_at) < new Date();
  const showcase = merchant.cart_status === 'LOCKED' || merchant.checkout_status !== 'ENABLED' || merchant.payment_receiving_status !== 'ACTIVE' || !!expired;

  const { data: products } = await admin
    .from('products')
    .select('id, name, price, description, images, is_digital')
    .eq('merchant_id', merchant.id)
    .eq('is_active', true);

  return NextResponse.json({ products: products || [], showcase });
}