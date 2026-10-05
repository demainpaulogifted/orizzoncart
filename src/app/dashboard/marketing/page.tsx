import Link from 'next/link';

export default function MarketingPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Marketing Hub</h1>
      <p className="text-gray-500 mb-8">Grow your store with Free Marketing catalogs and Paid Ads.</p>

      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/dashboard/marketing/free" className="block p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition">
          <div className="text-3xl mb-3">🌍</div>
          <h2 className="text-xl font-bold mb-1">Free Marketing</h2>
          <p className="text-gray-600 text-sm">Connect your products to Google, Meta, and TikTok catalogs for free.</p>
        </Link>

        <Link href="/dashboard/marketing/ads" className="block p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition">
          <div className="text-3xl mb-3">🚀</div>
          <h2 className="text-xl font-bold mb-1">Paid Ads</h2>
          <p className="text-gray-600 text-sm">Run bulk ads across all platforms using your connected catalogs.</p>
        </Link>
      </div>
    </div>
  );
}