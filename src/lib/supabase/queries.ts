import { createClient as createAdminClient } from '@/lib/supabase/admin';

// Server-side only: uses the admin client so PUBLIC visitors can see stores.
// (Regular RLS would hide merchant rows from anonymous customers → 404)
export async function getMerchantBySlug(slug: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('merchants')
    .select('*, products(*)')
    .eq('store_slug', slug)
    .maybeSingle();
  return data;
}

export async function getMerchantProducts(merchantId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('merchant_id', merchantId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  return data;
}