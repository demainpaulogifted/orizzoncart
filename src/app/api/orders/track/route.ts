import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const code = (request.nextUrl.searchParams.get('code') || '').trim().toUpperCase();
  if (!code) return NextResponse.json({ error: 'missing' }, { status: 400 });

  const admin = createAdminClient();
  const { data } = await admin
    .from('orders')
    .select('order_number, tracking_number, status, payment_status, created_at, total_amount, customer_name, order_items(product_name, quantity), merchants(store_name)')
    .or(`order_number.eq.${code},tracking_number.eq.${code}`)
    .maybeSingle();

  if (!data) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ order: data });
}