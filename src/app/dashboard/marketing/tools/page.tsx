import Link from 'next/link';

export const metadata = { title: 'Other Marketing Tools' };

const storeTools = [
  { href: '/dashboard/reviews', icon: '⭐', grad: 'from-yellow-400 to-amber-500', title: 'Reviews', desc: 'Approve & manage customer reviews' },
  { href: '/dashboard/orders/dropshipping', icon: '🚚', grad: 'from-blue-500 to-cyan-600', title: 'Dropship Orders', desc: 'Supplier fulfillment & profit tracking' },
  { href: '/dashboard/pages', icon: '📄', grad: 'from-gray-500 to-gray-600', title: 'Pages', desc: 'About, refund policy & trust pages' },
  { href: '/dashboard/analytics', icon: '📈', grad: 'from-red-500 to-rose-600', title: 'Stats', desc: 'Visitors, sales & conversion rate' },
  { href: '/dashboard/settings/marketplace', icon: '🛍️', grad: 'from-purple-500 to-fuchsia-600', title: 'Marketplace', desc: 'List your store on the marketplace' },
  { href: '/dashboard/settings/shipping-zones', icon: '🗺️', grad: 'from-teal-500 to-emerald-600', title: 'Shipping Zones', desc: 'State-based delivery pricing' },
];

const growthTools = [
  { href: '/dashboard/marketing/source-products', icon: '📦', grad: 'from-blue-500 to-cyan-600', title: 'Source Products', desc: 'Import from CJ, Alibaba & more', live: true },
];

const comingSoon = [
  { icon: '✉️', grad: 'from-pink-400 to-rose-500', title: 'Email Marketing', desc: 'Newsletters & promo campaigns' },
  { icon: '🔍', grad: 'from-amber-400 to-orange-500', title: 'SEO Booster', desc: 'Rank higher on Google' },
  { icon: '🤝', grad: 'from-green-400 to-emerald-500', title: 'Affiliate Program', desc: 'Others promote for commission' },
];

function ToolCard({ t }: { t: any }) {
  return (
    <Link
      href={t.href}
      className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-3 hover:border-purple-300 hover:shadow-md transition-all"
    >
      <span className={`w-10 h-10 rounded-lg bg-gradient-to-br ${t.grad} text-lg flex items-center justify-center shrink-0 shadow-sm`}>
        {t.icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-gray-900 truncate">{t.title}</span>
        <span className="block text-[11px] text-gray-500 truncate">{t.desc}</span>
      </span>
      <span className="text-gray-300 text-base shrink-0">›</span>
    </Link>
  );
}

export default function MarketingToolsPage() {
  return (
    <div className="p-6 space-y-8">
      <div>
        <Link href="/dashboard/marketing" className="text-purple-600 text-sm hover:underline">
          ← Back to Marketing
        </Link>
        <h1 className="text-2xl font-bold mt-2">🧰 Other Marketing Tools</h1>
        <p className="text-sm text-gray-500 mt-1">
          Every tool to run and grow your store — organized in one place.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-400">
          Store Tools
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {storeTools.map((t) => (
            <ToolCard key={t.href} t={t} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-400">
          Growth Tools
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {growthTools.map((t) => (
            <ToolCard key={t.href} t={t} />
          ))}
          {comingSoon.map((t) => (
            <div
              key={t.title}
              className="flex items-center gap-3 bg-white/60 border border-dashed border-gray-300 rounded-xl p-3 opacity-70"
            >
              <span className={`w-10 h-10 rounded-lg bg-gradient-to-br ${t.grad} opacity-40 text-lg flex items-center justify-center shrink-0`}>
                {t.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-gray-400 truncate">
                  {t.title}
                  <span className="ml-2 text-[9px] font-extrabold bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full align-middle">
                    SOON
                  </span>
                </span>
                <span className="block text-[11px] text-gray-400 truncate">{t.desc}</span>
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}