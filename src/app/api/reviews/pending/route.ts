import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { getActiveMerchant } from '@/lib/active-merchant';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

  const admin = createAdminClient();
  const merchant = await getActiveMerchant(user.id);
  if (!merchant) return NextResponse.json({ error: 'No store' }, { status: 404 });

  const { data: store } = await admin
    .from('store_reviews').select('*')
    .eq('merchant_id', merchant.id).eq('status', 'pending')
    .order('created_at', { ascending: false });

  const { data: product } = await admin
    .from('reviews').select('*, products(name, merchant_id)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  const mineProduct = (product || []).filter((r: any) => r.products?.merchant_id === merchant.id);

  return NextResponse.json({ store: store || [], product: mineProduct });
}