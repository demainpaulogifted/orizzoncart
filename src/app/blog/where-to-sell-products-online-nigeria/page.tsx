
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Where to Sell Your Products Online in Nigeria (2026 Guide) | OrizzonCart',
  description:
    'Discover where to sell products online in Nigeria, including social media, marketplaces and your own online store. Compare your options and learn how OrizzonCart helps Nigerian sellers reach customers.',
  alternates: {
    canonical:
      'https://orizzoncart.com.ng/blog/where-to-sell-products-online-nigeria',
  },
  openGraph: {
    title: 'Where to Sell Your Products Online in Nigeria',
    description:
      'A practical guide to online marketplaces, social media selling and building your own online store in Nigeria.',
    url: 'https://orizzoncart.com.ng/blog/where-to-sell-products-online-nigeria',
    siteName: 'OrizzonCart',
    type: 'article',
    locale: 'en_NG',
  },
};

const platforms = [
  {
    number: '01',
    name: 'Instagram',
    type: 'SOCIAL COMMERCE',
    icon: '◎',
    color: 'from-pink-500 to-orange-400',
    best: 'Fashion, beauty, food and lifestyle',
    detail:
      'Build interest with product photography, Reels, Stories and creator collaborations. Make the next step clear: link to the product, your store or your ordering channel.',
  },
  {
    number: '02',
    name: 'Facebook',
    type: 'COMMUNITY & DISCOVERY',
    icon: 'f',
    color: 'from-blue-600 to-blue-400',
    best: 'Local businesses and community sellers',
    detail:
      'Use a business Page, relevant Groups and Marketplace where available. Respect community rules and include accurate prices, product details and delivery information.',
  },
  {
    number: '03',
    name: 'TikTok',
    type: 'VIDEO DISCOVERY',
    icon: '♪',
    color: 'from-slate-900 to-slate-600',
    best: 'Products that benefit from demonstrations',
    detail:
      'Show products in use, explain how they work, share behind-the-scenes clips and answer common questions. Helpful videos can reach people beyond your existing followers.',
  },
  {
    number: '04',
    name: 'WhatsApp Business',
    type: 'CUSTOMER CONVERSATIONS',
    icon: '◉',
    color: 'from-emerald-600 to-green-400',
    best: 'Repeat customers and direct enquiries',
    detail:
      'Organise customer conversations, share a catalogue and follow up on enquiries. Keep business information, prices and response expectations up to date.',
  },
  {
    number: '05',
    name: 'Your own online store',
    type: 'YOUR DIGITAL HOME',
    icon: '⌂',
    color: 'from-violet-700 to-purple-500',
    best: 'Businesses building a long-term brand',
    detail:
      'Give customers one dedicated place to browse products, understand your offer and place orders. Share the same store link across all your social channels.',
  },
  {
    number: '06',
    name: 'Online marketplaces',
    type: 'MULTI-SELLER SHOPPING',
    icon: '▦',
    color: 'from-indigo-700 to-blue-500',
    best: 'Sellers seeking marketplace discovery',
    detail:
      'Marketplaces bring shoppers and multiple sellers together. Compare their seller rules, fees, payment arrangements, delivery expectations and eligibility.',
  },
];

const international = [
  {
    name: 'Jumia',
    note: 'Review current Nigerian seller registration, category rules, fees and fulfilment requirements.',
  },
  {
    name: 'Konga',
    note: 'Check current seller terms, product categories, commercial requirements and payout arrangements.',
  },
  {
    name: 'Amazon',
    note: 'Confirm country eligibility, identity verification, fees, shipping and product restrictions before investing.',
  },
  {
    name: 'eBay',
    note: 'Check current registration, payout and international selling eligibility for Nigerian residents.',
  },
];

const checks = [
  'Confirm that sellers in Nigeria can register and receive payouts.',
  'Understand commissions, subscription charges and advertising costs.',
  'Find out who handles delivery, returns, refunds and customer complaints.',
  'Check how much control you have over product information and customer experience.',
  'Choose channels where your target customers already spend time.',
];

