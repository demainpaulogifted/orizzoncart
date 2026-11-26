
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { DashboardInviteBanner } from '@/components/invite/InviteEarnBanners';

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
  visitors: number;
  pageviews: number;
  orders: number;
  paid_orders: number;
  pending_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  refunded_orders: number;
  revenue: number;
  today_orders: number;
  today_revenue: number;
  week_orders: number;
  week_revenue: number;
  month_orders: number;
  month_revenue: number;
  conversion_rate: number;
};

const EMPTY_STATS: DashboardStats = {
  visitors: 0,
  pageviews: 0,
  orders: 0,
  paid_orders: 0,
  pending_orders: 0,
  completed_orders: 0,
  cancelled_orders: 0,
  refunded_orders: 0,
  revenue: 0,
  today_orders: 0,
  today_revenue: 0,
  week_orders: 0,
  week_revenue: 0,
  month_orders: 0,
  month_revenue: 0,
  conversion_rate: 0,
};

function getActiveMerchantCookie(): string | null {
  if (typeof document === 'undefined') return null;

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

function StatCard({
  label,
  value,
  detail,
  color,
}: {
  label: string;
  value: string | number;
  detail?: string;
  color: string;
}) {
  return (
    <div className={`rounded-2xl p-4 text-white shadow-sm ${color}`}>
      <p className="text-[11px] font-bold uppercase tracking-wider text-white/80">
        {label}
      </p>
      <p className="mt-2 text-2xl font-extrabold break-words">
        {value}
      </p>
      {detail && (
        <p className="mt-1 text-xs text-white/75">{detail}</p>
      )}
    </div>
  );
}

function PerformanceCard({
  title,
  orders,
  sales,
  color,
}: {
  title: string;
  orders: number;
  sales: number;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <p className={`text-sm font-bold ${color}`}>{title}</p>
      <p className="mt-3 text-xl font-extrabold text-gray-900">
        {formatCurrency(sales)}
      </p>
      <p className="mt-1 text-xs text-gray-500">
        {orders} {orders === 1 ? 'order' : 'orders'}
      </p>
    </div>
  );
}

export default function DashboardHome() {
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [counts, setCounts] = useState({
    products: 0,
    pages: 0,
  });

  const [showSteps, setShowSteps] = useState(false);
  const [showMarketplaceSteps, setShowMarketplaceSteps] = useState(false);
  const [loading, setLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function loadDashboard() {
      const supabase = createClient();

      setLoading(true);
      setMerchant(null);
      setStats(EMPTY_STATS);
      setAnalyticsError(false);

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (cancelled) return;
        if (authError) throw authError;

        if (!user) {
          setLoading(false);
          return;
        }

        const cookieId = getActiveMerchantCookie();

        const { data: merchants, error: merchantsError } =
          await supabase
            .from('merchants')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true });

        if (cancelled) return;
        if (merchantsError) throw merchantsError;

        const merchantList = merchants || [];

        const active =
          merchantList.find(
            (item: Merchant) => item.id === cookieId
          ) ||
          merchantList[0] ||
          null;

        if (!active) {
          setLoading(false);
          return;
        }

        setMerchant(active);

        const [
          { count: products, error: productsError },
          { count: pages, error: pagesError },
        ] = await Promise.all([
          supabase
            .from('products')
            .select('id', { count: 'exact', head: true })
            .eq('merchant_id', active.id),

          supabase
            .from('store_pages')
            .select('id', { count: 'exact', head: true })
            .eq('merchant_id', active.id),
        ]);

        if (cancelled) return;

        if (productsError) throw productsError;
        if (pagesError) throw pagesError;

        setCounts({
          products: products || 0,
          pages: pages || 0,
        });

        const response = await fetch('/api/analytics', {
          cache: 'no-store',
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache',
          },
        });

        if (!response.ok) {
          throw new Error('Unable to load dashboard analytics');
        }

        const analytics = await response.json();

        if (!cancelled) {
          setStats({
            ...EMPTY_STATS,
            ...analytics,
          });
        }
      } catch (error) {
        if (
          cancelled ||
          (error instanceof Error && error.name === 'AbortError')
        ) {
          return;
        }

        console.error('Dashboard data failed to load:', error);
        setAnalyticsError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl p-10 text-center">
        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-purple-100 border-t-purple-600" />
        <p className="mt-4 text-sm text-gray-500">
          Preparing your business dashboard...
        </p>
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="mx-auto max-w-4xl rounded-2xl border bg-white p-8 text-center">
        <h2 className="font-bold text-gray-900">
          Your merchant account could not be loaded.
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Please sign in again or select your store.
        </p>
      </div>
    );
  }

  const storeUrl = merchant.store_slug
    ? `https://${merchant.store_slug}.orizzoncart.com.ng`
    : '/dashboard';

  const hasPayout = !!(
    merchant.payout_method ||
    merchant.bank_name ||
    merchant.paystack_secret_key ||
    merchant.flutterwave_secret_key
  );

  // STORE SETUP: 80%
  const storeSteps = [
    {
      done: true,
      title: 'Create your store',
      tip: 'Your store has been created.',
      href: storeUrl,
      cta: 'View Store',
    },
    {
      done: counts.products > 0,
      title: 'Add your first product',
      tip: 'Give customers something to discover.',
      href: '/dashboard/products/add',
      cta: 'Add Product',
    },
    {
      done: !!merchant.shipping_mode,
      title: 'Set delivery zones',
      tip: 'Configure how customers receive their orders.',
      href: '/dashboard/settings/shipping',
      cta: 'Set Delivery',
    },
    {
      done: counts.pages > 0,
      title: 'Add a trust page',
      tip: 'A Refund Policy or About page builds trust.',
      href: '/dashboard/pages',
      cta: 'Create Page',
    },
    {
      done: merchant.payment_receiving_status === 'ACTIVE',
      title: 'Activate payments',
      tip: 'Activate your payment receiving account.',
      href: '/dashboard/settings/payment',
      cta: 'Activate',
    },
    {
      done: hasPayout,
      title: 'Connect payout method',
      tip: 'Configure where your business receives money.',
      href: '/dashboard/settings/payment',
      cta: 'Connect',
    },
  ];

  const storeDoneCount = storeSteps.filter(
    (step) => step.done
  ).length;

  const storeProgress = Math.min(
    Math.round((storeDoneCount / storeSteps.length) * 80),
    80
  );

  const storeComplete = storeDoneCount === storeSteps.length;

  // OPTIONAL MARKETPLACE SETUP: 20%
  const hasLocation = !!(
    (merchant.business_state && merchant.business_state.trim()) ||
    (merchant.business_address && merchant.business_address.trim()) ||
    (Array.isArray(merchant.business_locations) &&
      merchant.business_locations.length > 0)
  );

  const isVerified = !!merchant.is_verified && hasLocation;
  const isOnMarketplace = !!merchant.is_on_marketplace;

  let marketplaceProgress = 0;

  if (hasLocation) marketplaceProgress += 7;
  if (isVerified) marketplaceProgress += 7;
  if (isOnMarketplace && isVerified) marketplaceProgress += 6;

  marketplaceProgress = Math.min(marketplaceProgress, 20);

  const marketplaceDone = marketplaceProgress === 20;

  const pendingSetup = storeSteps.filter(
    (step) => !step.done
  ).length;

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-12">

      {/* PAYMENT ACTIVATION NOTICE */}
      {merchant.payment_receiving_status !== 'ACTIVE' && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-amber-900">
                Store payment activation required
              </p>
              <p className="mt-1 text-xs text-amber-800">
                Complete payment activation to start receiving online payments.
              </p>
            </div>
            <Link
              href="/dashboard/settings/payment"
              className="shrink-0 rounded-xl bg-amber-600 px-3 py-2 text-xs font-bold text-white"
            >
              Activate
            </Link>
          </div>
        </div>
      )}

      {/* STORE SETUP */}
      <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-purple-600">
                Your business
              </p>
              <h2 className="mt-1 text-lg font-extrabold text-gray-900">
                {storeComplete ? 'Store setup complete' : 'Store setup'}
              </h2>
            </div>

            <div className="text-right">
              <p className="text-xl font-extrabold text-purple-600">
                {storeProgress}%
              </p>
              <p className="text-[11px] text-gray-400">
                of 80%
              </p>
            </div>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-600 to-violet-500 transition-all duration-500"
              style={{ width: `${(storeProgress / 80) * 100}%` }}
            />
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-xs text-gray-500">
              {storeComplete
                ? 'Your essential store setup is complete.'
                : `${pendingSetup} setup ${pendingSetup === 1 ? 'task' : 'tasks'} remaining.`}
            </p>

            <button
              type="button"
              onClick={() => setShowSteps(!showSteps)}
              className="shrink-0 rounded-xl border border-purple-100 bg-purple-50 px-4 py-2 text-xs font-bold text-purple-700"
            >
              {showSteps ? 'Hide steps ↑' : 'View steps ↓'}
            </button>
          </div>

          {showSteps && (
            <div className="mt-5 space-y-2 border-t border-gray-100 pt-4">
              {storeSteps.map((step, index) => (
                <div
                  key={step.title}
                  className={`flex items-center gap-3 rounded-2xl p-3 ${
                    step.done ? 'bg-green-50' : 'bg-gray-50'
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${
                      step.done
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step.done ? '✓' : index + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-bold ${
                        step.done ? 'text-green-800' : 'text-gray-800'
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {step.done ? 'Completed' : step.tip}
                    </p>
                  </div>

                  <Link
                    href={step.href}
                    className={`shrink-0 rounded-xl px-3 py-2 text-xs font-bold ${
                      step.done
                        ? 'border border-green-200 bg-white text-green-700'
                        : 'bg-purple-600 text-white'
                    }`}
                  >
                    {step.done ? 'View' : step.cta}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {storeComplete && (
          <div className="border-t border-green-100 bg-green-50/70 px-5 py-3">
            <p className="text-xs font-bold text-green-800">
              ✓ All essential store setup requirements completed.
            </p>
          </div>
        )}
      </section>

      <DashboardInviteBanner />

      {/* OPTIONAL MARKETPLACE SETUP */}
      <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
              Optional growth opportunity
            </p>
            <h2 className="mt-1 text-lg font-extrabold text-gray-900">
              Marketplace visibility
            </h2>
          </div>

          <div className="text-right">
            <p className="text-xl font-extrabold text-purple-600">
              {marketplaceProgress}%
            </p>
            <p className="text-[11px] text-gray-400">of 20%</p>
          </div>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-500 transition-all duration-500"
            style={{
              width: `${(marketplaceProgress / 20) * 100}%`,
            }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="max-w-[70%] text-xs leading-relaxed text-gray-500">
            {marketplaceDone
              ? 'Your business has completed Marketplace requirements.'
              : 'Optional. You can sell through your own store without completing these steps.'}
          </p>

          <button
            type="button"
            onClick={() =>
              setShowMarketplaceSteps(!showMarketplaceSteps)
            }
            className="shrink-0 rounded-xl border border-orange-100 bg-orange-50 px-3 py-2 text-xs font-bold text-orange-700"
          >
            {showMarketplaceSteps ? 'Hide ↑' : 'Explore ↓'}
          </button>
        </div>

        {showMarketplaceSteps && (
          <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
            {[
              {
                done: hasLocation,
                title: 'Add business location',
                href: '/dashboard/settings/verification',
                cta: 'Add location',
                description: 'Help nearby customers discover your business.',
              },
              {
                done: isVerified,
                title: 'Admin verification',
                href: null,
                cta: '',
                description: hasLocation
                  ? 'Your submitted location awaits verification if not yet approved.'
                  : 'Submit your business location first.',
              },
              {
                done: isOnMarketplace && isVerified,
                title: 'List and sync products',
                href: '/dashboard/settings/marketplace',
                cta: 'Marketplace',
                description: 'Make eligible products discoverable on Marketplace.',
              },
            ].map((step, index) => (
              <div
                key={step.title}
                className={`flex items-center gap-3 rounded-xl p-3 ${
                  step.done ? 'bg-green-50' : 'bg-gray-50'
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    step.done
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step.done ? '✓' : index + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-gray-800">
                    {step.title}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {step.done ? 'Completed' : step.description}
                  </p>
                </div>

                {!step.done && step.href && (
                  <Link
                    href={step.href}
                    className="shrink-0 rounded-lg bg-purple-600 px-3 py-2 text-xs font-bold text-white"
                  >
                    {step.cta}
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}

        {marketplaceDone && (
          <p className="mt-4 rounded-xl bg-green-50 p-3 text-center text-xs font-bold text-green-700">
            🎉 Marketplace setup complete!
          </p>
        )}
      </section>

      {/* BUSINESS ANALYTICS */}
      <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-purple-600">
              Business performance
            </p>
            <h2 className="mt-1 text-lg font-extrabold text-gray-900">
              Your store analytics
            </h2>
          </div>

          <Link
            href="/dashboard/analytics"
            className="rounded-xl border border-purple-100 bg-purple-50 px-3 py-2 text-xs font-bold text-purple-700"
          >
            Full analytics →
          </Link>
        </div>

        {analyticsError && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            Analytics could not be refreshed. Please reload the dashboard.
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Visitors"
            value={stats.visitors.toLocaleString()}
            detail="Last 30 days"
            color="bg-gradient-to-br from-blue-500 to-indigo-600"
          />

          <StatCard
            label="Orders"
            value={stats.orders.toLocaleString()}
            detail={`${stats.pending_orders} pending payment`}
            color="bg-gradient-to-br from-emerald-500 to-teal-600"
          />

          <StatCard
            label="Sales"
            value={formatCurrency(stats.revenue)}
            detail="Paid, non-refunded orders"
            color="bg-gradient-to-br from-purple-500 to-violet-600"
          />

          <StatCard
            label="Conversion"
            value={`${stats.conversion_rate.toFixed(1)}%`}
            detail="Last 30 days"
            color="bg-gradient-to-br from-orange-400 to-amber-500"
          />
        </div>

        <div className="mt-5">
          <h3 className="mb-3 text-sm font-extrabold text-gray-900">
            Sales performance
          </h3>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <PerformanceCard
              title="Today"
              orders={stats.today_orders}
              sales={stats.today_revenue}
              color="text-blue-600"
            />

            <PerformanceCard
              title="This week"
              orders={stats.week_orders}
              sales={stats.week_revenue}
              color="text-purple-600"
            />

            <PerformanceCard
              title="This month"
              orders={stats.month_orders}
              sales={stats.month_revenue}
              color="text-emerald-600"
            />
          </div>
        </div>

        <div className="mt-5 border-t border-gray-100 pt-4">
          <h3 className="mb-3 text-sm font-extrabold text-gray-900">
            Order overview
          </h3>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                label: 'Paid orders',
                value: stats.paid_orders,
                color: 'text-green-700',
              },
              {
                label: 'Pending payment',
                value: stats.pending_orders,
                color: 'text-amber-700',
              },
              {
                label: 'Delivered',
                value: stats.completed_orders,
                color: 'text-blue-700',
              },
              {
                label: 'Cancelled',
                value: stats.cancelled_orders,
                color: 'text-red-700',
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl bg-gray-50 p-3"
              >
                <p className="text-[11px] font-medium text-gray-500">
                  {item.label}
                </p>
                <p className={`mt-1 text-xl font-extrabold ${item.color}`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {stats.refunded_orders > 0 && (
            <p className="mt-3 text-xs text-gray-500">
              Refunded orders: {stats.refunded_orders}
            </p>
          )}
        </div>

        <p className="mt-4 text-[11px] leading-relaxed text-gray-400">
          Orders include pending payments. Sales only include paid orders
          that have not been cancelled or refunded. Visitor and conversion
          statistics cover the last 30 days.
        </p>
      </section>
    </div>
  );
}
