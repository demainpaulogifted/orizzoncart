import Link from 'next/link';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { THEMES } from '@/lib/themes';
import { MarketplaceBottomNav } from '@/components/marketplace/MarketplaceBottomNav';

export const dynamic = 'force-dynamic';

const themeList: any[] = Object.values(THEMES);
function themeFor(themeId: string | null) {
  return (THEMES as any)[themeId as any] || themeList[0];
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
    .select('id, store_slug, store_name, theme_id')
    .eq('is_on_marketplace', true)
    .eq('payment_receiving_status', 'ACTIVE')
    .eq('is_active', true);

  const ids = merchants?.map((m) => m.id) || [];

  let list: any[] = [];
  let cats: string[] = [];

  if (ids.length) {
    let query = admin
      .from('products')
      .select('id, name, slug, price, compare_at_price, images, category, merchant_id')
      .eq('is_active', true)
      .in('merchant_id', ids)
      .order('created_at', { ascending: false })
      .limit(100);

    if (cat) query = query.ilike('category', cat);

    const { data } = await query;
    list = data || [];
    if (q) list = list.filter((p) => (p.name || '').toLowerCase().includes(q));
    cats = [...new Set((data || []).map((p: any) => p.category).filter(Boolean))] as string[];
  }

  const byId = new Map((merchants || []).map((m) => [m.id, m]));

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-3 space-y-2">
          <form action="/marketplace/categories" method="GET" className="flex gap-2">
            <input
              name="q"
              defaultValue={q}
              placeholder="Search products…"
              className="flex-1 rounded-full px-4 py-2 text-sm border border-gray-300 outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button className="px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-full">
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
            {cats.map((c) => (
              <Link
                key={c}
                href={`/marketplace/categories?cat=${encodeURIComponent(c)}`}
                className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold border ${
                  cat === c ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-200'
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
          {cat ? ` in "${cat}"` : ''} {q ? `matching "${q}"` : ''}
        </p>

        {list.length === 0 ? (
          <div className="bg-white border rounded-2xl p-10 text-center text-gray-500 text-sm">
            Nothing found. Try another search.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {list.map((p: any) => {
              const merchant = byId.get(p.merchant_id);
              const t = themeFor(merchant?.theme_id);
              const img = p.images?.[0]?.url;
              return (
                <a
                  key={p.id}
                  href={`https://${merchant?.store_slug}.orizzoncart.name.ng/p/${p.slug}`}
                  target="_blank"
                  className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md"
                >
                  <div className="aspect-square bg-gray-100">
                    {img ? (
                      <img src={img} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">📦</div>
                    )}
                  </div>
                  <div className="p-2 space-y-1">
                    <p className="text-xs font-medium line-clamp-2">{p.name}</p>
                    <p className="text-sm font-extrabold" style={{ color: t.variables['--color-primary'] }}>
                      ₦{Number(p.price).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-gray-400 truncate">🏪 {merchant?.store_name}</p>
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