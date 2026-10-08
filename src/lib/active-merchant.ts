import { cookies } from 'next/headers';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

/**
 * Multi-store safe: resolves the merchant the user is currently
 * working on (from the store switcher cookie), falling back to their first store.
 */
export async function getActiveMerchant(userId: string): Promise<any | null> {
  const admin = createAdminClient();
  const cookieStore = await cookies();
  const activeId = cookieStore.get('active_merchant_id')?.value;

  const { data: merchants } = await admin
    .from('merchants')
    .select('*')
    .eq('user_id', userId);

  const list = merchants || [];
  return list.find((m: any) => m.id === activeId) || list[0] || null;
}