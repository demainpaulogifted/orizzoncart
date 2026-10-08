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
  const [counts, setCounts] = useState({
    products: 0,
    pages: 0,
    orders: 0,
  });
  const [showSteps, setShowSteps] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function loadDashboard() {
      const supabase = createClient();

      // Clear previous store data while the selected store loads.
      setMerchant(null);
      setStats(null);
      setCounts({ products: 0, pages: 0, orders: 0 });

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (cancelled) return;
        if (authError) throw authError;

        if (!user) {
          setMerchant(null);
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
          setMerchant(null);
          return;
        }

        setMerchant(active);

        const [
          { count: products, error: productsError },
          { count: pages, error: pagesError },
          { count: orders, error: ordersError },
        ] = await Promise.all([
          supabase
            .from('products')
            .select('id', { count: 'exact', head: true })
            .eq('merchant_id', active.id),

          supabase
            .from('store_pages')
            .select('id', { count: 'exact', head: true })
            .eq('merchant_id', active.id),

          supabase
            .from('orders')
            .select('id', { count: 'exact', head: true })
            .eq('merchant_id', active.id),
        ]);

        if (cancelled) return;

        if (productsError) {
          console.error('Failed to load product count:', productsError);
        }

        if (pagesError) {
          console.error('Failed to load page count:', pagesError);
        }

        if (ordersError) {
          console.error('Failed to load order count:', ordersError);
        }

        setCounts({
          products: products || 0,
          pages: pages || 0,
          orders: orders || 0,
        });

        // The analytics endpoint reads active_merchant_id too.
        const response = await fetch('/api/analytics', {
          cache: 'no-store',
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache',
          },
        });

        if (!response.ok) {
          throw new Error(
            `Analytics request failed (${response.status})`
          );
        }

        const analytics: DashboardStats = await response.json();

        if (!cancelled) {
          setStats(analytics);
        }
      } catch (error) {
        if (
          cancelled ||
          (error instanceof Error && error.name === 'AbortError')
        ) {
          return;
        }

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
    return (
      <div className="p-10 text-center text-gray-500">
        Loading dashboard...
      </div>
    );
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

  const steps = [
    {
      done: true,
      title: 'Create your store',
      tip: 'Done! Your store is live on OrizzonCart.',
      href: storeUrl,
      cta: 'View Store',
    },
    {
      done: counts.products > 0,
      title: 'Add your first product',
      tip: 'Stores with 3+ products and real photos sell 4x more.',
      href: '/dashboard/products/add',
      cta: 'Add Product',
    },
    {
      done: !!merchant.shipping_mode,
      title: 'Set shipping or pickup',
      tip: 'Digital products skip shipping automatically — set this for physical items.',
      href: '/dashboard/settings/shipping',
      cta: 'Set Shipping',
    },
    {
      done: counts.pages > 0,
      title: 'Add a trust page',
      tip: 'A Refund Policy or About page can lift conversion by up to 30%.',
      href: '/dashboard/pages',
      cta: 'Create Page',
    },
    {
      done: merchant.payment_receiving_status === 'ACTIVE',
      title: 'Activate payments',
      tip: 'Pay the one-time activation fee, then choose: your own keys (0% fee) or OrizzonPay (5% fee).',
      href: '/dashboard/settings/payment',
      cta: 'Activate',
    },
    {
      done: hasPayout,
      title: 'Connect your payout method',
      tip: 'Own keys = money lands in your Paystack directly. OrizzonPay = we route sales to your bank.',
      href: '/dashboard/settings/payment',
      cta: 'Connect',
    },
  ];

  const doneCount = steps.filter((step) => step.done).length;
  const progress = Math.round((doneCount / steps.length) * 100);
  const complete = progress === 100;

  const visitors = stats?.visitors || 0;
  const analyticsOrders = stats?.orders || 0;
  const revenue = stats?.revenue || 0;

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-12">
      {merchant.payment_receiving_status !== 'ACTIVE' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 text-center">
          <p className="font-bold text-yellow-900">
            ⚠️ Showcase Mode — activate to start selling
          </p>

          <Link
            href="/dashboard/settings/payment"
            className="inline-block mt-3 px-6 py-2.5 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700"
          >
            Activate Store
          </Link>
        </div>
      )}

      {/* SETUP CHECKLIST */}
      <div className="bg-white rounded-2xl border p-5">
        {complete ? (
          <div className="flex items-center justify-between gap-3">
            <p className="font-extrabold text-green-700">
              🎉 Store setup 100% complete — you're ready to sell!
            </p>

            <button
              onClick={() => setShowSteps(!showSteps)}
              className="text-xs font-bold text-purple-600 shrink-0"
            >
              {showSteps ? 'Hide steps' : 'View steps'}
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-extrabold text-gray-900">
                🚀 Store Setup
              </h2>

              <span className="text-sm font-bold text-purple-600">
                {progress}% complete
              </span>
            </div>

            <div className="w-full bg-gray-100 rounded-full h-2.5 mb-4">
              <div
                className="bg-purple-600 h-2.5 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        )}

        {(showSteps || !complete) && (
          <div className="space-y-2 mt-4">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className={`flex items-center gap-3 p-3 rounded-xl ${
                  step.done ? 'bg-green-50' : 'bg-gray-50'
                }`}
              >
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 ${
                    step.done
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step.done ? '✓' : index + 1}
                </span>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-bold ${
                      step.done ? 'text-green-800' : 'text-gray-800'
                    }`}
                  >
                    {step.title}
                  </p>

                  {!step.done && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      💡 {step.tip}
                    </p>
                  )}
                </div>

                {!step.done && (
                  <Link
                    href={step.href}
                    target={
                      step.href.startsWith('http') ? '_blank' : undefined
                    }
                    rel={
                      step.href.startsWith('http')
                        ? 'noreferrer'
                        : undefined
                    }
                    className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold shrink-0 hover:bg-purple-700"
                  >
                    {step.cta}
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* STATS + QUICK ACTIONS */}
      <div className="bg-white rounded-2xl border p-5 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 text-white">
            <p className="text-white/80 text-[11px] font-bold uppercase">
              Visitors
            </p>
            <p className="text-2xl font-extrabold mt-1">
              {visitors}
            </p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-4 text-white">
            <p className="text-white/80 text-[11px] font-bold uppercase">
              Orders
            </p>
            <p className="text-2xl font-extrabold mt-1">
              {counts.orders}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl p-4 text-white">
            <p className="text-white/80 text-[11px] font-bold uppercase">
              Sales
            </p>
            <p className="text-2xl font-extrabold mt-1">
              {formatCurrency(revenue)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl p-4 text-white">
            <p className="text-white/80 text-[11px] font-bold uppercase">
              Conv.
            </p>
            <p className="text-2xl font-extrabold mt-1">
              {visitors
                ? ((analyticsOrders / visitors) * 100).toFixed(1)
                : '0.0'}
              %
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1 border-t">
          <Link
            href="/dashboard/products/add"
            className="rounded-xl border p-3.5 hover:border-purple-400 font-bold text-sm text-center"
          >
            ➕ Add Product
          </Link>

          <Link
            href="/dashboard/pages"
            className="rounded-xl border p-3.5 hover:border-purple-400 font-bold text-sm text-center"
          >
            📄 Trust Page
          </Link>

          <Link
            href="/dashboard/settings/payment"
            className="rounded-xl border p-3.5 hover:border-purple-400 font-bold text-sm text-center"
          >
            💳 Payment
          </Link>

          <Link
            href="/dashboard/settings/theme"
            className="rounded-xl border p-3.5 hover:border-purple-400 font-bold text-sm text-center"
          >
            🎨 Theme
          </Link>

          <Link
            href="/dashboard/settings/shipping"
            className="rounded-xl border p-3.5 hover:border-purple-400 font-bold text-sm text-center"
          >
            🚚 Shipping
          </Link>

          <Link
            href={storeUrl}
            target={storeUrl.startsWith('http') ? '_blank' : undefined}
            rel={
              storeUrl.startsWith('http') ? 'noreferrer' : undefined
            }
            className="rounded-xl border p-3.5 hover:border-purple-400 font-bold text-sm text-center"
          >
            👀 View Store
          </Link>
        </div>
      </div>
    </div>
  );
}