const tips = [
  [
    'Show the real product',
    'Use clear, well-lit photos and accurate descriptions so customers know what they are considering.',
  ],
  [
    'Make the details clear',
    'Display prices, delivery information, available sizes and other important details.',
  ],
  [
    'Create useful content',
    'Publish short demonstrations, tutorials and answers to common customer questions.',
  ],
  [
    'Build trust carefully',
    'Share genuine customer feedback only with permission. Be clear about returns and support.',
  ],
  [
    'Share your store link',
    'Add your store link to social profiles, posts, messages and relevant business materials.',
  ],
  [
    'Learn what works',
    'Track which channels bring enquiries and completed orders, then improve your approach.',
  ],
];

const faqs = [
  [
    'Where can I sell my products online in Nigeria for free?',
    'You can begin by exploring social media pages, relevant online communities and platforms with free entry options. Always check transaction fees, advertising costs and seller terms.',
  ],
  [
    'How can I get customers for my products?',
    'Use product demonstrations, helpful social content, customer referrals, search-friendly product descriptions and a clear online store link. Focus on reaching people who are likely to need what you sell.',
  ],
  [
    'Can I sell on social media and have my own website too?',
    'Yes. These channels can work together. Social media can help people discover your business, while your website provides a dedicated place to browse products and place orders.',
  ],
  [
    'Can Nigerian sellers use Amazon or eBay?',
    'Eligibility and payout options depend on each platform’s current country rules, verification requirements, product policies and shipping arrangements. Confirm the latest requirements directly with each platform before spending money.',
  ],
];

