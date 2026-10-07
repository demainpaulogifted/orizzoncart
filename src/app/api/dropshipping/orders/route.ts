import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

  const admin = createAdminClient();
  const { data: merchant } = await admin
    .from('merchants')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!merchant) return NextResponse.json({ error: 'No store' }, { status: 404 });

  const { data: orders } = await admin
    .from('orders')
    .select('*')
    .eq('merchant_id', merchant.id)
    .eq('has_dropship_products', true)
    .order('created_at', { ascending: false })
    .limit(50);

  return NextResponse.json({ orders: orders || [] });
}