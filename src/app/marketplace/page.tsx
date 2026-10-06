import Link from 'next/link';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { MarketplaceMerchantButton } from '@/components/marketplace/MarketplaceMerchantButton';

export const dynamic = 'force-dynamic';

export default async function MarketplacePage() {
  const admin = createAdminClient();

  const { data: merchants } = await admin
    .from('merchants')
    .select('id, store_slug, store_name, logo_url')
    .eq('is_on_marketplace', true)
    .eq('payment_receiving_status', 'ACTIVE')
    .eq('is_active', true);

  const merchantIds = merchants?.map((m) => m.id) || [];

  const { data: products } = await admin
    .from('products')
    .select('id, name, slug, price, images, merchant_id')
    .in('merchant_id', merchantIds)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(40);

  const enrichedProducts = (products || []).map((p) => {
    const merchant = merchants?.find((m) => m.id === p.merchant_id);
    return {
      ...p,
      store_slug: merchant?.store_slug,
      store_name: merchant?.store_name,
      store_logo: merchant?.logo_url,
    };
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-extrabold">
            Orizzon<span className="text-purple-600">Cart</span> Marketplace
          </Link>
          <div className="flex gap-4 items-center">
            <Link href="/login" className="text-sm text-gray-600 hover:text-purple-600">
              Login
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-purple-600 text-white text-sm rounded-full hover:bg-purple-700"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Discover Amazing Local Products</h1>
          <p className="text-lg opacity-90">
            Shop from hundreds of verified Nigerian businesses
          </p>
        </div>
      </section>

      {/* Product Grid */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-6">Featured Products</h2>

        {enrichedProducts.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-xl">No products available yet.</p>
            <p className="text-sm mt-2">Merchants are setting up their stores!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {enrichedProducts.map((p) => {
              const imageUrl =
                p.images && p.images.length > 0 ? p.images[0].url : '';
              const productUrl = `https://${p.store_slug}.orizzoncart.name.ng/p/${p.slug}`;

              return (
                <a
                  key={p.id}
                  href={productUrl}
                  target="_blank"
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition group"
                >
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">
                        📦
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-sm line-clamp-2 mb-2">{p.name}</h3>
                    <p className="text-lg font-bold text-purple-600">
                      ₦{Number(p.price).toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                      {p.store_logo ? (
                        <img
                          src={p.store_logo}
                          alt=""
                          className="w-5 h-5 rounded-full object-cover"
                        />
                      ) : (
                        <span className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px]">
                          🏪
                        </span>
                      )}
                      <span className="text-xs text-gray-500 truncate">{p.store_name}</span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </section>

      {/* Bottom Navigation (Mobile App Style) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden z-50">
        <div className="grid grid-cols-4 py-2">
          <Link href="/marketplace" className="flex flex-col items-center text-purple-600">
            <span className="text-xl">🏠</span>
            <span className="text-[10px] font-semibold">Home</span>
          </Link>
          <Link
            href="/marketplace/categories"
            className="flex flex-col items-center text-gray-400"
          >
            <span className="text-xl">🛍️</span>
            <span className="text-[10px] font-semibold">Shop</span>
          </Link>
          <Link href="/marketplace/orders" className="flex flex-col items-center text-gray-400">
            <span className="text-xl">📦</span>
            <span className="text-[10px] font-semibold">Orders</span>
          </Link>
          <Link href="/marketplace/profile" className="flex flex-col items-center text-gray-400">
            <span className="text-xl">👤</span>
            <span className="text-[10px] font-semibold">Profile</span>
          </Link>
        </div>
      </nav>

      {/* Merchant session floating buttons (only visible to logged-in merchants) */}
      <MarketplaceMerchantButton />
    </div>
  );
}