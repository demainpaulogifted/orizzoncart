import Link from 'next/link';

export function MainSiteFooter() {
  return (
    <footer className="bg-[#160b2b] px-5 py-14 text-purple-100">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-2xl font-extrabold tracking-tight text-white">
              Orizzon<span className="text-purple-400">Cart</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-7 text-purple-200/75">
              Your online store. Your customers. More ways to sell.
              Built to help businesses grow.
            </p>
            <Link
              href="/signup"
              className="mt-5 inline-flex rounded-lg bg-purple-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-purple-500"
            >
              Start selling free
            </Link>
          </div>

          <div>
            <h2 className="mb-5 text-sm font-bold uppercase tracking-wider text-white">
              OrizzonCart
            </h2>
            <ul className="space-y-3 text-sm text-purple-200/80">
              <li><Link href="/about" className="hover:text-white">About us</Link></li>
              <li><Link href="/platform" className="hover:text-white">Our platform</Link></li>
              <li><Link href="/orizzoncart-journey" className="hover:text-white">Getting started</Link></li>
              <li><Link href="/blog" className="hover:text-white">Business blog</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="mb-5 text-sm font-bold uppercase tracking-wider text-white">
              Marketplace
            </h2>
            <ul className="space-y-3 text-sm text-purple-200/80">
              <li><a href="https://marketplace.orizzoncart.com.ng/marketplace" className="hover:text-white">Browse products</a></li>
              <li><a href="https://marketplace.orizzoncart.com.ng/marketplace/categories" className="hover:text-white">Shop categories</a></li>
              <li><a href="https://marketplace.orizzoncart.com.ng/marketplace/stores" className="hover:text-white">Explore stores</a></li>
              <li><a href="https://marketplace.orizzoncart.com.ng/marketplace/return-policy" className="hover:text-white">Returns and refunds</a></li>
            </ul>
          </div>

          <div>
            <h2 className="mb-5 text-sm font-bold uppercase tracking-wider text-white">
              Account & Support
            </h2>
            <ul className="space-y-3 text-sm text-purple-200/80">
              <li><Link href="/signup" className="hover:text-white">Create an account</Link></li>
              <li><Link href="/login" className="hover:text-white">Sign in</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact support</Link></li>
              <li><Link href="/track-order" className="hover:text-white">Track an order</Link></li>
              <li><Link href="/terms" className="hover:text-white">Terms of service</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Privacy policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/15 pt-6">
          <div className="flex flex-col justify-between gap-4 text-xs text-purple-200/60 sm:flex-row sm:items-center">
            <p>© {new Date().getFullYear()} OrizzonS. All rights reserved.</p>
            <p>OrizzonCart · Online stores · Marketplace · Business growth</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
