import Link from 'next/link';
import { cookies } from 'next/headers';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { THEMES } from '@/lib/themes';
import { MarketplaceBottomNav } from '@/components/marketplace/MarketplaceBottomNav';
import { FlashSaleBanner } from '@/components/marketplace/FlashSaleBanner';
import { MarketplaceAppExperience } from '@/components/marketplace/MarketplaceAppExperience';
import { MarketplaceTour } from '@/components/marketplace/MarketplaceTour';
import { parseAffinityCookie, rankActiveStores } from '@/lib/active-stores-feed';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'OrizzonCart Marketplace — Shop Verified Nigerian Stores Online',
  description:
    'OrizzonCart Marketplace brings verified Nigerian stores together: fashion, tech, beauty, foods and more. Flash deals daily, secure payments, trackable delivery. Shop the OrizzonCart Marketplace today.',
  keywords: [
    'OrizzonCart Marketplace',
    'orizzoncart marketplace',
    'OrizzonCart market',
    'marketplace app Nigeria',
    'verified Nigerian sellers',
  ],
  alternates: { canonical: 'https://orizzoncart.name.ng/marketplace' },
  openGraph: {
    title: 'OrizzonCart Marketplace — Shop Verified Nigerian Stores',
    description:
      'Flash deals daily from verified Nigerian businesses. Secure payments and trackable delivery in one app.',
    url: 'https://orizzoncart.name.ng/marketplace',
    siteName: 'OrizzonCart Marketplace',
    type: 'website',
    images: [{ url: '/marketplace-og.jpg', width: 1200, height: 630, alt: 'OrizzonCart Marketplace' }],
  },
};

const themeList: any[] = Object.values(THEMES);
function themeFor(themeId: string | null | undefined) {
  return (THEMES as any)[themeId as any] || themeList[0];
}

const CATEGORIES = [
  'Fashion',
  'Tech',
  'Home',
  'Beauty',
  'Foods',
  'Digital',
  'Health',
  'Kids',
  'Sports',
  'Automotive',
  'Books',
  'Crafts',
  'Pets',
  'Garden',
  'Jewelry',
];

function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed >>> 0;
  const rnd = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function productUrl(storeSlug: string | undefined, slug: string) {
  if (!storeSlug) return '#';
  return 'https://' + storeSlug + '.orizzoncart.name.ng/p/' + slug;
}

function categoryChipHref(cat: string) {
  return '/marketplace/categories?cat=' + encodeURIComponent(cat);
}

