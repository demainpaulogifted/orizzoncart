import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'OrizzonCart Journey — Create Online Stores & Sell on OrizzonCart Marketplace | Nigeria',
  description:
    'OrizzonCart Journey: The simple path for Nigerian entrepreneurs, social-media sellers, market traders, fashion & beauty businesses, home bakers and digital-product creators to create online stores and sell through OrizzonCart Marketplace. Free to launch. Own your sales.',
  keywords: [
    'OrizzonCart',
    'OrizzonCart Marketplace',
    'create online stores',
    'sell online Nigeria',
    'online store builder Nigeria',
    'WhatsApp selling',
    'Nigerian e-commerce',
    'fashion store online',
    'digital products Nigeria',
    'market traders online',
    'home bakers sell online',
    'social media sellers Nigeria',
    'OrizzonCart journey',
  ],
  alternates: { canonical: 'https://orizzoncart.com.ng/orizzoncart-journey' },
  openGraph: {
    title: 'OrizzonCart Journey — Create Online Stores & Sell on OrizzonCart Marketplace',
    description:
      'Nigerian entrepreneurs, social-media sellers, market traders, fashion & beauty businesses, home bakers and digital creators: create your online store and let OrizzonCart Marketplace sell for you. Free to start.',
    url: 'https://orizzoncart.com.ng/orizzoncart-journey',
    siteName: 'OrizzonCart',
    type: 'website',
    locale: 'en_NG',
    images: [
      {
        url: 'https://orizzoncart.com.ng/orizzoncart-journey/images/Screenshot_20261025-092643_Chrome.jpg',
        width: 720,
        height: 1280,
        alt: 'OrizzonCart Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OrizzonCart Journey — Create Online Stores & Sell on Marketplace',
    description: 'Start selling online in Nigeria in minutes. Free store + OrizzonCart Marketplace exposure.',
    images: ['https://orizzoncart.com.ng/orizzoncart-journey/images/Screenshot_20261025-092643_Chrome.jpg'],
  },
  robots: { index: true, follow: true },
};

const AUDIENCE = [
  'Nigerian entrepreneurs',
  'Social-media sellers',
  'Market traders',
  'Fashion & beauty',
  'Home bakers',
  'Digital-product creators',
  'Small business owners',
];

function PhoneFrame({
  src,
  alt,
  priority = false,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  return (
    <div className="mx-auto w-full max-w-[300px]">
      <div className="rounded-[28px] bg-slate-900 p-3 shadow-2xl shadow-purple-900/20">
        <div className="mx-auto mb-2 h-2 w-20 rounded-full bg-slate-700" />
        <div className="overflow-hidden rounded-[18px] bg-white">
          <Image
            src={src}
            alt={alt}
            width={360}
            height={720}
            className="h-auto w-full"
            priority={priority}
            sizes="(max-width: 768px) 90vw, 300px"
          />
        </div>
      </div>
    </div>
  );
}

export default function OrizzonCartJourneyPage() {
  return (
    <main className="min-h-screen bg-[#f8f5ff] text-slate-900">
      {/* Sticky header */}
      <header className="sticky top-0 z-50 border-b border-purple-200/50 bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-lg">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5">
          <Link href="/" className="text-lg font-extrabold tracking-tight">
            Orizzon<span className="text-amber-300">Cart</span>
          </Link>
          <Link
            href="/"
            className="rounded-full bg-white px-5 py-2 text-sm font-bold text-purple-700 shadow transition hover:-translate-y-0.5 hover:shadow-md"
          >
            Start Free →
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-purple-100/80 to-[#f8f5ff] px-4 pb-10 pt-12 text-center">
        <div className="mx-auto max-w-3xl">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-purple-700 shadow-sm">
            🇳🇬 Built for Nigerian businesses
          </span>
          <h1 className="mb-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl md:text-5xl">
            Your{' '}
            <span className="bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
              OrizzonCart Journey
            </span>
            <br />
            Create online stores &amp; sell through OrizzonCart Marketplace
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-lg text-slate-600">
            OrizzonCart wants to sell for you. Free to launch. No coding. Your own store link + WhatsApp
            selling + Marketplace exposure.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="rounded-xl bg-purple-600 px-7 py-3.5 text-base font-bold text-white shadow-lg shadow-purple-500/30 transition hover:-translate-y-0.5 hover:bg-purple-700"
            >
              Create Free Account
            </Link>
            <Link
              href="/marketplace"
              className="rounded-xl border-2 border-purple-300 bg-white px-7 py-3.5 text-base font-bold text-purple-700 transition hover:border-purple-500 hover:bg-purple-50"
            >
              View Marketplace
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-500">Free forever to launch · Pay only when you activate selling</p>
        </div>
      </section>

      {/* Audience */}
      <section className="px-4 py-8">
        <p className="mb-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
          Perfect for
        </p>
        <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-2.5">
          {AUDIENCE.map((item) => (
            <span
              key={item}
              className="rounded-full border border-purple-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm"
            >
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* How to start */}
      <section className="bg-white px-4 py-14" id="how-to-start">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-3 text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
            How do you get started?
          </h2>
          <p className="mx-auto mb-12 max-w-lg text-center text-slate-600">
            Four clear steps. About 10 minutes. Zero coding. Then OrizzonCart Marketplace can sell for you.
          </p>

          {/* Step 1 */}
          <div className="mb-14 grid items-center gap-8 rounded-3xl bg-[#f8f5ff] p-6 shadow-lg shadow-purple-100 md:grid-cols-2 md:p-10">
            <div>
              <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-purple-600 text-lg font-extrabold text-white">
                1
              </span>
              <h3 className="mb-2 text-2xl font-extrabold tracking-tight">Sign up — Create your free account</h3>
              <p className="mb-4 text-slate-600">
                Open OrizzonCart and create your free account in seconds. No credit card required.
              </p>
              <ul className="mb-6 space-y-2 text-slate-800">
                <li className="flex gap-2"><span className="font-bold text-emerald-500">✓</span> Full Name</li>
                <li className="flex gap-2"><span className="font-bold text-emerald-500">✓</span> Email</li>
                <li className="flex gap-2"><span className="font-bold text-emerald-500">✓</span> Password (minimum 6 characters)</li>
              </ul>
              <Link
                href="/"
                className="inline-flex rounded-xl bg-purple-600 px-6 py-3 font-bold text-white shadow-md transition hover:bg-purple-700"
              >
                Sign Up Free →
              </Link>
            </div>
            <PhoneFrame
              src="/orizzoncart-journey/images/Screenshot_20261025-092717_Chrome.jpg"
              alt="OrizzonCart Create your account — Sign up free to launch your online store"
              priority
            />
          </div>

          {/* Step 2 */}
          <div className="mb-14 grid items-center gap-8 rounded-3xl bg-[#f8f5ff] p-6 shadow-lg shadow-purple-100 md:grid-cols-2 md:p-10">
            <div className="order-2 md:order-1">
              <PhoneFrame
                src="/orizzoncart-journey/images/Screenshot_20261025-093002_Chrome.jpg"
                alt="OrizzonCart Create a New Store — Business name, store name, store link and WhatsApp number"
              />
            </div>
            <div className="order-1 md:order-2">
              <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-purple-600 text-lg font-extrabold text-white">
                2
              </span>
              <h3 className="mb-2 text-2xl font-extrabold tracking-tight">Add your store details</h3>
              <p className="mb-4 text-slate-600">
                Give your business a name, choose your store link, add WhatsApp number and select physical or digital goods.
              </p>
              <ul className="mb-4 space-y-2 text-slate-800">
                <li className="flex gap-2"><span className="font-bold text-emerald-500">✓</span> Business / Owner Name</li>
                <li className="flex gap-2"><span className="font-bold text-emerald-500">✓</span> Store Name &amp; unique link</li>
                <li className="flex gap-2"><span className="font-bold text-emerald-500">✓</span> WhatsApp Number (required to launch)</li>
                <li className="flex gap-2"><span className="font-bold text-emerald-500">✓</span> Physical Goods or Digital Goods</li>
              </ul>
              <p className="text-sm text-slate-500">
                Your store&apos;s ONLY address is assigned automatically at creation (e.g. vicky-store.orizzoncart.com.ng).
              </p>
            </div>
          </div>

          {/* Merchant type */}
          <div className="mb-14 grid items-center gap-8 rounded-3xl bg-[#f8f5ff] p-6 shadow-lg shadow-purple-100 md:grid-cols-2 md:p-10">
            <div>
              <h3 className="mb-2 text-2xl font-extrabold tracking-tight">Choose merchant type &amp; launch</h3>
              <p className="mb-4 text-slate-600">
                Select Physical Goods (clothing, shoes, food, gadgets) or Digital Goods (courses, eBooks, files). Add an optional store description and hit Create Store.
              </p>
              <ul className="space-y-2 text-slate-800">
                <li className="flex gap-2"><span className="font-bold text-emerald-500">✓</span> Physical or Digital goods selector</li>
                <li className="flex gap-2"><span className="font-bold text-emerald-500">✓</span> Optional store description</li>
                <li className="flex gap-2"><span className="font-bold text-emerald-500">✓</span> One-click Create Store</li>
              </ul>
            </div>
            <PhoneFrame
              src="/orizzoncart-journey/images/Screenshot_20261025-092914_Chrome.jpg"
              alt="OrizzonCart merchant type selection — Physical Goods or Digital Goods"
            />
          </div>

          {/* Fashion example */}
          <div className="mb-14 grid items-center gap-8 rounded-3xl bg-[#f8f5ff] p-6 shadow-lg shadow-purple-100 md:grid-cols-2 md:p-10">
            <div className="order-2 md:order-1">
              <PhoneFrame
                src="/orizzoncart-journey/images/Screenshot_20261025-092903_Chrome.jpg"
                alt="OrizzonCart Create a New Store form example for Paul's Fashion"
              />
            </div>
            <div className="order-1 md:order-2">
              <h3 className="mb-2 text-2xl font-extrabold tracking-tight">Example: Fashion store setup</h3>
              <p className="text-slate-600">
                Real example of filling Business Name, Store Name and Store Link. Your unique link is ready instantly.
              </p>
            </div>
          </div>

          {/* Step 3 - Onboarding */}
          <div className="mb-14 grid items-center gap-8 rounded-3xl bg-[#f8f5ff] p-6 shadow-lg shadow-purple-100 md:grid-cols-2 md:p-10">
            <div>
              <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-purple-600 text-lg font-extrabold text-white">
                3
              </span>
              <h3 className="mb-2 text-2xl font-extrabold tracking-tight">Follow the onboarding dashboard</h3>
              <p className="mb-4 text-slate-600">
                After creating your store you land on the Merchant dashboard. Complete these setup steps to start selling:
              </p>
              <ul className="mb-4 space-y-2 text-slate-800">
                <li className="flex gap-2"><span className="font-bold text-emerald-500">✓</span> Create your store (done)</li>
                <li className="flex gap-2"><span className="font-bold text-emerald-500">✓</span> Add your first product (stores with 3+ products sell more)</li>
                <li className="flex gap-2"><span className="font-bold text-emerald-500">✓</span> Set delivery zones</li>
                <li className="flex gap-2"><span className="font-bold text-emerald-500">✓</span> Add a trust page (Refund Policy or About)</li>
                <li className="flex gap-2"><span className="font-bold text-emerald-500">✓</span> Activate payments</li>
                <li className="flex gap-2"><span className="font-bold text-emerald-500">✓</span> Connect payout method</li>
              </ul>
              <p className="text-sm text-slate-500">
                You access your merchant / seller dashboard through the Marketplace app (Merchant tab).
              </p>
            </div>
            <PhoneFrame
              src="/orizzoncart-journey/images/Screenshot_20261025-093018_Chrome.jpg"
              alt="OrizzonCart Store Setup onboarding dashboard"
            />
          </div>

          {/* Progress to Marketplace */}
          <div className="mb-14 grid items-center gap-8 rounded-3xl bg-[#f8f5ff] p-6 shadow-lg shadow-purple-100 md:grid-cols-2 md:p-10">
            <div className="order-2 md:order-1">
              <PhoneFrame
                src="/orizzoncart-journey/images/Screenshot_20261025-093042_Chrome.jpg"
                alt="OrizzonCart Progress to Marketplace steps"
              />
            </div>
            <div className="order-1 md:order-2">
              <h3 className="mb-2 text-2xl font-extrabold tracking-tight">Progress to Marketplace (optional but powerful)</h3>
              <p className="mb-4 text-slate-600">
                Complete these extra steps so your store appears on the OrizzonCart Marketplace and gets more visibility:
              </p>
              <ul className="mb-4 space-y-2 text-slate-800">
                <li className="flex gap-2"><span className="font-bold text-emerald-500">✓</span> Add business location</li>
                <li className="flex gap-2"><span className="font-bold text-emerald-500">✓</span> Admin verification</li>
                <li className="flex gap-2"><span className="font-bold text-emerald-500">✓</span> List &amp; sync products to Marketplace</li>
              </ul>
              <p className="text-sm text-slate-500">
                You can still sell on your own store even without Marketplace listing.
              </p>
            </div>
          </div>

          {/* Step 4 - Marketplace */}
          <div className="mb-14 grid items-center gap-8 rounded-3xl bg-[#f8f5ff] p-6 shadow-lg shadow-purple-100 md:grid-cols-2 md:p-10">
            <div>
              <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-purple-600 text-lg font-extrabold text-white">
                4
              </span>
              <h3 className="mb-2 text-2xl font-extrabold tracking-tight">Check the Marketplace</h3>
              <p className="mb-4 text-slate-600">
                Once you have products and complete the optional Marketplace steps, check if your store profile and products have appeared on OrizzonCart Marketplace.
              </p>
              <ul className="mb-6 space-y-2 text-slate-800">
                <li className="flex gap-2"><span className="font-bold text-emerald-500">✓</span> Active Stores section</li>
                <li className="flex gap-2"><span className="font-bold text-emerald-500">✓</span> Flash Deals</li>
                <li className="flex gap-2"><span className="font-bold text-emerald-500">✓</span> Discover products from verified Nigerian sellers</li>
                <li className="flex gap-2"><span className="font-bold text-emerald-500">✓</span> Your store image &amp; profile visible to shoppers</li>
              </ul>
              <Link
                href="/marketplace"
                className="inline-flex rounded-xl bg-purple-600 px-6 py-3 font-bold text-white shadow-md transition hover:bg-purple-700"
              >
                Open Marketplace →
              </Link>
            </div>
            <PhoneFrame
              src="/orizzoncart-journey/images/Screenshot_20261025-092643_Chrome.jpg"
              alt="OrizzonCart Marketplace home — Flash Deals, Active Stores"
            />
          </div>

          {/* Discover products */}
          <div className="mb-14 grid items-center gap-8 rounded-3xl bg-[#f8f5ff] p-6 shadow-lg shadow-purple-100 md:grid-cols-2 md:p-10">
            <div className="order-2 md:order-1">
              <PhoneFrame
                src="/orizzoncart-journey/images/Screenshot_20261025-092654_Chrome.jpg"
                alt="OrizzonCart Marketplace Discover — fashion products from verified stores"
              />
            </div>
            <div className="order-1 md:order-2">
              <h3 className="mb-2 text-2xl font-extrabold tracking-tight">Your products can appear here</h3>
              <p className="text-slate-600">
                Fashion, beauty, food, tech and more — verified sellers only, secure payments, trackable delivery. OrizzonCart Marketplace sells for you.
              </p>
            </div>
          </div>

          {/* Login */}
          <div className="mb-10 grid items-center gap-8 rounded-3xl bg-[#f8f5ff] p-6 shadow-lg shadow-purple-100 md:grid-cols-2 md:p-10">
            <div>
              <h3 className="mb-2 text-2xl font-extrabold tracking-tight">Already have an account?</h3>
              <p className="mb-6 text-slate-600">
                Sign in any time to manage your OrizzonCart store. Access your merchant dashboard from the Marketplace app.
              </p>
              <Link
                href="/"
                className="inline-flex rounded-xl border-2 border-purple-300 bg-white px-6 py-3 font-bold text-purple-700 transition hover:border-purple-500 hover:bg-purple-50"
              >
                Sign In →
              </Link>
            </div>
            <PhoneFrame
              src="/orizzoncart-journey/images/Screenshot_20261025-092706_Chrome.jpg"
              alt="OrizzonCart Welcome Back — Sign in to manage your store"
            />
          </div>

          {/* Access note */}
          <div className="mb-10 flex gap-4 rounded-2xl border border-amber-300 bg-amber-50 p-5">
            <span className="text-2xl">📱</span>
            <div>
              <p className="mb-1 font-bold text-amber-900">How to reach your Merchant / Seller Dashboard</p>
              <p className="text-amber-900/90">
                Open the OrizzonCart Marketplace app → tap the <strong>Merchant</strong> tab at the bottom. That is where you manage products, orders, delivery zones, payments and payouts.
              </p>
            </div>
          </div>

          {/* Marketplace CTA block */}
          <div className="rounded-3xl bg-gradient-to-br from-purple-800 to-purple-600 px-6 py-12 text-center text-white shadow-xl">
            <h2 className="mb-3 text-2xl font-extrabold sm:text-3xl">OrizzonCart Marketplace sells for you</h2>
            <p className="mx-auto mb-8 max-w-lg text-purple-100">
              Verified Nigerian stores. Flash deals. Secure payments. Trackable delivery. Your products reach more customers while you keep your own store link and WhatsApp selling.
            </p>
            <Link
              href="/marketplace"
              className="inline-flex rounded-xl bg-white px-8 py-3.5 font-bold text-purple-700 shadow transition hover:bg-purple-50"
            >
              Explore Marketplace
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-b from-purple-50 to-white px-4 py-16 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Start your OrizzonCart Journey today
          </h2>
          <p className="mb-8 text-lg text-slate-600">
            Create online stores in minutes. Sell online. Let OrizzonCart Marketplace work for you.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="rounded-xl bg-purple-600 px-7 py-3.5 text-base font-bold text-white shadow-lg shadow-purple-500/30 transition hover:-translate-y-0.5 hover:bg-purple-700"
            >
              Create Free Account
            </Link>
            <Link
              href="/marketplace"
              className="rounded-xl border-2 border-purple-300 bg-white px-7 py-3.5 text-base font-bold text-purple-700 transition hover:border-purple-500 hover:bg-purple-50"
            >
              View Marketplace
            </Link>
          </div>
          <p className="mt-5 text-sm text-slate-500">orizzoncart.com.ng · Free to launch · Built for Nigeria</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 px-4 py-10 text-center text-sm text-purple-200">
        <div className="mb-4 flex flex-wrap justify-center gap-6">
          <Link href="/" className="font-semibold text-white hover:underline">
            OrizzonCart
          </Link>
          <Link href="/marketplace" className="font-semibold text-white hover:underline">
            OrizzonCart Marketplace
          </Link>
          <Link href="/orizzoncart-journey" className="font-semibold text-white hover:underline">
            OrizzonCart Journey
          </Link>
        </div>
        <p>© {new Date().getFullYear()} OrizzonS Inc. · Create online stores · Sell online · OrizzonCart Marketplace</p>
      </footer>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'OrizzonCart Journey — Create Online Stores & Sell on OrizzonCart Marketplace',
            description:
              'Step-by-step journey for Nigerian entrepreneurs, social-media sellers, market traders, fashion & beauty businesses, home bakers and digital-product creators to create online stores and sell through OrizzonCart Marketplace.',
            url: 'https://orizzoncart.com.ng/orizzoncart-journey',
            publisher: {
              '@type': 'Organization',
              name: 'OrizzonCart',
              url: 'https://orizzoncart.com.ng',
            },
            mainEntity: {
              '@type': 'HowTo',
              name: 'How to start selling on OrizzonCart and OrizzonCart Marketplace',
              step: [
                {
                  '@type': 'HowToStep',
                  position: 1,
                  name: 'Sign up',
                  text: 'Create your free OrizzonCart account with name, email and password.',
                },
                {
                  '@type': 'HowToStep',
                  position: 2,
                  name: 'Add store details',
                  text: 'Enter business name, store name, store link, WhatsApp number and choose physical or digital goods.',
                },
                {
                  '@type': 'HowToStep',
                  position: 3,
                  name: 'Follow the onboarding dashboard',
                  text: 'Add products, set delivery zones, add trust page, activate payments and connect payout method from the Merchant dashboard.',
                },
                {
                  '@type': 'HowToStep',
                  position: 4,
                  name: 'Check Marketplace',
                  text: 'Verify your store profile and products appear on OrizzonCart Marketplace.',
                },
              ],
            },
          }),
        }}
      />
    </main>
  );
}