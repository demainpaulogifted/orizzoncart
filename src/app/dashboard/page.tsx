'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';

export default function DashboardHome() {
  const [merchant, setMerchant] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [counts, setCounts] = useState({ products: 0, pages: 0, orders: 0 });
  const [showSteps, setShowSteps] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const cookieId = document.cookie.split(';').map((c) => c.trim()).find((c) => c.startsWith('active_merchant_id='))?.split('=')[1];
      const { data: merchants } = await supabase.from('merchants').select('*').eq('user_id', user.id);
      const active = (merchants || []).find((m: any) => m.id === cookieId) || (merchants || [])[0];
      if (!active) return;
      setMerchant(active);

      const [{ count: products }, { count: pages }, { count: orders }] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('merchant_id', active.id),
        supabase.from('store_pages').select('*', { count: 'exact', head: true }).eq('merchant_id', active.id),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('merchant_id', active.id),
      ]);
      setCounts({ products: products || 0, pages: pages || 0, orders: orders || 0 });
      fetch('/api/analytics').then((r) => r.json()).then(setStats).catch(() => {});
    };
    load();
  }, []);

  if (!merchant) return <div className="p-10 text-center text-gray-500">Loading dashboard...</div>;

  const hasPayout = !!(merchant.payout_method || merchant.bank_name || merchant.paystack_secret_key || merchant.flutterwave_secret_key);
  const steps = [
    { done: true, title: 'Create your store', tip: 'Done! Your store is live on OrizzonCart.', href: `/store/${merchant.store_slug}`, cta: 'View Store' },
    { done: counts.products > 0, title: 'Add your first product', tip: 'Stores with 3+ products and real photos sell 4x more.', href: '/dashboard/products/add', cta: 'Add Product' },
    { done: !!merchant.shipping_mode, title: 'Set shipping or pickup', tip: 'Digital products skip shipping automatically — set this for physical items.', href: '/dashboard/settings/shipping', cta: 'Set Shipping' },
    { done: counts.pages > 0, title: 'Add a trust page', tip: 'A Refund Policy or About page can lift conversion by up to 30%.', href: '/dashboard/pages', cta: 'Create Page' },
    { done: merchant.payment_receiving_status === 'ACTIVE', title: 'Activate payments', tip: 'Pay the one-time activation fee, then choose: your own keys (0% fee) or OrizzonPay (5% fee).', href: '/dashboard/settings/payment', cta: 'Activate' },
    { done: hasPayout, title: 'Connect your payout method', tip: 'Own keys = money lands in your Paystack directly. OrizzonPay = we route sales to your bank.', href: '/dashboard/settings/payment', cta: 'Connect' },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  const progress = Math.round((doneCount / steps.length) * 100);
  const complete = progress === 100;

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {merchant.payment_receiving_status !== 'ACTIVE' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 text-center">
          <p className="font-bold text-yellow-900">⚠️ Showcase Mode — activate to start selling</p>
          <Link href="/dashboard/settings/payment" className="inline-block mt-3 px-6 py-2.5 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700">
            Activate Store
          </Link>
        </div>
      )}

      {/* SETUP CHECKLIST — collapses when complete */}
      <div className="bg-white rounded-2xl border p-5">
        {complete ? (
          <div className="flex items-center justify-between gap-3">
            <p className="font-extrabold text-green-700">🎉 Store setup 100% complete — you're ready to sell!</p>
            <button onClick={() => setShowSteps(!showSteps)} className="text-xs font-bold text-purple-600 shrink-0">
              {showSteps ? 'Hide steps' : 'View steps'}
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-extrabold text-gray-900">🚀 Store Setup</h2>
              <span className="text-sm font-bold text-purple-600">{progress}% complete</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 mb-4">
              <div className="bg-purple-600 h-2.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </>
        )}

        {(showSteps || !complete) && (
          <div className="space-y-2 mt-4">
            {steps.map((s, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${s.done ? 'bg-green-50' : 'bg-gray-50'}`}>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 ${s.done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {s.done ? '✓' : i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold ${s.done ? 'text-green-800' : 'text-gray-800'}`}>{s.title}</p>
                  {!s.done && <p className="text-xs text-gray-500 mt-0.5">💡 {s.tip}</p>}
                </div>
                {!s.done && (
                  <Link href={s.href} className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold shrink-0 hover:bg-purple-700">
                    {s.cta}
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* STATS + QUICK ACTIONS — wrapped together */}
      <div className="bg-white rounded-2xl border p-5 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 text-white">
            <p className="text-white/80 text-[11px] font-bold uppercase">Visitors</p>
            <p className="text-2xl font-extrabold mt-1">{stats?.visitors || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-4 text-white">
            <p className="text-white/80 text-[11px] font-bold uppercase">Orders</p>
            <p className="text-2xl font-extrabold mt-1">{counts.orders}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl p-4 text-white">
            <p className="text-white/80 text-[11px] font-bold uppercase">Sales</p>
            <p className="text-2xl font-extrabold mt-1">{formatCurrency(stats?.revenue || 0)}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl p-4 text-white">
            <p className="text-white/80 text-[11px] font-bold uppercase">Conv.</p>
            <p className="text-2xl font-extrabold mt-1">{stats?.visitors ? ((stats.orders / stats.visitors) * 100).toFixed(1) : '0.0'}%</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1 border-t">
          <Link href="/dashboard/products/add" className="rounded-xl border p-3.5 hover:border-purple-400 font-bold text-sm text-center">➕ Add Product</Link>
          <Link href="/dashboard/pages" className="rounded-xl border p-3.5 hover:border-purple-400 font-bold text-sm text-center">📄 Trust Page</Link>
          <Link href="/dashboard/settings/payment" className="rounded-xl border p-3.5 hover:border-purple-400 font-bold text-sm text-center">💳 Payment</Link>
          <Link href="/dashboard/settings/theme" className="rounded-xl border p-3.5 hover:border-purple-400 font-bold text-sm text-center">🎨 Theme</Link>
          <Link href="/dashboard/settings/shipping" className="rounded-xl border p-3.5 hover:border-purple-400 font-bold text-sm text-center">🚚 Shipping</Link>
          <Link href={`/store/${merchant.store_slug}`} target="_blank" className="rounded-xl border p-3.5 hover:border-purple-400 font-bold text-sm text-center">👀 View Store</Link>
        </div>
      </div>
    </div>
  );
}