import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export async function MarketplaceMerchantButton() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const admin = createAdminClient();
  const { data: merchant } = await admin
    .from('merchants')
    .select('id, store_slug')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!merchant) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col gap-2">
      <Link
        href={`/store/${merchant.store_slug}`}
        target="_blank"
        className="px-4 py-2 bg-white border border-purple-200 text-purple-700 text-xs font-bold rounded-full shadow-lg hover:bg-purple-50"
      >
        👀 My Store
      </Link>
      <Link
        href="/dashboard"
        className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-full shadow-lg hover:bg-purple-700"
      >
        🏪 Dashboard
      </Link>
    </div>
  );
}