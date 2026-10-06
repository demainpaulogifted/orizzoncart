import Link from 'next/link';

export function MarketplaceReturnBanner() {
  return (
    <div className="bg-purple-50 border-b border-purple-100 py-2.5 px-4 text-center sticky top-0 z-50">
      <Link href="/marketplace" className="text-xs font-bold text-purple-700 hover:underline">
        ← Return to OrizzonCart Marketplace
      </Link>
    </div>
  );
}