export default function WhereToSellProductsGuide() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Where to Sell Your Products Online in Nigeria',
    description:
      'A practical guide to online marketplaces, social media selling and building your own online store in Nigeria.',
    mainEntityOfPage:
      'https://orizzoncart.com.ng/blog/where-to-sell-products-online-nigeria',
    author: {
      '@type': 'Organization',
      name: 'OrizzonCart',
    },
    publisher: {
      '@type': 'Organization',
      name: 'OrizzonCart',
      url: 'https://orizzoncart.com.ng',
    },
    inLanguage: 'en-NG',
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#faf9fc] text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema),
        }}
      />

      <div className="bg-[#190b36] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link
            href="/"
            className="text-xl font-black tracking-tight"
          >
            orizzon<span className="text-violet-300">cart</span>
          </Link>

          <Link
            href="/signup"
            className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold transition hover:bg-white hover:text-[#190b36]"
          >
            Start selling ↗
          </Link>
        </div>
      </div>

      <header className="relative isolate overflow-hidden bg-[#190b36] text-white">
        <div className="absolute -right-24 -top-28 h-96 w-96 rounded-full bg-violet-600/30 blur-3xl" />

        <div className="absolute -bottom-40 left-1/4 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-14 md:grid-cols-[1.1fr_.9fr] md:pb-28 md:pt-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-300/30 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-violet-200">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Seller growth guide · Nigeria · 2026
            </div>

            <h1 className="mt-7 max-w-3xl text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Where can you{' '}
              <span className="text-violet-300">
                sell your products
              </span>{' '}
              online in Nigeria?
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-violet-100/80">
              From social media and online marketplaces to your own
              website, explore the channels that can help customers
              discover your business.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#selling-options"
                className="rounded-xl bg-white px-6 py-3.5 font-bold text-[#28104c] shadow-lg shadow-black/20 transition hover:-translate-y-0.5"
              >
                Explore your options ↓
              </a>

              <Link
                href="/signup"
                className="rounded-xl border border-white/25 bg-white/5 px-6 py-3.5 font-bold text-white transition hover:bg-white/10"
              >
                Create an online store
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/15 pt-6 text-sm text-violet-100/70">
              <span>Practical guide for Nigerian businesses</span>
              <span>•</span>
              <span>About 7 min read</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-violet-500/30 to-fuchsia-500/10 blur-2xl" />

            <div className="relative rounded-[2rem] border border-white/15 bg-white/[.08] p-4 shadow-2xl backdrop-blur">
              <div className="flex items-center justify-between px-3 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[.2em] text-violet-200">
                    Your business
                  </p>
                  <p className="mt-1 text-lg font-bold">
                    One brand. More ways to grow.
                  </p>
                </div>

                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-300">
                  ONLINE
                </span>
              </div>

              <div className="rounded-2xl bg-[#f7f4fc] p-5 text-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-500">
                    SELLING CHANNELS
                  </span>
                  <span className="text-xs font-semibold text-violet-700">
                    YOUR REACH
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  {[
                    ['◎', 'Instagram', 'from-pink-500 to-orange-400'],
                    ['f', 'Facebook', 'from-blue-600 to-blue-400'],
                    ['♪', 'TikTok', 'from-slate-900 to-slate-600'],
                    ['◉', 'WhatsApp', 'from-emerald-600 to-green-400'],
                  ].map(([symbol, label, gradient]) => (
                    <div
                      key={label}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                    >
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-xl font-black text-white`}
                      >
                        {symbol}
                      </span>

                      <span className="text-sm font-bold">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 rounded-xl bg-[#28104c] p-4 text-white">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-violet-200">
                      Your online store
                    </span>
                    <span className="text-xl">↗</span>
                  </div>

                  <p className="mt-2 text-lg font-extrabold">
                    A home for every product.
                  </p>

                  <p className="mt-1 text-xs text-violet-100/70">
                    Share one link wherever customers find you.
                  </p>
                </div>
              </div>

              <p className="px-3 pb-1 pt-4 text-center text-xs text-violet-100/60">
                Build visibility across the channels that suit your
                business.
              </p>
            </div>

            <div className="absolute -left-7 top-1/3 hidden rounded-2xl border border-white/15 bg-[#39205d] px-4 py-3 shadow-xl sm:block">
              <p className="text-xs text-violet-200">
                Reach customers
              </p>
              <p className="font-bold">Where they are</p>
            </div>
          </div>
        </div>
      </header>

      <div className="border-b border-violet-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-5 py-4 text-sm">
          <Link
            href="/"
            className="font-semibold text-slate-500 hover:text-violet-700"
          >
            Home
          </Link>

          <span className="text-slate-300">/</span>

          <span className="font-semibold text-violet-700">
            Seller guides
          </span>

          <span className="text-slate-300">/</span>

          <span className="text-slate-500">
            Where to sell online
          </span>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-12 lg:grid-cols-[minmax(0,1fr)_280px] lg:py-16">
        <article className="min-w-0">
          <div className="mb-10 rounded-3xl border border-violet-100 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-extrabold uppercase tracking-[.18em] text-violet-700">
              The big picture
            </p>

            <p className="mt-4 text-xl font-semibold leading-9 text-slate-800 sm:text-2xl">
              You do not have to depend on one platform. Use social
              media to get discovered, messaging channels to build
              relationships, and a dedicated store to give customers
              a clear place to shop.
            </p>

            <p className="mt-4 leading-8 text-slate-600">
              If you are asking{' '}
              <strong>
                “where can I sell my products online in Nigeria?”
              </strong>
              , the best answer depends on what you sell, who you want
              to reach, your budget and how you plan to deliver orders.
            </p>
          </div>

          <section id="selling-options" className="scroll-mt-8">
            <div className="mb-7">
              <p className="text-xs font-extrabold uppercase tracking-[.2em] text-violet-700">
                01 / Explore the channels
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                Six ways to sell online
              </h2>

              <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                Each channel plays a different role. Start with the
                ones that match your products and the way your
                customers like to shop.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {platforms.map((p) => (
                <div
                  key={p.number}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-900/5"
                >
                  <div className="flex items-start justify-between">
                    <span
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${p.color} text-2xl font-black text-white shadow-lg`}
                    >
                      {p.icon}
                    </span>

                    <span className="text-sm font-black tracking-widest text-slate-300">
                      {p.number}
                    </span>
                  </div>

                  <p className="mt-5 text-[10px] font-extrabold tracking-[.17em] text-violet-700">
                    {p.type}
                  </p>

                  <h3 className="mt-1 text-xl font-extrabold">
                    {p.name}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {p.detail}
                  </p>

                  <div className="mt-5 rounded-xl bg-violet-50 px-4 py-3">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-violet-700">
                      A good fit for
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {p.best}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-16">
            <p className="text-xs font-extrabold uppercase tracking-[.2em] text-violet-700">
              02 / Compare your options
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight">
              What about major marketplaces?
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              Marketplaces can introduce your products to shoppers
              who are already browsing. Before committing, research
              the current seller requirements and calculate whether
              the costs and fulfilment arrangements make sense for
              your business.
            </p>

            <div className="mt-6 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {international.map((item, i) => (
                <div
                  key={item.name}
                  className="flex gap-4 p-5 sm:p-6"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-sm font-black text-violet-800">
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <div>
                    <h3 className="font-extrabold">
                      {item.name}
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {item.note}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-4 rounded-xl border-l-4 border-amber-400 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
              Important: Platform availability, country eligibility,
              fees and seller policies can change. Confirm the latest
              terms directly with each company. Do not assume that
              every international marketplace supports Nigerian
              seller registration or payouts.
            </p>

            <p className="mt-4 leading-7 text-slate-600">
              Temu and other international shopping platforms
              should also be researched carefully before treating
              them as a route for Nigerian businesses to sell.
            </p>
          </section>

          <section className="mt-16">
            <p className="text-xs font-extrabold uppercase tracking-[.2em] text-violet-700">
              03 / Make a smart choice
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight">
              How to choose the right platform
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              Do not choose a platform only because it is popular.
              Check whether it works for your business model,
              customers and delivery process.
            </p>

            <div className="mt-6 space-y-3">
              {checks.map((item, i) => (
                <div
                  key={item}
                  className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-700 text-sm font-bold text-white">
                    {i + 1}
                  </span>

                  <p className="text-sm leading-7 text-slate-700">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-16 rounded-3xl bg-[#20103c] p-7 text-white sm:p-9">
            <p className="text-xs font-extrabold uppercase tracking-[.2em] text-violet-300">
              A stronger foundation
            </p>

            <h2 className="mt-3 text-3xl font-black leading-tight">
              Why your business needs more than social media
            </h2>

            <p className="mt-4 leading-8 text-violet-100/80">
              Social media can introduce your products to new people,
              but managing every enquiry, price request and order in
              separate messages can become difficult. A dedicated
              online store gives customers a place to browse products
              and find important information without waiting for a
              reply.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {[
                'A dedicated product catalogue',
                'One link to share everywhere',
                'A consistent home for your brand',
              ].map((v, i) => (
                <div
                  key={v}
                  className="rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <span className="text-xl font-black text-violet-300">
                    0{i + 1}
                  </span>

                  <p className="mt-2 text-sm font-semibold">{v}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-16">
            <p className="text-xs font-extrabold uppercase tracking-[.2em] text-violet-700">
              04 / Put it into practice
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight">
              How to get more customers to your online store
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              Having a store is a starting point. People still need
              a reason to visit, trust what they see and feel
              confident placing an order.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {tips.map(([title, detail], i) => (
                <div
                  key={title}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <span className="text-xs font-black text-violet-700">
                    TIP 0{i + 1}
                  </span>

                  <h3 className="mt-2 font-extrabold">{title}</h3>

                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {detail}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-16">
            <p className="text-xs font-extrabold uppercase tracking-[.2em] text-violet-700">
              05 / Meet OrizzonCart
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight">
              Give your products a dedicated online home
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              OrizzonCart helps Nigerian entrepreneurs create an
              online store where they can present their products
              and share a dedicated store link. Eligible stores and
              products can also be discovered through{' '}
              <Link
                href="https://marketplace.orizzoncart.com.ng/marketplace"
                className="font-bold text-violet-700 underline decoration-violet-300 underline-offset-4 hover:text-violet-900"
              >
                OrizzonCart Marketplace
              </Link>.
            </p>

            <p className="mt-3 leading-8 text-slate-600">
              You can continue promoting your products through
              Instagram, Facebook, TikTok and WhatsApp while
              directing interested customers to your store.
              Marketplace participation is subject to the
              platform’s eligibility and verification requirements.
            </p>

            <div className="mt-7 overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-purple-700 to-[#32105d] p-7 text-white shadow-xl shadow-violet-900/15 sm:p-9">
              <div className="max-w-2xl">
                <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                  For Nigerian entrepreneurs
                </span>

                <h3 className="mt-5 text-3xl font-black leading-tight sm:text-4xl">
                  Your next customer could be one share away.
                </h3>

                <p className="mt-4 leading-7 text-violet-100">
                  Create a home for your products, then take your
                  store link to the channels where your customers
                  already spend time.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href="/signup"
                    className="rounded-xl bg-white px-6 py-3 font-extrabold text-violet-800 transition hover:-translate-y-0.5"
                  >
                    Create your store ↗
                  </Link>

                  <Link
                    href="https://marketplace.orizzoncart.com.ng/marketplace"
                    className="rounded-xl border border-white/30 px-6 py-3 font-bold text-white hover:bg-white/10"
                  >
                    Explore the marketplace
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-16">
            <p className="text-xs font-extrabold uppercase tracking-[.2em] text-violet-700">
              Common questions
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight">
              Frequently asked questions
            </h2>

            <div className="mt-6 space-y-3">
              {faqs.map(([q, a]) => (
                <details
                  key={q}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 open:border-violet-200 open:shadow-sm"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-slate-900">
                    <span>{q}</span>

                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-50 text-lg text-violet-700 transition group-open:rotate-45">
                      +
                    </span>
                  </summary>

                  <p className="mt-4 border-t border-slate-100 pt-4 text-sm leading-7 text-slate-600">
                    {a}
                  </p>
                </details>
              ))}
            </div>
          </section>

          <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-7 text-sm">
            <Link
              href="/blog/start-online-store-nigeria"
              className="font-bold text-violet-700 hover:text-violet-900"
            >
              ← How to start an online store in Nigeria
            </Link>

            <Link
              href="/blog"
              className="font-bold text-violet-700 hover:text-violet-900"
            >
              More business guides →
            </Link>
          </div>
        </article>

        <aside className="h-fit lg:sticky lg:top-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-extrabold uppercase tracking-[.18em] text-violet-700">
              In this guide
            </p>

            <nav className="mt-4 space-y-3 text-sm">
              <a
                href="#selling-options"
                className="block font-semibold text-slate-600 transition hover:text-violet-700"
              >
                Six ways to sell online
              </a>

              <a
                href="#selling-options"
                className="block font-semibold text-slate-600 hover:text-violet-700"
              >
                Compare selling channels
              </a>

              <a
                href="#selling-options"
                className="block font-semibold text-slate-600 hover:text-violet-700"
              >
                Choose a platform
              </a>
            </nav>

            <div className="my-6 border-t border-slate-100" />

            <p className="text-sm font-bold">
              Ready to build your store?
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Give customers one place to explore your products.
            </p>

            <Link
              href="/signup"
              className="mt-4 block rounded-xl bg-violet-700 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-violet-800"
            >
              Get started ↗
            </Link>
          </div>

          <div className="mt-4 rounded-2xl bg-violet-50 p-5">
            <p className="text-xs font-extrabold uppercase tracking-wider text-violet-700">
              Keep learning
            </p>

            <Link
              href="/blog/start-online-store-nigeria"
              className="mt-2 block font-bold text-slate-800 hover:text-violet-700"
            >
              How to start an online store in Nigeria →
            </Link>
          </div>
        </aside>
      </div>

      <footer className="border-t border-violet-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="text-lg font-black tracking-tight text-slate-900"
          >
            orizzon<span className="text-violet-700">cart</span>
          </Link>

          <p>Helping businesses build their online presence.</p>
        </div>
      </footer>
    </main>
  );
}
