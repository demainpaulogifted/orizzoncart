import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export async function getMarketplaceCustomer() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  
  // We link the shopper to the marketplace_customers table via their email
  const { data: customer } = await admin
    .from('marketplace_customers')
    .select('*')
    .eq('email', user.email)
    .maybeSingle();

  return customer;
}