export default async function MarketplacePage() {
  const admin = createAdminClient();

  const cookieStore = await cookies();
  const sessionSeed = cookieStore.get('mkt_seed')?.value || 'guest';
  const bucket = Math.floor(Date.now() / (6 * 60 * 60 * 1000));
  const seed = hashString(sessionSeed + ':' + String(bucket));

  const { data: merchants } = await admin
    .from('merchants')
    .select('id, store_slug, store_name, logo_url, theme_id, last_dashboard_at')
    .eq('is_on_marketplace', true)
    .eq('payment_receiving_status', 'ACTIVE')
    .eq('is_verified', true)
    .eq('is_active', true);

  const affinityIds = parseAffinityCookie(cookieStore.get('mkt_affinity')?.value);

  const rankedMerchants = rankActiveStores(merchants || [], affinityIds, sessionSeed);
  const displayMerchants = rankedMerchants.slice(0, 10);
  const merchantIds = rankedMerchants.map((m: any) => m.id);

  const { data: products } = merchantIds.length
    ? await admin
        .from('products')
        .select('id, name, slug, price, compare_at_price, images, merchant_id, created_at')
        .in('merchant_id', merchantIds)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(60)
    : { data: [] as any[] };

  const byId = new Map(rankedMerchants.map((m: any) => [m.id, m]));
  const merchantRank = new Map(rankedMerchants.map((m: any, i: number) => [m.id, i]));

  const productRows = (products || []).map((p: any) => ({
    ...p,
    merchant: byId.get(p.merchant_id),
  }));

  function scoreProduct(p: any) {
    const affinity = affinityIds.indexOf(p.merchant_id) >= 0 ? 0 : 1;
    const mRank = merchantRank.has(p.merchant_id)
      ? (merchantRank.get(p.merchant_id) as number)
      : 999;
    const created = p.created_at ? new Date(p.created_at).getTime() : 0;
    return { affinity: affinity, mRank: mRank, created: created };
  }

  const sortedProducts = productRows.slice().sort(function (a, b) {
    const sa = scoreProduct(a);
    const sb = scoreProduct(b);
    if (sa.affinity !== sb.affinity) return sa.affinity - sb.affinity;
    if (sa.mRank !== sb.mRank) return sa.mRank - sb.mRank;
    return sb.created - sa.created;
  });

  const windowed: any[] = [];
  for (let i = 0; i < sortedProducts.length; i += 6) {
    const chunk = sortedProducts.slice(i, i + 6);
    windowed.push.apply(windowed, seededShuffle(chunk, seed + i));
  }

  const all = windowed;
  const deals = all.filter(function (p: any) {
    return p.compare_at_price && p.compare_at_price > p.price;
  });
  const fresh = all.slice(0, 10);
  const discover = all.slice(4, 34);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: 'OrizzonCart Marketplace',
        url: 'https://orizzoncart.name.ng/marketplace',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://orizzoncart.name.ng/marketplace/categories?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'ItemList',
        itemListElement: fresh.slice(0, 20).map(function (p: any, i: number) {
          return {
            '@type': 'ListItem',
            position: i + 1,
            item: {
              '@type': 'Product',
              name: p.name,
              image: (p.images && p.images[0] && p.images[0].url) || undefined,
              offers: {
                '@type': 'Offer',
                price: Number(p.price),
                priceCurrency: 'NGN',
                url: productUrl(p.merchant && p.merchant.store_slug, p.slug),
                availability: 'https://schema.org/InStock',
              },
            },
          };
        }),
      },
    ],
  };

  return (
    <>
      <MarketplaceAppExperience />
      <MarketplaceTour />

      <div className="min-h-screen bg-gray-50 pb-24">
        <header className="sticky top-0 z-40 bg-gradient-to-r from-purple-700 to-blue-700 text-white shadow-md">
          <div className="max-w-3xl mx-auto px-4 py-3 space-y-2">
            <div className="flex items-center justify-between">
              <Link href="/marketplace" className="font-extrabold text-lg tracking-tight">
                Orizzon<span className="text-yellow-300">Cart</span> Marketplace
              </Link>
              <span className="text-[10px] bg-white/15 rounded-full px-2 py-1 font-semibold">
                🇳🇬 Verified sellers only
              </span>
            </div>
            <form action="/marketplace/categories" method="GET">
              <input
                name="q"
                placeholder="Search products, stores, categories…"
                className="w-full rounded-full px-4 py-2.5 text-sm text-gray-900 bg-white shadow-inner outline-none"
              />
            </form>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 space-y-6 pt-4">
          <h1 className="sr-only">
            OrizzonCart Marketplace — Shop Verified Nigerian Stores Online
          </h1>
          <FlashSaleBanner />

          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
            {CATEGORIES.map(function (c) {
              return (
                <Link
                  key={c}
                  href={categoryChipHref(c)}
                  className="shrink-0 px-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-700 hover:border-purple-400 hover:text-purple-700"
                >
                  {c}
                </Link>
              );
            })}
          </div>

          {displayMerchants.length > 0 && (
            <section>
              <div className="flex items-center justify-between gap-2 mb-3">
                <h2 className="font-extrabold text-lg">🟢 Active Stores</h2>
                <Link
                  href="/marketplace/stores"
                  className="shrink-0 text-xs font-extrabold text-purple-700 hover:text-purple-900"
                >
                  See all →
                </Link>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
                {displayMerchants.map(function (m: any) {
                  const t = themeFor(m.theme_id);
                  return (
                    <Link
                      key={m.id}
                      href={'/marketplace/store/' + m.store_slug}
                      className="shrink-0 w-40 bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md"
                    >
                      <div
                        className="h-2"
                        style={{ backgroundColor: t.variables['--color-primary'] }}
                      />
                      <div className="p-3">
                        <div className="flex items-center gap-2">
                          {m.logo_url ? (
                            <img
                              src={m.logo_url}
                              className="w-8 h-8 rounded-full object-cover"
                              alt=""
                            />
                          ) : (
                            <span
                              className="w-8 h-8 rounded-full text-white text-xs font-extrabold flex items-center justify-center"
                              style={{ backgroundColor: t.variables['--color-primary'] }}
                            >
                              {(m.store_name && m.store_name[0]
                                ? m.store_name[0]
                                : 'S'
                              ).toUpperCase()}
                            </span>
                          )}
                          <p className="text-xs font-bold truncate">{m.store_name}</p>
                        </div>
                        <p
                          className="mt-2 text-[10px] font-bold text-center rounded-full py-1 text-white"
                          style={{ backgroundColor: t.variables['--color-primary'] }}
                        >
                          View Profile →
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {deals.length > 0 && (
            <section>
              <h2 className="font-extrabold text-lg mb-3">⚡ Flash Deals</h2>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
                {deals.map(function (p: any) {
                  const t = themeFor(p.merchant && p.merchant.theme_id);
                  const off = Math.round((1 - p.price / p.compare_at_price) * 100);
                  const img = p.images && p.images[0] ? p.images[0].url : null;
                  return (
                    <a
                      key={p.id}
                      href={productUrl(p.merchant && p.merchant.store_slug, p.slug)}
                      target="_blank"
                      className="shrink-0 w-40 bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative"
                    >
                      <span className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                        -{off}%
                      </span>
                      <div className="aspect-square bg-gray-100">
                        {img ? (
                          <img src={img} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">
                            📦
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-medium line-clamp-1">{p.name}</p>
                        <p
                          className="text-sm font-extrabold"
                          style={{ color: t.variables['--color-primary'] }}
                        >
                          ₦{Number(p.price).toLocaleString()}{' '}
                          <span className="text-[10px] text-gray-400 line-through font-medium">
                            ₦{Number(p.compare_at_price).toLocaleString()}
                          </span>
                        </p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </section>
          )}

          <section>
            <h2 className="font-extrabold text-lg mb-3">✨ Fresh For You</h2>
            {fresh.length === 0 ? (
              <div className="bg-white border rounded-2xl p-10 text-center text-gray-500 text-sm">
                No products yet. Merchants are onboarding! 🏪
              </div>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
                {fresh.map(function (p: any) {
                  const t = themeFor(p.merchant && p.merchant.theme_id);
                  const img = p.images && p.images[0] ? p.images[0].url : null;
                  const storeSlug = p.merchant && p.merchant.store_slug;
                  return (
                    <a
                      key={p.id}
                      href={productUrl(storeSlug, p.slug)}
                      target="_blank"
                      className="shrink-0 w-40 bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md"
                    >
                      <div className="aspect-square bg-gray-100">
                        {img ? (
                          <img src={img} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">
                            📦
                          </div>
                        )}
                      </div>
                      <div className="p-2 space-y-1">
                        <p className="text-xs font-medium line-clamp-2">{p.name}</p>
                        <p
                          className="text-sm font-extrabold"
                          style={{ color: t.variables['--color-primary'] }}
                        >
                          ₦{Number(p.price).toLocaleString()}
                        </p>
                        <Link
                          href={'/marketplace/store/' + (storeSlug || '')}
                          className="block text-[10px] text-gray-400 truncate hover:text-purple-600"
                        >
                          🏪 {p.merchant && p.merchant.store_name} • View profile
                        </Link>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </section>

          <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-gray-600">
            <div className="bg-white border rounded-xl p-3">✅ Verified sellers</div>
            <div className="bg-white border rounded-xl p-3">🔒 Secure payments</div>
            <div className="bg-white border rounded-xl p-3">📍 Trackable delivery</div>
          </div>

          {discover.length > 0 && (
            <section>
              <h2 className="font-extrabold text-lg mb-3">🧭 Discover</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {discover.map(function (p: any) {
                  const t = themeFor(p.merchant && p.merchant.theme_id);
                  const img = p.images && p.images[0] ? p.images[0].url : null;
                  const storeSlug = p.merchant && p.merchant.store_slug;
                  return (
                    <a
                      key={'d-' + p.id}
                      href={productUrl(storeSlug, p.slug)}
                      target="_blank"
                      className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md"
                    >
                      <div className="aspect-square bg-gray-100">
                        {img ? (
                          <img src={img} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">
                            📦
                          </div>
                        )}
                      </div>
                      <div className="p-2 space-y-1">
                        <p className="text-xs font-medium line-clamp-2">{p.name}</p>
                        <p
                          className="text-sm font-extrabold"
                          style={{ color: t.variables['--color-primary'] }}
                        >
                          ₦{Number(p.price).toLocaleString()}
                        </p>
                        <Link
                          href={'/marketplace/store/' + (storeSlug || '')}
                          className="block text-[10px] text-gray-400 truncate hover:text-purple-600"
                        >
                          🏪 {p.merchant && p.merchant.store_name} • View profile
                        </Link>
                      </div>
                    </a>
                  );
                })}
              </div>
            </section>
          )}
        </main>

        <MarketplaceBottomNav active="home" />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}