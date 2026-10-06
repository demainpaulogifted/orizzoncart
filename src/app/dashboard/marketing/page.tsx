import Link from 'next/link';

export const metadata = { title: 'Marketing' };

const cards = [
  {
    href: '/dashboard/marketing/free',
    icon: '🌍',
    title: 'Free Marketing',
    desc: 'Connect your products to Google, Meta, and TikTok catalogs for free.',
    grad: 'from-emerald-500 to-teal-600',
  },
  {
    href: '/dashboard/marketing/ads',
    icon: '🚀',
    title: 'Paid Ads',
    desc: 'Run bulk ads across all platforms using your connected catalogs.',
    grad: 'from-purple-600 to-blue-600',
  },
  {
    href: '/dashboard/marketing/tools',
    icon: '🧰',
    title: 'Other Marketing Tools',
    desc: 'Email, SEO, affiliates and more growth tools for your store.',
    grad: 'from-orange-500 to-pink-600',
  },
];

export default function MarketingPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Marketing Hub</h1>
        <p className="text-sm text-gray-500 mt-1">
          Grow your store with Free Marketing catalogs and Paid Ads.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group relative block bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-200"
          >
            <div
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${c.grad} text-white text-2xl flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform`}
            >
              {c.icon}
            </div>
            <h2 className="text-lg font-extrabold text-gray-900 mb-1">{c.title}</h2>
            <p className="text-sm text-gray-500 mb-4">{c.desc}</p>
            <span
              className={`inline-flex items-center gap-1 text-sm font-extrabold bg-gradient-to-r ${c.grad} bg-clip-text text-transparent`}
            >
              Open <span className="transition-transform group-hover:translate-x-1">→</span>
            </span>
            <span className="absolute top-6 right-6 text-gray-300 group-hover:text-gray-500 transition-colors text-xl">
              ›
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}