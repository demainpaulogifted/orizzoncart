import Link from 'next/link';
import { THEMES } from '@/lib/themes';

const steps = [
  { icon: '👤', title: 'Create your account', text: 'Sign up free with your email in 30 seconds.' },
  { icon: '🏪', title: 'Name your store', text: 'Get your own link like paulsfashion.orizzoncart.com instantly.' },
  { icon: '🎨', title: 'Pick a premium theme', text: 'Choose from 10 designer themes built for Nigerian businesses.' },
  { icon: '📦', title: 'Add your products', text: 'Photo, name, price. That is all you need to publish.' },
  { icon: '💳', title: 'Connect payments', text: 'Plug in your Paystack or Flutterwave keys + your WhatsApp number.' },
  { icon: '🚀', title: 'Publish & sell', text: 'Your store goes live. Customers pay, you get receipts & tracking.' },
];

const features = [
  { icon: '💬', title: 'WhatsApp Selling', text: 'A floating WhatsApp button on your store so customers can chat and buy instantly.' },
  { icon: '🧾', title: 'Beautiful Receipts', text: 'Every paid order generates a gorgeous receipt with download & share buttons.' },
  { icon: '📍', title: 'Order Tracking', text: 'Customers track orders with email + tracking number. No signup needed.' },
  { icon: '📚', title: 'Digital Products', text: 'Sell courses, eBooks & files. Automatic delivery, no shipping needed.' },
  { icon: '📊', title: 'Store Analytics', text: 'See your visitors, orders, sales and conversion rate in one dashboard.' },
  { icon: '🔒', title: 'Showcase Mode', text: 'Launch free today. Unlock cart & checkout whenever you are ready.' },
];

