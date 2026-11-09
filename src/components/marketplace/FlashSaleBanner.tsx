import Link from 'next/link';

export function FlashSaleBanner() {
  return (
    <Link
      href="/marketplace/flash-deals"
      className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 text-white rounded-2xl p-4 flex items-center justify-between gap-3 shadow-lg"
    >
      <div>
        <p className="font-extrabold text-lg leading-tight">⚡ Flash Deals</p>
        <p className="text-xs text-orange-100">
          Real discounts from verified Nigerian stores
        </p>
      </div>
      <span className="shrink-0 bg-white text-red-600 rounded-full px-4 py-2 text-xs font-extrabold">
        See Flash Deals →
      </span>
    </Link>
  );
}
