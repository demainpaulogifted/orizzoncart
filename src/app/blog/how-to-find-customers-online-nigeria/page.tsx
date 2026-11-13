
import Link from 'next/link';
import type { Metadata } from 'next';

const SITE_URL = 'https://orizzoncart.com.ng';
const ARTICLE_URL = `${SITE_URL}/blog/how-to-find-customers-online-nigeria`;

export const metadata: Metadata = {
  title: 'How to Find Customers Online in Nigeria: 10 Practical Strategies | OrizzonCart',
  description:
    'Discover practical ways to find customers online in Nigeria. Learn how to use Instagram, Facebook, TikTok, WhatsApp, Google and online marketplaces to grow your business.',
  alternates: {
    canonical: ARTICLE_URL,
  },
  openGraph: {
    title: 'How to Find Customers Online in Nigeria',
    description:
      'A practical guide to attracting customers online and growing your Nigerian business.',
    url: ARTICLE_URL,
    siteName: 'OrizzonCart',
    type: 'article',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=85',
        width: 1200,
        height: 630,
        alt: 'Business owners discussing online marketing and customer growth',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How to Find Customers Online in Nigeria',
    description:
      'Practical customer acquisition strategies for Nigerian small businesses.',
    images: [
      'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=85',
    ],
  },
};

const faqs = [
  {
    question: 'How can I find customers online in Nigeria?',
    answer:
      'Start by identifying your target customers, then use platforms they already visit, such as Instagram, Facebook, TikTok and WhatsApp. Publish useful content, display clear prices, build trust and make it easy for customers to order.',
  },
  {
    question: 'Can I get customers online without paying for adverts?',
    answer:
      'Yes. You can attract customers through useful social media content, product demonstrations, customer referrals, WhatsApp Status, community groups and search-friendly articles. These methods take consistency and time.',
  },
  {
    question: 'Which social media platform is best for getting customers?',
    answer:
      'It depends on your products and audience. Instagram and TikTok can work well for visual products, Facebook can help you reach communities and local buyers, while WhatsApp is useful for conversations and repeat customers.',
  },
  {
    question: 'Do I need a website to sell products online?',
    answer:
      'You can begin selling through social media, but a dedicated online store gives customers a central place to view products, prices and business information. It can also make your business easier to discover through search engines.',
  },
  {
    question: 'How can OrizzonCart help my business get customers?',
    answer:
      'OrizzonCart provides online store and marketplace opportunities that can help businesses present their products online. You can create a store, display products and make them available to customers browsing the marketplace.',
  },
];

const strategies = [
  {
    number: '01',
    title: 'Know exactly who you want to reach',
    description:
      'Do not try to sell to everybody. Identify the people most likely to need your products. Consider their location, interests, budget, problems and shopping habits.',
    action: 'Create a simple customer profile before choosing where to advertise.',
  },
  {
    number: '02',
    title: 'Use Instagram to showcase your products',
    description:
      'Instagram is useful for fashion, beauty, food, accessories, handmade goods and other visual products. Share clear product photos, short videos, prices and customer experiences.',
    action: 'Use Reels, product demonstrations, Stories and clear calls to action.',
  },
  {
    number: '03',
    title: 'Reach communities on Facebook',
    description:
      'Facebook groups and business pages can help you connect with people interested in particular products or services. Participate genuinely in relevant communities instead of repeatedly posting unwanted adverts.',
    action: 'Find communities that match your products and follow their posting rules.',
  },
  {
    number: '04',
    title: 'Create short videos on TikTok',
    description:
      'Short videos can introduce your products to people who have never heard of your business. Demonstrate how a product works, explain its benefits, show packaging or answer common customer questions.',
    action: 'Make helpful videos consistently and give viewers a clear next step.',
  },
  {
    number: '05',
    title: 'Turn WhatsApp into a sales channel',
    description:
      'WhatsApp Business helps you communicate directly with potential customers. Use a professional profile, product catalogue, business description and organised customer conversations.',
    action: 'Share useful WhatsApp Status updates and respond to enquiries promptly.',
  },
  {
    number: '06',
    title: 'Make your business discoverable on Google',
    description:
      'People often search online when they are ready to buy. Publish useful information about your products, create dedicated product pages and make your business information clear and consistent.',
    action: 'Use descriptive page titles, accurate product details and helpful content.',
  },
  {
    number: '07',
    title: 'List products on online marketplaces',
    description:
      'Marketplaces give shoppers another place to discover products. Instead of depending entirely on people who already follow your social accounts, you can make products available to people browsing for things to buy.',
    action: 'Keep product names, photographs, descriptions, prices and stock information accurate.',
  },
  {
    number: '08',
    title: 'Build trust with customer reviews',
    description:
      'People are more comfortable buying when they can see evidence of good customer experiences. Ask satisfied customers for honest feedback and respond professionally to complaints.',
    action: 'Request genuine reviews after successful orders. Never purchase fake reviews.',
  },
  {
    number: '09',
    title: 'Use referrals to reach new buyers',
    description:
      'Satisfied customers can introduce your business to friends, colleagues and family members. Make it easy for customers to share your product links and recommend your business.',
    action: 'Consider a simple referral reward that your business can afford.',
  },
  {
    number: '10',
    title: 'Test paid advertising carefully',
    description:
      'Advertising on social platforms can help you reach selected audiences, but spending money does not automatically produce sales. Start with a small budget, test different messages and measure actual enquiries and purchases.',
    action: 'Track cost per enquiry and completed sale before increasing your budget.',
  },
];