export default function HomePage() {
  const themes = Object.values(THEMES);

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="text-xl font-extrabold tracking-tight">Orizzon<span className="text-purple-600">Cart</span></span>
          <nav className="flex items-center gap-2">
            <Link href="/track-order" className="hidden sm:block text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2">Track Order</Link>
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2">Log in</Link>
            <Link href="/signup" className="text-sm font-semibold text-white bg-gray-900 rounded-full px-4 py-2 hover:bg-gray-800">Get Started</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-100 via-indigo-100 to-blue-100">
        <div className="max-w-6xl mx-auto px-4 py-20 md:py-28 text-center">
          <span className="inline-block bg-white/70 text-purple-700 text-xs font-bold px-4 py-1.5 rounded-full mb-6 shadow-sm">
            🇳🇬 Built for Nigerian businesses by OrizzonS Inc.
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Open your online store<br className="hidden md:block" /> in minutes, not months.
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            OrizzonCart gives every business a beautiful storefront, secure Paystack & Flutterwave payments, WhatsApp selling and automatic order tracking — no coding required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="px-8 py-4 bg-purple-600 text-white rounded-full font-bold text-lg shadow-lg hover:bg-purple-700 hover:-translate-y-0.5 transition-all">
              Create Your Online Store →
            </Link>
            <a href="#themes" className="px-8 py-4 bg-white text-purple-700 border-2 border-purple-600 rounded-full font-bold text-lg hover:bg-purple-50 transition-all">
              Explore Premium Themes
            </a>
          </div>
          <p className="mt-8 text-sm text-gray-500">Free to launch • No monthly fees to start • Live in 6 simple steps</p>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Selling online in Nigeria shouldn't be this hard.</h2>
          <p className="text-gray-600 text-lg">
            Most business owners lose sales because customers can't find prices, can't pay easily, and can't track orders. OrizzonCart fixes all three — with a store that looks like it cost millions, for a one-time activation fee.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
            <p className="text-2xl mb-2">😩</p>
            <h3 className="font-bold mb-1">The Problem</h3>
            <p className="text-sm text-gray-600">"I sell on WhatsApp & Instagram, but I lose orders in DMs and customers don't trust bank transfers."</p>
          </div>
          <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6">
            <p className="text-2xl mb-2">🛠️</p>
            <h3 className="font-bold mb-1">The OrizzonCart Way</h3>
            <p className="text-sm text-gray-600">A real storefront with real checkout. Customers pay securely, get a receipt and a tracking number automatically.</p>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-2xl p-6">
            <p className="text-2xl mb-2">📈</p>
            <h3 className="font-bold mb-1">The Result</h3>
            <p className="text-sm text-gray-600">You look like a brand, get paid directly into your account, and manage everything from your phone.</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3">How to set up your store</h2>
            <p className="text-gray-600">Six steps. About 10 minutes. Zero coding.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <div key={s.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-extrabold flex items-center justify-center">{i + 1}</span>
                  <span className="text-2xl">{s.icon}</span>
                </div>
                <h3 className="font-bold mb-1">{s.title}</h3>
                <p className="text-sm text-gray-600">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Themes */}
      <section id="themes" className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full uppercase tracking-wider">Premium Theme Store</span>
          <h2 className="text-3xl md:text-4xl font-extrabold mt-4 mb-3">Your store. Your style.</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Every theme is a complete designer storefront — colors, fonts and layout included. Preview them live below.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map((t) => (
            <div key={t.name} className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-shadow">
              <div className="p-4" style={{ backgroundColor: t.variables['--color-bg'] }}>
                <div className="rounded-lg overflow-hidden border" style={{ borderColor: t.variables['--color-text-muted'] }}>
                  <div className="px-3 py-2 flex items-center justify-between" style={{ backgroundColor: t.variables['--color-surface'] }}>
                    <span className="text-xs font-bold" style={{ color: t.variables['--color-text'], fontFamily: t.variables['--font-heading'] }}>{t.display_name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full text-white font-semibold" style={{ backgroundColor: t.variables['--color-primary'] }}>Cart</span>
                  </div>
                  <div className="p-3 grid grid-cols-3 gap-2">
                    <div className="h-10 rounded" style={{ backgroundColor: t.variables['--color-surface'] }} />
                    <div className="h-10 rounded" style={{ backgroundColor: t.variables['--color-surface'] }} />
                    <div className="h-10 rounded" style={{ backgroundColor: t.variables['--color-surface'] }} />
                  </div>
                  <div className="px-3 pb-3">
                    <div className="h-6 rounded-full text-[10px] flex items-center justify-center text-white font-semibold" style={{ backgroundColor: t.variables['--color-primary'] }}>Shop Now</div>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-white">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">{t.display_name}</h3>
                  <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">₦{t.price.toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{t.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12">Everything a modern store needs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <span className="text-3xl">{f.icon}</span>
                <h3 className="font-bold mt-3 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-600">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-3">Simple, honest pricing</h2>
        <p className="text-gray-600 text-center mb-12">No hidden subscriptions. Pay once, sell forever.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-gray-200 p-8">
            <h3 className="font-bold text-lg">Showcase Store</h3>
            <p className="text-4xl font-extrabold mt-2">Free</p>
            <ul className="mt-6 space-y-2 text-sm text-gray-600">
              <li>✅ Your own store link</li>
              <li>✅ Unlimited products</li>
              <li>✅ Premium theme preview</li>
              <li> Cart & checkout locked</li>
            </ul>
            <Link href="/signup" className="mt-8 block text-center px-6 py-3 rounded-full border-2 border-gray-900 font-bold hover:bg-gray-50">Start Free</Link>
          </div>
          <div className="rounded-2xl border-2 border-purple-600 p-8 relative shadow-xl">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</span>
            <h3 className="font-bold text-lg">Activated Store</h3>
            <p className="text-4xl font-extrabold mt-2">₦5,000 <span className="text-sm font-medium text-gray-500">one-time</span></p>
            <ul className="mt-6 space-y-2 text-sm text-gray-600">
              <li>✅ Cart & checkout unlocked</li>
              <li>✅ Receive payments (Paystack/Flutterwave)</li>
              <li>✅ Receipts & order tracking</li>
              <li>✅ WhatsApp selling button</li>
              <li>✅ Full analytics dashboard</li>
            </ul>
            <Link href="/signup" className="mt-8 block text-center px-6 py-3 rounded-full bg-purple-600 text-white font-bold hover:bg-purple-700">Activate My Store</Link>
          </div>
          <div className="rounded-2xl border border-gray-200 p-8">
            <h3 className="font-bold text-lg">Premium Themes</h3>
            <p className="text-4xl font-extrabold mt-2">₦12,000+ <span className="text-sm font-medium text-gray-500">one-time</span></p>
            <ul className="mt-6 space-y-2 text-sm text-gray-600">
              <li>✅ 10 designer storefronts</li>
              <li>✅ Unique colors & fonts</li>
              <li>✅ Mobile-optimized layouts</li>
              <li>✅ Instant theme switching</li>
            </ul>
            <a href="#themes" className="mt-8 block text-center px-6 py-3 rounded-full border-2 border-gray-900 font-bold hover:bg-gray-50">Browse Themes</a>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-purple-600 to-blue-600 py-16 md:py-20 text-center text-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Your competitors are still posting prices in captions.</h2>
          <p className="text-purple-100 text-lg mb-8">Be the business with a real store, real checkout and real receipts.</p>
          <Link href="/signup" className="inline-block px-10 py-4 bg-white text-purple-700 rounded-full font-bold text-lg shadow-lg hover:bg-purple-50">
            Create Your Online Store →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-white font-extrabold">Orizzon<span className="text-purple-400">Cart</span></span>
          <p className="text-sm">Powered by OrizzonS Inc. • Orizzon Search • Orizzon Commerce (coming soon)</p>
          <div className="flex gap-4 text-sm">
            <Link href="/login" className="hover:text-white">Log in</Link>
            <Link href="/track-order" className="hover:text-white">Track Order</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}