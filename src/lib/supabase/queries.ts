import { createClient as createServerClient } from './server';
import { Merchant, Product, Order } from '@/types/database';

export async function getMerchantBySlug(slug: string): Promise<Merchant | null> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('merchants')
    .select(`*, products(id, name, slug, price, images, is_active, is_featured)`)
    .eq('store_slug', slug)
    .eq('is_published', true)
    .single();
  if (error) return null;
  return data;
}

export async function getMerchantByUserId(userId: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase.from('merchants').select('*').eq('user_id', userId).single();
  if (error) return null;
  return data;
}