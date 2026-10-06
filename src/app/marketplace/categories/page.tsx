import Link from 'next/link';

export default function MarketplaceCategoriesPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-24">
      <Link href="/marketplace" className="text-purple-600 text-sm hover:underline">← Back to Marketplace</Link>
      <h1 className="text-2xl font-bold mt-4 mb-2">🛍️ Shop by Category</h1>
      <p className="text-gray-500 text-sm">Categories are coming soon. For now, browse all products on the marketplace home.</p>
    </div>
  );
}