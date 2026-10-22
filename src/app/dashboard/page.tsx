'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';

type Merchant = {
  id: string;
  store_name?: string | null;
  store_slug?: string | null;
  shipping_mode?: string | null;
  payment_receiving_status?: string | null;
  payout_method?: string | null;
  bank_name?: string | null;
  paystack_secret_key?: string | null;
  flutterwave_secret_key?: string | null;
  is_verified?: boolean | null;
  is_on_marketplace?: boolean | null;
  business_state?: string | null;
  business_lga?: string | null;
  business_address?: string | null;
  business_locations?: any[] | null;
  [key: string]: any;
};

type DashboardStats = {
  visitors?: number;
  pageviews?: number;
  orders?: number;
  revenue?: number;
  [key: string]: any;
};

function getActiveMerchantCookie(): string | null {
  const cookie = document.cookie
    .split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith('active_merchant_id='));

  if (!cookie) return null;
  const value = cookie.slice('active_merchant_id='.length);
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export default function DashboardHome() {
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [counts, setCounts] = useState({ products: 0, pages: 0, orders: 0 });
  const [showSteps, setShowSteps] = useState(false);
  const [showMarketplaceSteps, setShowMarketplaceSteps] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function loadDashboard() {
      const supabase = createClient();
      setMerchant(null);
      setStats(null);
      setCounts({ products: 0, pages: 0, orders: 0 });

      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (cancelled) return;
        if (authError) throw authError;
        if (!user) {
          setMerchant(null);
          return;
        }

        const cookieId = getActiveMerchantCookie();
        const { data: merchants, error: merchantsError } = await supabase
          .from('merchants')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (cancelled) return;
        if (merchantsError) throw merchantsError;

        const merchantList = merchants || [];
        const active = merchantList.find((item: Merchant) => item.id === cookieId) || merchantList[0] || null;
        if (!active) {
          setMerchant(null);
          return;
        }

        setMerchant(active);

        const [
          { count: products },
          { count: pages },
          { count: orders },
        ] = await Promise.all([
          supabase.from('products').select('id', { count: 'exact', head: true }).eq('merchant_id', active.id),
          supabase.from('store_pages').select('id', { count: 'exact', head: true }).eq('merchant_id', active.id),
          supabase.from('orders').select('id', { count: 'exact', head: true }).eq('merchant_id', active.id),
        ]);

        if (cancelled) return;

        setCounts({
          products: products || 0,
          pages: pages || 0,
          orders: orders || 0,
        });

        const response = await fetch('/api/analytics', {
          cache: 'no-store',
          signal: controller.signal,
          headers: { 'Cache-Control': 'no-cache' },
        });

        if (response.ok) {
          const analytics: DashboardStats = await response.json();
          if (!cancelled) setStats(analytics);
        }
      } catch (error) {
        if (cancelled || (error instanceof Error && error.name === 'AbortError')) return;
        console.error('Dashboard data failed to load:', error);
      }
    }

    void loadDashboard();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  if (!merchant) {
    return <div className="p-10 text-center text-gray-500">Loading dashboard...</div>;
  }

  const storeUrl = merchant.store_slug
    ? `https://${merchant.store_slug}.orizzoncart.name.ng`
    : '/dashboard';

  const hasPayout = !!(
    merchant.payout_method ||
    merchant.bank_name ||
    merchant.paystack_secret_key ||
    merchant.flutterwave_secret_key
  );

  // ========== STORE SETUP (80%) ==========
  const storeSteps = [
    { done: true, title: 'Create your store', tip: 'Done! Your store is live.', href: storeUrl, cta: 'View Store' },
    { done: counts.products > 0, title: 'Add your first product', tip: 'Stores with 3+ products sell more.', href: '/dashboard/products/add', cta: 'Add Product' },
    { done: !!merchant.shipping_mode, title: 'Set delivery zones', tip: 'Customers choose a delivery zone at checkout.', href: '/dashboard/settings/shipping', cta: 'Set Delivery' },
    { done: counts.pages > 0, title: 'Add a trust page', tip: 'Refund Policy or About page builds trust.', href: '/dashboard/pages', cta: 'Create Page' },
    { done: merchant.payment_receiving_status === 'ACTIVE', title: 'Activate payments', tip: 'Activate to start receiving money.', href: '/dashboard/settings/payment', cta: 'Activate' },
    { done: hasPayout, title: 'Connect payout method', tip: 'So we can send your money.', href: '/dashboard/settings/payment', cta: 'Connect' },
  ];

  const storeDoneCount = storeSteps.filter((s) => s.done).length;
  const storeProgress = Math.min(Math.round((storeDoneCount / storeSteps.length) * 80), 80);
  const storeComplete = storeDoneCount === storeSteps.length;

  // ========== MARKETPLACE (20%) ==========
  // Location is only considered present if real data exists
  const hasLocation = !!(
    (merchant.business_state && merchant.business_state.trim()) ||
    (merchant.business_address && merchant.business_address.trim()) ||
    (Array.isArray(merchant.business_locations) && merchant.business_locations.length > 0)
  );

  // Admin verification only counts if location was actually submitted
  const isVerified = !!merchant.is_verified && hasLocation;
  const isOnMarketplace = !!merchant.is_on_marketplace;

  // Progress calculation for the 20%
  let marketplaceProgress = 0;
  if (hasLocation) marketplaceProgress += 7;
  if (isVerified) marketplaceProgress += 7;
  if (isOnMarketplace && isVerified) marketplaceProgress += 6;
  // Cap at 20
  marketplaceProgress = Math.min(marketplaceProgress, 20);

  const marketplaceDone = marketplaceProgress === 20;
  const totalProgress = storeProgress + marketplaceProgress;

  const visitors = stats?.visitors || 0;
  const analyticsOrders = stats?.orders || 0;
  const revenue = stats?.revenue || 0;

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-12">
      {merchant.payment_receiving_status !== 'ACTIVE' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 text-center">
          <p className="font-bold text-yellow-900">⚠️ Showcase Mode — activate to start selling</p>
          <Link href="/dashboard/settings/payment" className="inline-block mt-3 px-6 py-2.5 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700">
            Activate Store
          </Link>
        </div>
      )}

      {/* STORE SETUP 80% */}
      <div className="bg-white rounded-2xl border p-5">
        {storeComplete ? (
          <div className="flex items-center justify-between gap-3">
            <p className="font-extrabold text-green-700">✅ Store setup complete (80%)</p>
            <button onClick={() => setShowSteps(!showSteps)} className="text-xs font-bold text-purple-600">
              {showSteps ? 'Hide steps' : 'View steps'}
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-extrabold text-gray-900">🚀 Store Setup</h2>
              <span className="text-sm font-bold text-purple-600">{storeProgress}% / 80%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 mb-4">
              <div className="bg-purple-600 h-2.5 rounded-full transition-all" style={{ width: `${(storeProgress / 80) * 100}%` }} />
            </div>
          </>
        )}

        {(showSteps || !storeComplete) && (
          <div className="space-y-2 mt-4">
            {storeSteps.map((step, index) => (
              <div key={step.title} className={`flex items-center gap-3 p-3 rounded-xl ${step.done ? 'bg-green-50' : 'bg-gray-50'}`}>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 ${step.done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {step.done ? '✓' : index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold ${step.done ? 'text-green-800' : 'text-gray-800'}`}>{step.title}</p>
                  {!step.done && <p className="text-xs text-gray-500 mt-0.5">💡 {step.tip}</p>}
                </div>
                {!step.done && (
                  <Link href={step.href} className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold shrink-0 hover:bg-purple-700">
                    {step.cta}
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MARKETPLACE 20% - Compact */}
      <div className="bg-white rounded-2xl border p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-extrabold text-gray-900 text-base">🛒 Progress to Marketplace</h2>
          <span className="text-sm font-bold text-purple-600">{marketplaceProgress}% / 20%</span>
        </div>

        <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
          <div className="bg-orange-500 h-2 rounded-full transition-all" style={{ width: `${(marketplaceProgress / 20) * 100}%` }} />
        </div>

        <p className="text-xs text-gray-500 mb-3">
          Optional. Completing this shows your location on Marketplace and storefront. You can still sell on your own store.
        </p>

        <div className="space-y-1.5">
          {/* Step 1 */}
          <div className={`flex items-center gap-2.5 p-2.5 rounded-lg ${hasLocation ? 'bg-green-50' : 'bg-gray-50'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold shrink-0 ${hasLocation ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {hasLocation ? '✓' : '1'}
            </span>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold ${hasLocation ? 'text-green-800' : 'text-gray-800'}`}>Add business location</p>
            </div>
            {!hasLocation && (
              <Link href="/dashboard/settings/verification" className="px-2.5 py-1 bg-purple-600 text-white rounded-md text-xs font-bold">
                Add
              </Link>
            )}
          </div>

          {/* Step 2 */}
          <div className={`flex items-center gap-2.5 p-2.5 rounded-lg ${isVerified ? 'bg-green-50' : 'bg-gray-50'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold shrink-0 ${isVerified ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {isVerified ? '✓' : '2'}
            </span>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold ${isVerified ? 'text-green-800' : 'text-gray-800'}`}>
                Admin verification {hasLocation && !isVerified ? '(pending)' : ''}
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className={`flex items-center gap-2.5 p-2.5 rounded-lg ${isOnMarketplace && isVerified ? 'bg-green-50' : 'bg-gray-50'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold shrink-0 ${isOnMarketplace && isVerified ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {isOnMarketplace && isVerified ? '✓' : '3'}
            </span>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold ${isOnMarketplace && isVerified ? 'text-green-800' : 'text-gray-800'}`}>
                List & sync products
              </p>
            </div>
            {!(isOnMarketplace && isVerified) && (
              <Link href="/dashboard/settings/marketplace" className="px-2.5 py-1 bg-purple-600 text-white rounded-md text-xs font-bold">
                Marketplace
              </Link>
            )}
          </div>
        </div>

        {marketplaceDone && (
          <p className="text-center text-sm font-bold text-green-700 mt-3">🎉 Marketplace 20% complete!</p>
        )}
      </div>

      {/* STATS */}
      <div className="bg-white rounded-2xl border p-5 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 text-white">
            <p className="text-white/80 text-[11px] font-bold uppercase">Visitors</p>
            <p className="text-2xl font-extrabold mt-1">{visitors}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-4 text-white">
            <p className="text-white/80 text-[11px] font-bold uppercase">Orders</p>
            <p className="text-2xl font-extrabold mt-1">{counts.orders}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl p-4 text-white">
            <p className="text-white/80 text-[11px] font-bold uppercase">Sales</p>
            <p className="text-2xl font-extrabold mt-1">{formatCurrency(revenue)}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl p-4 text-white">
            <p className="text-white/80 text-[11px] font-bold uppercase">Conv.</p>
            <p className="text-2xl font-extrabold mt-1">
              {visitors ? ((analyticsOrders / visitors) * 100).toFixed(1) : '0.0'}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}