const platforms = [
  {
    name: 'Instagram',
    type: 'Visual discovery',
    best: 'Fashion, beauty, food and lifestyle products',
    image:
      'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Facebook',
    type: 'Communities and local reach',
    best: 'Local businesses, household products and community audiences',
    image:
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'TikTok',
    type: 'Short-form video discovery',
    best: 'Products that can be demonstrated in short videos',
    image:
      'https://images.unsplash.com/photo-1611262588024-d12430b98920?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'WhatsApp Business',
    type: 'Direct customer communication',
    best: 'Enquiries, catalogues, customer support and repeat orders',
    image:
      'https://images.unsplash.com/photo-1611746872915-64382b5c76da?auto=format&fit=crop&w=900&q=80',
  },
];

const tips = [
  'Use clear product photographs taken in good lighting.',
  'Show prices or explain how customers can get a price.',
  'Describe the real benefits and limitations of each product.',
  'State your delivery locations and expected delivery arrangements.',
  'Make ordering instructions easy to understand.',
  'Reply to enquiries professionally and avoid misleading promises.',
  'Keep your product information consistent across platforms.',
  'Review which channels generate genuine orders, not just likes.',
];

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'How to Find Customers Online in Nigeria',
  description:
    'Practical strategies for Nigerian businesses to attract customers through social media, search engines, marketplaces and online stores.',
  image: [
    'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=85',
  ],
  author: {
    '@type': 'Organization',
    name: 'OrizzonCart',
    url: SITE_URL,
  },
  publisher: {
    '@type': 'Organization',
    name: 'OrizzonCart',
    url: SITE_URL,
  },
  mainEntityOfPage: ARTICLE_URL,
  datePublished: '2026-11-13',
  dateModified: '2026-11-13',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
};

