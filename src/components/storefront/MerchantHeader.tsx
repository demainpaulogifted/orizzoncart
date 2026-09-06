import Link from 'next/link';
import Image from 'next/image';

export function MerchantHeader({ merchant, isShowcaseMode }: { merchant: any; isShowcaseMode: boolean }) {
  return (
    <header className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-3">
          {merchant.logo_url ? (
            <Image src={merchant.logo_url} alt={merchant.store_name} width={40} height={40} className="rounded" />
          ) : (
            <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
              <span className="text-xl font-bold text-gray-600">{merchant.store_name.charAt(0).toUpperCase()}</span>
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-900">{merchant.store_name}</h1>
            <p className="text-xs text-gray-500">{merchant.business_name}</p>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          {isShowcaseMode ? (
            <button disabled className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg text-sm font-medium cursor-not-allowed">Cart (0)</button>
          ) : (
            <Link href="/cart" className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800">Cart (0)</Link>
          )}
        </div>
      </div>
    </header>
  );
}