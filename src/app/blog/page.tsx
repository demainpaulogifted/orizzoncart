import Link from 'next/link';
import type { Metadata } from 'next';
import AdSenseFeedCard from '@/components/ads/AdSenseFeedCard';

const SITE_URL = 'https://orizzoncart.com.ng';

export const metadata: Metadata = {
  title: 'Business Guides and Online Selling Tips for Nigeria',
  description:
    'Explore practical guides on starting an online store, finding customers, selling products online and growing a business in Nigeria.',
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
  openGraph: {
    title: 'OrizzonCart Blog | Business Growth Guides',
    description:
      'Practical online selling, e-commerce and small business guides for Nigerian entrepreneurs.',
    url: `${SITE_URL}/blog`,
    siteName: 'OrizzonCart',
    type: 'website',
  },
};

const articles = [
  {
    slug: 'start-online-store-nigeria',
    category: 'STARTING A BUSINESS',
    title: 'How to Start an Online Store in Nigeria',
    description:
      'A practical guide to launching your online store, adding products, accepting payments and building a business customers can trust.',
    image:
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1000&q=85',
    read: '12 min read',
  },
  {
    slug: 'where-to-sell-products-online-nigeria',
    category: 'SELLING ONLINE',
    title: 'Where to Sell Your Products Online in Nigeria',
    description:
      'Compare social media, online marketplaces and your own store to find the right places to reach more customers.',
    image:
      'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=1000&q=85',
    read: '10 min read',
  },
  {
    slug: 'how-to-find-customers-online-nigeria',
    category: 'CUSTOMER GROWTH',
    title: 'How to Find Customers Online in Nigeria',
    description:
      'Discover practical ways to attract customers through Instagram, Facebook, TikTok, WhatsApp, Google and online marketplaces.',
    image:
      'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1000&q=85',
    read: '12–15 min read',
  },
  {
    slug: 'whatsapp-automated-store-nigeria',
    category: 'WHATSAPP COMMERCE',
    title: 'How to Turn Your WhatsApp Business into an Automated Store',
    description:
      'Learn how to organise product enquiries, orders, payments and customer conversations with a more efficient selling process.',
    image:
      'https://images.unsplash.com/photo-1611605698335-8b1569810432?auto=format&fit=crop&w=1000&q=85',
    read: '15 min read',
  },
];

const collectionSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'OrizzonCart Business Blog',
  url: `${SITE_URL}/blog`,
  description:
    'Practical business, e-commerce and online selling guides for entrepreneurs.',
};

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-[#faf9fc] text-[#201832]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />

      <header className="relative isolate overflow-hidden bg-[#190b36] text-white">
        <div className="absolute -right-24 -top-32 h-96 w-96 rounded-full bg-purple-600/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-8 sm:px-8 lg:px-12 lg:pb-24">
          <nav className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-black tracking-tight">
              Orizzon<span className="text-purple-300">Cart</span>
            </Link>
            <Link
              href="/"
              className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Back to home
            </Link>
          </nav>

          <div className="max-w-3xl pt-16 sm:pt-20">
            <span className="inline-flex rounded-full border border-purple-300/30 bg-purple-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-purple-200">
              OrizzonCart Business Resources
            </span>
            <h1 className="mt-7 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Ideas and guides to help your business grow online.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-purple-100/80">
              Practical advice for Nigerian entrepreneurs, online sellers and
              small business owners. Learn how to find customers, sell smarter
              and build a stronger online business.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm text-purple-100/70">
              <span className="rounded-full bg-white/10 px-4 py-2">Business growth</span>
              <span className="rounded-full bg-white/10 px-4 py-2">E-commerce</span>
              <span className="rounded-full bg-white/10 px-4 py-2">Selling online</span>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[.2em] text-purple-700">
              Explore our latest resources
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Business guides and insights
            </h2>
            <p className="mt-3 max-w-2xl leading-7 text-gray-600">
              Clear, useful articles to help you make better decisions and
              grow your business online.
            </p>
          </div>
          <span className="rounded-full bg-purple-100 px-4 py-2 text-sm font-bold text-purple-800">
            {articles.length} articles
          </span>
        </div>

        <div className="grid gap-7 md:grid-cols-2">
          {articles.map((article, index) => (
            <>
              <article
                key={article.slug}
                className="group overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <Link href={`/blog/${article.slug}`} className="block">
                  <div
                    role="img"
                    aria-label={article.title}
                    className="h-56 bg-cover bg-center transition duration-500 group-hover:scale-[1.02]"
                    style={{ backgroundImage: `url("${article.image}")` }}
                  />
                  <div className="p-6 sm:p-7">
                    <p className="text-xs font-black tracking-[.16em] text-purple-700">
                      {article.category}
                    </p>
                    <h3 className="mt-3 text-2xl font-black leading-tight text-[#25163d] transition group-hover:text-purple-700">
                      {article.title}
                    </h3>
                    <p className="mt-4 leading-7 text-gray-600">
                      {article.description}
                    </p>
                    <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-5">
                      <span className="text-xs font-medium text-gray-500">
                        {article.read}
                      </span>
                      <span className="font-bold text-purple-700">
                        Read article →
                      </span>
                    </div>
                  </div>
                </Link>
              </article>

              {index === 1 && (
                <div key="blog-feed-ad" className="md:col-span-2">
                  <AdSenseFeedCard />
                </div>
              )}
            </>
          ))}
        </div>

        <div className="mt-16 overflow-hidden rounded-3xl bg-[#20103c] p-8 text-white sm:p-12">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-purple-300">
            Build your business online
          </p>
          <h2 className="mt-4 max-w-2xl text-3xl font-black sm:text-4xl">
            Turn what you learn into your next business move.
          </h2>
          <p className="mt-4 max-w-2xl leading-7 text-purple-100/80">
            Create your online store with OrizzonCart and give customers a
            dedicated place to discover your products.
          </p>
          <Link
            href="/signup"
            className="mt-7 inline-flex rounded-xl bg-white px-6 py-3 font-bold text-purple-900 transition hover:bg-purple-100"
          >
            Create your store
          </Link>
        </div>
      </section>

      <footer className="border-t border-purple-100 bg-white px-5 py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} OrizzonCart. Business resources for a
        growing digital economy.
      </footer>
    </main>
  );
}
