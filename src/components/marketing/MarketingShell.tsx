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

      <footer className="bg-gray-900 text-gray-400 py-10 mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link href="/" className="text-white font-extrabold text-lg">
              Orizzon<span className="text-purple-400">Cart</span>
            </Link>
            <p className="text-sm text-center md:text-left">
              Powered by OrizzonS Inc. • Built for Nigerian businesses
            </p>
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-x-5 gap-y-2 text-sm">
            <Link href="/about" className="hover:text-white">
              About
            </Link>
            <Link href="/contact" className="hover:text-white">
              Contact
            </Link>
            <Link href="/privacy" className="hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms
            </Link>
            <Link href="/track-order" className="hover:text-white">
              Track Order
            </Link>
            <Link href="/login" className="hover:text-white">
              Log in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}