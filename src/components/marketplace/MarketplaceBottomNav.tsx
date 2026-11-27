'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { MarketplaceCartButton } from '@/components/MarketplaceCartButton';

export function MarketplaceBottomNav({ active }: { active?: string }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [hasUser, setHasUser] = useState(false);
  const [isMerchant, setIsMerchant] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    const checkMerchant = async (userId: string | null) => {
      if (!userId) {
        if (mounted) {
          setHasUser(false);
          setIsMerchant(false);
          setChecking(false);
        }
        return;
      }

      if (mounted) setHasUser(true);

      try {
        const { getClientActiveMerchant } = await import('@/lib/active-merchant-client');
        const merchant = await getClientActiveMerchant(supabase, userId);

        if (mounted) {
          setIsMerchant(Boolean(merchant));
          setChecking(false);
        }
      } catch (error) {
        console.error('Merchant store lookup failed:', error);
        if (mounted) {
          setIsMerchant(false);
          setChecking(false);
        }
      }
    };

    void supabase.auth.getUser().then(({ data }) => {
      void checkMerchant(data.user?.id || null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        window.setTimeout(() => {
          void checkMerchant(session?.user?.id || null);
        }, 0);
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const openMerchant = () => {
    if (checking) return;
    if (isMerchant) {
      router.push('/dashboard');
    } else if (hasUser) {
      router.push('/onboarding');
    } else {
      router.push('/login?next=/dashboard');
    }
  };

  const openPublish = () => {
    if (checking) return;
    if (isMerchant) {
      router.push('/dashboard/products/add');
    } else if (hasUser) {
      router.push('/onboarding');
    } else {
      router.push('/login?next=/dashboard/products/add');
    }
  };

  const item = (key: string) =>
    'flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold ' +
    (active === key ? 'text-purple-600' : 'text-gray-400');

  return (
    <>
      <Link
        href="/invite/join"
        className="fixed right-3 bottom-20 z-[60] rounded-full border border-purple-200 bg-white px-4 py-2.5 text-[11px] font-extrabold text-purple-800 shadow-xl hover:bg-purple-50"
      >
        Invite & Earn
      </Link>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-3xl mx-auto grid grid-cols-5 h-16">
          <button type="button" onClick={() => router.push('/marketplace')} className={item('home')}>
            <span className="text-lg leading-none">🏠</span>
            Home
          </button>

          <button type="button" onClick={() => router.push('/marketplace/categories')} className={item('shop')}>
            <span className="text-lg leading-none">🛍️</span>
            Shop
          </button>

          <button
            type="button"
            onClick={openPublish}
            disabled={checking}
            className="flex flex-col items-center justify-end pb-1 -mt-5"
          >
            <span className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-white text-2xl font-extrabold flex items-center justify-center shadow-lg border-4 border-white">
              +
            </span>
            <span className="text-[9px] font-bold text-purple-600 mt-0.5">Publish</span>
          </button>

          <button type="button" onClick={openMerchant} disabled={checking} className={item('merchant')}>
            <span className="text-lg leading-none">🏪</span>
            Merchant
          </button>

          <MarketplaceCartButton active={active} />
        </div>
      </nav>
    </>
  );
}