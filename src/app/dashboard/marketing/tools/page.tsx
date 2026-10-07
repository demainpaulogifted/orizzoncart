import Link from 'next/link';

export const metadata = { title: 'Other Marketing Tools' };

const tools = [
  {
    href: '/dashboard/marketing/source-products',
    icon: '📦',
    title: 'Source Products',
    desc: 'Connect to CJ, Alibaba and other suppliers to import dropshipping products into your store.',
    grad: 'from-blue-500 to-cyan-600',
    live: true,
  },
  {
    href: '',
    icon: '✉️',
    title: 'Email Marketing',
    desc: 'Send newsletters and promo campaigns to your customers.',
    grad: 'from-pink-500 to-rose-600',
    live: false,
  },
  {
    href: '',
    icon: '🔍',
    title: 'SEO Booster',
    desc: 'Optimize your store and products to rank higher on Google.',
    grad: 'from-amber-500 to-orange-600',
    live: false,
  },
  {
    href: '',
    icon: '🤝',
    title: 'Affiliate Program',
    desc: 'Let other people promote your products for a commission.',
    grad: 'from-green-500 to-emerald-600',
    live: false,
  },
];

export default function MarketingToolsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <Link href="/dashboard/marketing" className="text-purple-600 text-sm hover:underline">
          ← Back to Marketing
        </Link>
        <h1 className="text-2xl font-bold mt-2">🧰 Other Marketing Tools</h1>
        <p className="text-sm text-gray-500 mt-1">
          Extra growth tools to power up your store.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {tools.map((t) =>
          t.live ? (
            <Link
              key={t.title}
              href={t.href}
              className="group relative block bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-200"
            >
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${t.grad} text-white text-2xl flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform`}
              >
                {t.icon}
              </div>
              <h2 className="text-lg font-extrabold text-gray-900 mb-1">{t.title}</h2>
              <p className="text-sm text-gray-500 mb-4">{t.desc}</p>
              <span
                className={`inline-flex items-center gap-1 text-sm font-extrabold bg-gradient-to-r ${t.grad} bg-clip-text text-transparent`}
              >
                Open <span className="transition-transform group-hover:translate-x-1">→</span>
              </span>
            </Link>
          ) : (
            <div
              key={t.title}
              className="relative bg-white/60 rounded-2xl border border-dashed border-gray-300 p-6 opacity-80"
            >
              <span className="absolute top-4 right-4 text-[10px] font-extrabold bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                COMING SOON
              </span>
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${t.grad} opacity-40 text-white text-2xl flex items-center justify-center mb-4`}
              >
                {t.icon}
              </div>
              <h2 className="text-lg font-extrabold text-gray-400 mb-1">{t.title}</h2>
              <p className="text-sm text-gray-400">{t.desc}</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}