export default function HowToFindCustomersOnlineNigeria() {
  return (
    <main className="min-h-screen bg-[#faf9fc] text-[#201832]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-[#180b32] text-white">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-purple-600/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 pb-14 pt-7 sm:px-8 sm:pb-20 lg:px-12 lg:pt-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/" className="text-xl font-black tracking-tight text-white">
              Orizzon<span className="text-purple-300">Cart</span>
            </Link>
            <Link
              href="/blog"
              className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Explore the blog →
            </Link>
          </div>

          <div className="mt-12 grid items-center gap-12 lg:mt-16 lg:grid-cols-[1fr_0.95fr]">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-300/30 bg-purple-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-purple-200">
                <span className="h-2 w-2 rounded-full bg-purple-300" />
                Nigerian small business guide
              </div>

              <h1 className="max-w-3xl text-4xl font-black leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
                How to Find
                <span className="block text-purple-300">
                  Customers Online
                </span>
                in Nigeria
              </h1>

              <p className="mt-7 max-w-xl text-base leading-8 text-purple-100/80 sm:text-lg">
                Having a good product is only the beginning. Learn how to reach
                people who need what you sell, build trust and turn online
                attention into real customers.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-purple-100/70">
                <span className="rounded-full bg-white/10 px-4 py-2">
                  Practical business guide
                </span>
                <span>•</span>
                <span>12–15 min read</span>
                <span>•</span>
                <span>Updated November 2026</span>
              </div>

              <div className="mt-9 flex flex-wrap gap-3">
                <a
                  href="#strategies"
                  className="rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-[#32135c] shadow-lg shadow-black/20 transition hover:-translate-y-0.5"
                >
                  Read the guide →
                </a>
                <Link
                  href="/signup"
                  className="rounded-xl border border-white/25 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  Create your online store
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-[2rem] bg-purple-500/20 blur-2xl" />
              <div className="relative overflow-hidden rounded-[1.8rem] border border-white/15 bg-white/10 p-2 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=85"
                  alt="Small business owners planning their customer growth strategy"
                  className="h-[330px] w-full rounded-[1.3rem] object-cover sm:h-[420px]"
                />
                <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/30 bg-[#1c1031]/85 p-5 text-white shadow-xl backdrop-blur-md">
                  <p className="text-xs font-bold uppercase tracking-widest text-purple-200">
                    Grow your reach
                  </p>
                  <p className="mt-1 text-lg font-bold">
                    Get your products in front of more people.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BREADCRUMB */}
      <div className="border-b border-purple-100 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-4 text-sm text-gray-500 sm:px-8 lg:px-12">
          <Link href="/" className="hover:text-purple-700">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/blog" className="hover:text-purple-700">
            Blog
          </Link>
          <span className="mx-2">/</span>
          <span className="font-semibold text-purple-800">
            Finding customers online
          </span>
        </div>
      </div>

      {/* INTRODUCTION */}
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:px-12 lg:py-20">
        <article className="min-w-0">
          <div className="rounded-3xl border border-purple-100 bg-white p-7 shadow-sm sm:p-10">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-700">
              Introduction
            </p>
            <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-[#25163d] sm:text-4xl">
              Your next customer could already be online.
            </h2>
            <p className="mt-6 leading-8 text-gray-600">
              Many Nigerian entrepreneurs have quality products but struggle
              to find enough customers. Some depend entirely on friends and
              family. Others post products on social media every day without
              getting the enquiries or orders they expect.
            </p>
            <p className="mt-4 leading-8 text-gray-600">
              The problem is not always the product. Sometimes the right
              audience has not discovered the business. Sometimes potential
              customers do not understand the offer, do not trust the seller
              or cannot find a convenient way to order.
            </p>
            <p className="mt-4 leading-8 text-gray-600">
              Finding customers online means putting your business where
              suitable buyers can discover it, giving them useful reasons to
              trust you and making the buying process straightforward.
            </p>
          </div>

          <div className="mt-8 rounded-2xl border-l-4 border-purple-600 bg-purple-50 p-6 sm:p-8">
            <p className="text-sm font-black uppercase tracking-wider text-purple-800">
              The key idea
            </p>
            <p className="mt-2 text-lg font-semibold leading-8 text-[#34234c]">
              Do not focus only on getting more views. Focus on reaching the
              right people and making it easy for them to become customers.
            </p>
          </div>

          {/* STRATEGIES */}
          <section id="strategies" className="scroll-mt-8 pt-16">
            <div className="mb-9">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-700">
                The customer acquisition playbook
              </p>
              <h2 className="mt-3 text-3xl font-black leading-tight text-[#25163d] sm:text-4xl">
                10 practical ways to find customers online
              </h2>
              <p className="mt-4 leading-8 text-gray-600">
                You do not have to use every platform at once. Start with the
                channels that match your products and your customers.
              </p>
            </div>

            <div className="space-y-5">
              {strategies.map((item) => (
                <div
                  key={item.number}
                  className="group rounded-2xl border border-purple-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-purple-300 hover:shadow-lg sm:p-8"
                >
                  <div className="flex items-start gap-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-sm font-black text-purple-800 transition group-hover:bg-purple-700 group-hover:text-white">
                      {item.number}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xl font-extrabold text-[#291b40] sm:text-2xl">
                        {item.title}
                      </h3>
                      <p className="mt-3 leading-8 text-gray-600">
                        {item.description}
                      </p>
                      <div className="mt-5 rounded-xl bg-[#f7f3fc] px-4 py-3 text-sm leading-6 text-purple-900">
                        <strong>Action step:</strong> {item.action}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SOCIAL PLATFORMS */}
          <section className="pt-16">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-700">
              Choose your channels
            </p>
            <h2 className="mt-3 text-3xl font-black leading-tight text-[#25163d] sm:text-4xl">
              Where should Nigerian businesses look for customers?
            </h2>
            <p className="mt-4 leading-8 text-gray-600">
              Different platforms serve different purposes. The best choice
              depends on what you sell and how your customers prefer to shop.
            </p>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {platforms.map((platform) => (
                <div
                  key={platform.name}
                  className="overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <img
                    src={platform.image}
                    alt={`${platform.name} online business marketing`}
                    className="h-48 w-full object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-extrabold text-[#291b40]">
                      {platform.name}
                    </h3>
                    <p className="mt-2 text-xs font-bold uppercase tracking-wider text-purple-700">
                      {platform.type}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-gray-600">
                      <strong>Useful for:</strong> {platform.best}.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* STORE SECTION */}
          <section className="pt-16">
            <div className="overflow-hidden rounded-3xl bg-[#211039] text-white">
              <img
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=85"
                alt="Customer completing an online shopping purchase"
                className="h-64 w-full object-cover"
              />
              <div className="p-7 sm:p-10">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-300">
                  Beyond social media
                </p>
                <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
                  Give customers a place to shop, not just a place to see your
                  posts.
                </h2>
                <p className="mt-5 leading-8 text-purple-100/80">
                  Social media can introduce people to your products, but a
                  dedicated online store gives customers a more organised
                  shopping experience. They can browse product information,
                  compare options and find your business in one place.
                </p>
                <p className="mt-4 leading-8 text-purple-100/80">
                  An online store can also provide shareable product links
                  that you can distribute through WhatsApp, Instagram,
                  Facebook and other marketing channels.
                </p>
                <Link
                  href="/blog/start-online-store-nigeria"
                  className="mt-7 inline-flex rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-purple-900 transition hover:-translate-y-0.5 hover:bg-purple-100"
                >
                  Learn how to start an online store →
                </Link>
              </div>
            </div>
          </section>

          {/* CUSTOMER TRUST */}
          <section className="pt-16">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-700">
              Convert attention into sales
            </p>
            <h2 className="mt-3 text-3xl font-black text-[#25163d] sm:text-4xl">
              What makes people trust an online business?
            </h2>
            <p className="mt-4 leading-8 text-gray-600">
              Getting attention is only one part of customer acquisition.
              People also need confidence that your business is genuine and
              that they understand what they are buying.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {tips.map((tip, index) => (
                <div
                  key={tip}
                  className="flex items-start gap-3 rounded-xl border border-purple-100 bg-white p-5"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-black text-purple-800">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-7 text-gray-600">{tip}</p>
                </div>
              ))}
            </div>
          </section>

          {/* MEASUREMENT */}
          <section className="pt-16">
            <h2 className="text-3xl font-black text-[#25163d] sm:text-4xl">
              Measure what actually brings customers
            </h2>
            <p className="mt-4 leading-8 text-gray-600">
              A post with thousands of views may produce no orders, while a
              smaller post may bring customers who are ready to buy. Measure
              the results that matter to your business.
            </p>

            <div className="mt-7 overflow-hidden rounded-2xl border border-purple-100 bg-white">
              {[
                ['Reach', 'How many people saw your content?'],
                ['Enquiries', 'How many people asked about your products?'],
                ['Qualified enquiries', 'How many were genuinely interested and able to buy?'],
                ['Orders', 'How many enquiries became purchases?'],
                ['Repeat customers', 'How many buyers returned?'],
              ].map(([label, detail]) => (
                <div
                  key={label}
                  className="flex flex-col gap-1 border-b border-purple-100 p-5 last:border-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <strong className="text-[#302044]">{label}</strong>
                  <span className="text-sm text-gray-500">{detail}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ORIZZONCART CTA */}
          <section className="pt-16">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#5b21b6] via-[#4c1d95] to-[#25103f] p-8 text-white shadow-xl sm:p-11">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border-[35px] border-white/10" />
              <div className="relative">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-200">
                  Meet OrizzonCart
                </p>
                <h2 className="mt-4 max-w-2xl text-3xl font-black leading-tight sm:text-4xl">
                  Build your online presence and put your products where
                  customers can discover them.
                </h2>
                <p className="mt-5 max-w-2xl leading-8 text-purple-100/85">
                  OrizzonCart helps businesses establish an online store and
                  gives eligible products an opportunity to appear on the
                  OrizzonCart Marketplace. Build your product presence and
                  share your store with potential customers.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/signup"
                    className="rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-purple-900 transition hover:bg-purple-100"
                  >
                    Get started with OrizzonCart →
                  </Link>
                  <a
                    href="https://marketplace.orizzoncart.com.ng/marketplace"
                    className="rounded-xl border border-white/30 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
                  >
                    Explore the marketplace
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="pt-16">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-700">
              Frequently asked questions
            </p>
            <h2 className="mt-3 text-3xl font-black text-[#25163d] sm:text-4xl">
              Finding customers online: FAQs
            </h2>

            <div className="mt-8 space-y-4">
              {faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group rounded-2xl border border-purple-100 bg-white p-6 shadow-sm"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-[#2c1c40]">
                    {faq.question}
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-lg text-purple-800 transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-4 border-t border-purple-100 pt-4 text-sm leading-8 text-gray-600">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* RELATED ARTICLES */}
          <section className="mt-16 border-t border-purple-100 pt-10">
            <h2 className="text-2xl font-black text-[#25163d]">
              Continue learning
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Link
                href="/blog/where-to-sell-products-online-nigeria"
                className="rounded-2xl border border-purple-100 bg-white p-6 transition hover:border-purple-400 hover:shadow-md"
              >
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
                  Related guide
                </span>
                <h3 className="mt-3 text-lg font-extrabold text-[#302044]">
                  Where to Sell Your Products Online in Nigeria
                </h3>
                <span className="mt-4 inline-block text-sm font-bold text-purple-800">
                  Read article →
                </span>
              </Link>
              <Link
                href="/blog/start-online-store-nigeria"
                className="rounded-2xl border border-purple-100 bg-white p-6 transition hover:border-purple-400 hover:shadow-md"
              >
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
                  Related guide
                </span>
                <h3 className="mt-3 text-lg font-extrabold text-[#302044]">
                  How to Start an Online Store in Nigeria
                </h3>
                <span className="mt-4 inline-block text-sm font-bold text-purple-800">
                  Read article →
                </span>
              </Link>
            </div>
          </section>
        </article>

        {/* SIDEBAR */}
        <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start">
          <div className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-purple-700">
              In this guide
            </p>
            <nav className="mt-5 space-y-4 text-sm font-semibold text-gray-600">
              <a href="#strategies" className="block hover:text-purple-800">
                10 ways to find customers
              </a>
              <a href="#strategies" className="block hover:text-purple-800">
                Social media strategies
              </a>
              <a href="#strategies" className="block hover:text-purple-800">
                Building an online store
              </a>
              <a href="#strategies" className="block hover:text-purple-800">
                Building customer trust
              </a>
            </nav>
          </div>

          <div className="overflow-hidden rounded-2xl bg-[#211039] p-6 text-white">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-2xl">
              ↗
            </div>
            <h3 className="text-xl font-black">
              Ready to take your business online?
            </h3>
            <p className="mt-3 text-sm leading-7 text-purple-100/75">
              Create your online store and give customers another way to
              discover your products.
            </p>
            <Link
              href="/signup"
              className="mt-6 inline-flex w-full justify-center rounded-xl bg-white px-4 py-3 text-sm font-bold text-purple-900 transition hover:bg-purple-100"
            >
              Create your store
            </Link>
          </div>

          <div className="rounded-2xl border border-purple-100 bg-white p-6">
            <p className="text-xs font-black uppercase tracking-wider text-purple-700">
              More from OrizzonCart
            </p>
            <Link
              href="/blog/where-to-sell-products-online-nigeria"
              className="mt-4 block font-bold leading-6 text-[#302044] hover:text-purple-800"
            >
              Where to Sell Your Products Online in Nigeria →
            </Link>
            <Link
              href="/blog/start-online-store-nigeria"
              className="mt-4 block font-bold leading-6 text-[#302044] hover:text-purple-800"
            >
              How to Start an Online Store in Nigeria →
            </Link>
          </div>
        </aside>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-purple-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-5 py-9 text-sm text-gray-500 sm:flex-row sm:items-center sm:px-8 lg:px-12">
          <Link href="/" className="text-lg font-black text-[#27163c]">
            Orizzon<span className="text-purple-700">Cart</span>
          </Link>
          <p>Helping businesses build their online presence.</p>
          <Link href="/blog" className="font-semibold text-purple-800">
            More business guides →
          </Link>
        </div>
      </footer>
    </main>
  );
}
