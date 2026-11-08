import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { MarketplaceBottomNav } from '@/components/marketplace/MarketplaceBottomNav';
import { TrackProductView } from '@/components/TrackProductView';
import { MarketplaceAddToCartButton } from '@/components/marketplace/MarketplaceAddToCartButton';

export const dynamic = 'force-dynamic';

export default async function MarketplaceProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const admin = createAdminClient();

  const { data: product } = await admin
    .from('products')
    .select('id, name, slug, price, compare_at_price, description, images, merchant_id, is_active')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (!product) notFound();

  const { data: merchant } = await admin
    .from('merchants')
    .select('id, store_name, store_slug, logo_url')
    .eq('id', product.merchant_id)
    .maybeSingle();

  const { data: more } = await admin
    .from('products')
    .select('id, name, slug, price, images, merchants!inner(store_name, store_slug, is_on_marketplace)')
    .eq('is_active', true)
    .eq('merchants.is_on_marketplace', true)
    .neq('id', product.id)
    .order('created_at', { ascending: false })
    .limit(24);

  const img = product.images && product.images[0]
    ? (product.images[0].url || product.images[0])
    : null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <TrackProductView productId={product.id} source="marketplace" />

      <header className="sticky top-0 z-40 bg-gradient-to-r from-purple-700 to-blue-700 text-white shadow-md">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/marketplace" className="font-extrabold text-lg tracking-tight">
            Orizzon<span className="text-yellow-300">Cart</span> Marketplace
          </Link>
          <Link href="/marketplace/categories" className="text-xs font-semibold bg-white/15 rounded-full px-3 py-1">
            Shop
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-4 space-y-5">
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
          <div className="aspect-square bg-gray-100">
            {img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={String(img)} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl text-gray-300">📦</div>
            )}
          </div>
          <div className="p-4 space-y-2">
            <h1 className="text-xl font-extrabold text-gray-900">{product.name}</h1>
            <p className="text-2xl font-extrabold text-purple-700">
              ₦{Number(product.price).toLocaleString()}
            </p>
            {merchant ? (
              <Link
                href={'/marketplace/store/' + merchant.store_slug}
                className="inline-flex items-center gap-2 text-sm text-gray-600"
              >
                🏪 {merchant.store_name} • View profile
              </Link>
            ) : null}
            {product.description ? (
              <p className="text-sm text-gray-600 whitespace-pre-wrap pt-2">{product.description}</p>
            ) : null}
          </div>
        </div>

        <section>
          <h2 className="font-extrabold text-lg mb-3">More to explore</h2>
          <div className="grid grid-cols-2 gap-3">
            {(more || []).map((p: any) => {
              const pimg = p.images && p.images[0] ? (p.images[0].url || p.images[0]) : null;
              const storeName = p.merchants?.store_name || 'Store';
              return (
                <Link
                  key={p.id}
                  href={'/marketplace/p/' + encodeURIComponent(p.slug)}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm"
                >
                  <div className="aspect-square bg-gray-100">
                    {pimg ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={String(pimg)} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl text-gray-300">📦</div>
                    )}
                  </div>
                  <div className="p-2 space-y-1">
                    <p className="text-xs font-medium line-clamp-2">{p.name}</p>
                    <p className="text-sm font-extrabold text-purple-700">₦{Number(p.price).toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400 truncate">🏪 {storeName}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      <MarketplaceBottomNav active="shop" />
    </div>
  );
}
