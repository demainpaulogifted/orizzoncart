import { MainSiteFooter } from '@/components/marketing/MainSiteFooter';
import Link from 'next/link';

export function MarketingShell({
  children,
  wide = false,
}: {
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-extrabold tracking-tight">
            Orizzon<span className="text-purple-600">Cart</span>
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/marketplace"
              className="text-sm font-semibold text-purple-600 hover:text-purple-800 px-3 py-2"
            >
              🛍️ OrizzonCart Marketplace
            </Link>
            <Link
              href="/track-order"
              className="hidden sm:block text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2"
            >
              Track Order
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold text-white bg-gray-900 rounded-full px-4 py-2 hover:bg-gray-800"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>
      <main className={`flex-1 w-full ${wide ? '' : 'max-w-3xl mx-auto px-4 py-10 sm:py-14'}`}>
        {children}
      </main>
      <MainSiteFooter />
    </div>
  );
}