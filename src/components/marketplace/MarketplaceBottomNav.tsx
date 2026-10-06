import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export async function MarketplaceBottomNav({ active }: { active?: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isMerchant = false;
  if (user) {
    const admin = createAdminClient();
    const { data: merchant } = await admin
      .from('merchants')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    isMerchant = Boolean(merchant);
  }

  const item = (key: string) =>
    `flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold ${
      active === key ? 'text-purple-600' : 'text-gray-400'
    }`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-3xl mx-auto grid grid-cols-5 h-16">
        <Link href="/marketplace" className={item('home')}>
          <span className="text-lg leading-none">🏠</span>
          Home
        </Link>

        <Link href="/marketplace/categories" className={item('shop')}>
          <span className="text-lg leading-none">🛍️</span>
          Shop
        </Link>

        {/* Publish: Opens in new tab so shopper doesn't lose the app */}
        <a
          href={isMerchant ? '/dashboard/products/add' : '/signup'}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-end pb-1 -mt-5"
        >
          <span className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-white text-2xl font-extrabold flex items-center justify-center shadow-lg border-4 border-white">
            +
          </span>
          <span className="text-[9px] font-bold text-purple-600 mt-0.5">Publish</span>
        </a>

        {/* Merchant: Opens in new tab */}
        <a
          href={isMerchant ? '/dashboard' : '/login'}
          target="_blank"
          rel="noopener noreferrer"
          className={item('merchant')}
        >
          <span className="text-lg leading-none">🏪</span>
          Merchant
        </a>

        <Link href="/marketplace/orders" className={item('orders')}>
          <span className="text-lg leading-none">📦</span>
          My Order
        </Link>
      </div>
    </nav>
  );
}