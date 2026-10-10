import Link from 'next/link';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { THEMES } from '@/lib/themes';
import { MarketplaceBottomNav } from '@/components/marketplace/MarketplaceBottomNav';

export const dynamic = 'force-dynamic';

const themeList: any[] = Object.values(THEMES);
function themeFor(themeId: string | null | undefined) {
  return (THEMES as any)[themeId as any] || themeList[0];
}

/** Homepage chips — always shown so Shop is never empty of navigation */
const CATEGORY_CHIPS = [
  'Fashion', 'Tech', 'Home', 'Beauty', 'Foods', 'Digital', 'Health',
  'Kids', 'Sports', 'Automotive', 'Books', 'Crafts', 'Pets', 'Garden', 'Jewelry',
];

/** Extra keywords so "Tech" also matches phones, laptops, etc. */
const CATEGORY_ALIASES: Record<string, string[]> = {
  fashion: ['fashion', 'cloth', 'wear', 'dress', 'shirt', 'shoe', 'bag', 'apparel', 'style', 'coat', 'top'],
  tech: ['tech', 'phone', 'laptop', 'gadget', 'electronic', 'computer', 'accessory', 'cable'],
  home: ['home', 'kitchen', 'furniture', 'decor', 'appliance'],
  beauty: ['beauty', 'makeup', 'cosmetic', 'skin', 'hair', 'perfume'],
  foods: ['food', 'snack', 'grocery', 'drink', 'spice'],
  digital: ['digital', 'ebook', 'course', 'software', 'download'],
  health: ['health', 'wellness', 'vitamin', 'fitness', 'medical'],
  kids: ['kid', 'child', 'baby', 'toy'],
  sports: ['sport', 'fitness', 'gym', 'outdoor'],
  automotive: ['auto', 'car', 'vehicle', 'motor'],
  books: ['book', 'novel', 'read'],
  crafts: ['craft', 'handmade', 'art'],
  pets: ['pet', 'dog', 'cat', 'animal'],
  garden: ['garden', 'plant', 'seed'],
  jewelry: ['jewel', 'ring', 'necklace', 'gold', 'silver', 'watch'],
};

function matchesCategory(product: any, cat: string): boolean {
  if (!cat) return true;
  const key = cat.toLowerCase();
  const aliases = CATEGORY_ALIASES[key] || [key];
  const hay = `${product.category || ''} ${product.name || ''}`.toLowerCase();
  return aliases.some((a) => hay.includes(a));
}

function matchesSearch(product: any, merchant: any, q: string): boolean {
  if (!q) return true;
  const hay = [
    product.name,
    product.category,
    product.description,
    merchant?.store_name,
    merchant?.store_slug,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  const tokens = q.split(/\s+/).filter(Boolean);
  return tokens.every((t) => hay.includes(t));
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q || '').trim().toLowerCase();
  const cat = (params.cat || '').trim();

  const admin = createAdminClient();
  const { data: merchants } = await admin
    .from('merchants')
    .select('id, store_slug, store_name, theme_id, last_dashboard_at')
    .eq('is_on_marketplace', true)
    .eq('payment_receiving_status', 'ACTIVE')
    .eq('is_verified', true)
    .eq('is_active', true);

  const ids = merchants?.map((m) => m.id) || [];
  const byId = new Map((merchants || []).map((m) => [m.id, m]));

  let list: any[] = [];

  if (ids.length) {
    const { data } = await admin
      .from('products')
      .select(
        'id, name, slug, price, compare_at_price, images, category, merchant_id, created_at, description'
      )
      .eq('is_active', true)
      .in('merchant_id', ids)
      .order('created_at', { ascending: false })
      .limit(200);

    list = (data || [])
      .filter((p: any) => matchesCategory(p, cat))
      .filter((p: any) => matchesSearch(p, byId.get(p.merchant_id), q));
  }

  const title = cat
    ? `${cat} on Marketplace`
    : q
      ? `Results for "${params.q}"`
      : 'Shop Marketplace';

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-3 space-y-2">
          <div className="flex items-center gap-2">
            <Link href="/marketplace" className="text-sm font-bold text-gray-500 hover:text-purple-700">
              ← Home
            </Link>
            <h1 className="text-sm font-extrabold text-gray-900 truncate flex-1 text-right">
              🛍️ {title}
            </h1>
          </div>

          <form action="/marketplace/categories" method="GET" className="flex gap-2">
            {cat ? <input type="hidden" name="cat" value={cat} /> : null}
            <input
              name="q"
              defaultValue={params.q || ''}
              placeholder="Search products, stores, categories…"
              className="flex-1 rounded-full px-4 py-2 text-sm border border-gray-300 outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button type="submit" className="px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-full">
              🔍
            </button>
          </form>

          <div className="flex gap-2 overflow-x-auto pb-1">
            <Link
              href="/marketplace/categories"
              className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold border ${
                !cat ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              All
            </Link>
            {CATEGORY_CHIPS.map((c) => (
              <Link
                key={c}
                href={`/marketplace/categories?cat=\( {encodeURIComponent(c)} \){q ? `&q=${encodeURIComponent(params.q || '')}` : ''}`}
                className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold border ${
                  cat === c
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                {c}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-4">
        <p className="text-xs text-gray-500 mb-3">
          {list.length} product{list.length === 1 ? '' : 's'}
          {cat ? ` in "${cat}"` : ''}
          {q ? ` matching "${params.q}"` : ''}
          {!cat && !q ? ' from active verified stores' : ''}
        </p>

        {list.length === 0 ? (
          <div className="bg-white border rounded-2xl p-10 text-center text-gray-500 text-sm space-y-2">
            <p>Nothing found right now.</p>
            <p className="text-xs">
              Try another keyword, or{' '}
              <Link href="/marketplace/categories" className="text-purple-600 font-bold underline">
                browse all products
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {list.map((p: any) => {
              const merchant = byId.get(p.merchant_id);
              const t = themeFor(merchant?.theme_id || null);
              const img = p.images?.[0]?.url;
              return (
                <a
                  key={p.id}
                  href={`https://\( {merchant?.store_slug}.orizzoncart.name.ng/p/ \){p.slug}`}
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
                      href={`/marketplace/store/${merchant?.store_slug}`}
                      className="block text-[10px] text-gray-400 truncate hover:text-purple-600"
                    >
                      🏪 {merchant?.store_name} • View profile
                    </Link>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </main>

      <MarketplaceBottomNav active="shop" />
    </div>
  );
}