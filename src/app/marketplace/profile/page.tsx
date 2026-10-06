import Link from 'next/link';

export default function MarketplaceProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-24">
      <Link href="/marketplace" className="text-purple-600 text-sm hover:underline">← Back to Marketplace</Link>
      <h1 className="text-2xl font-bold mt-4 mb-2">👤 Profile</h1>
      <p className="text-gray-500 text-sm mb-6">One account for every store you shop from.</p>
      <div className="bg-white border rounded-xl p-6 text-center text-gray-500 text-sm space-y-3">
        <p>Customer accounts arrive in Phase 2.</p>
        <p>
          Are you a merchant?{' '}
          <Link href="/login" className="text-purple-600 font-semibold hover:underline">
            Log in to manage your store →
          </Link>
        </p>
      </div>
    </div>
  );
}