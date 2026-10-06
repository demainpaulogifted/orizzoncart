import Link from 'next/link';

export default function MarketplaceOrdersPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-24">
      <Link href="/marketplace" className="text-purple-600 text-sm hover:underline">← Back to Marketplace</Link>
      <h1 className="text-2xl font-bold mt-4 mb-2">📦 My Orders</h1>
      <p className="text-gray-500 text-sm mb-6">Track all your orders from every store in one place.</p>
      <div className="bg-white border rounded-xl p-6 text-center text-gray-500 text-sm">
        Unified customer accounts & order tracking arrive in Phase 2.
        <br />
        <Link href="/track-order" className="inline-block mt-3 text-purple-600 font-semibold hover:underline">
          Track an order now →
        </Link>
      </div>
    </div>
  );
}