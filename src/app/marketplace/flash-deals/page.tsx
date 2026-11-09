import Link from 'next/link';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { ProductCardAddButton } from '@/components/marketplace/ProductCardAddButton';
import { MarketplaceBottomNav } from '@/components/marketplace/MarketplaceBottomNav';

export const dynamic = 'force-dynamic';

export default async function FlashDealsPage() {
  const admin = createAdminClient();

  const { data: merchants } = await admin
    .from('merchants')
    .select('id, store_name, store_slug')
    .eq('is_on_marketplace', true)
    .eq('payment_receiving_status', 'ACTIVE')
    .eq('is_verified', true)
    .eq('is_active', true);

  const merchantIds = (merchants || []).map((m) => m.id);
  const merchantMap = new Map((merchants || []).map((m) => [m.id, m]));
  let deals: any[] = [];

  if (merchantIds.length) {
    const { data } = await admin
      .from('products')
      .select('id, name, slug, price, images, merchant_id, flash_deal_price, flash_deal_ends_at, is_flash_deal')
      .eq('is_active', true)
      .eq('show_in_marketplace', true)
      .eq('is_flash_deal', true)
      .in('merchant_id', merchantIds)
      .order('created_at', { ascending: false });

    const now = Date.now();

    deals = (data || [])
      .filter((p: any) =>
        p.flash_deal_price != null &&
        Number(p.flash_deal_price) < Number(p.price) &&
        (!p.flash_deal_ends_at || new Date(p.flash_deal_ends_at).getTime() >= now)
      )
      .map((p: any) => ({
        ...p,
        merchant: merchantMap.get(p.merchant_id),
      }));
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 text-white">
        <div className="max-w-3xl mx-auto px-4 py-5">
          <Link href="/marketplace" className="text-sm font-bold text-white/90">
            ← Back to Marketplace
          </Link>
          <h1 className="mt-4 text-2xl font-black">⚡ Flash Deals</h1>
          <p className="mt-1 text-sm text-white/90">
            Limited-time discounts from verified stores.
          </p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-5">
        <p className="text-xs text-gray-500 mb-4">
          {deals.length} active deal{deals.length === 1 ? '' : 's'}
        </p>

        {deals.length === 0 ? (
          <div className="rounded-2xl border bg-white p-10 text-center">
            <p className="text-lg font-bold text-gray-800">No active Flash Deals yet</p>
            <p className="mt-2 text-sm text-gray-500">
              Check back when stores publish their next discounts.
            </p>
            <Link href="/marketplace" className="inline-block mt-5 rounded-full bg-purple-600 px-5 py-2 text-sm font-bold text-white">
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {deals.map((p: any) => {
              const image = p.images?.[0]?.url || p.images?.[0] || null;
              const discount = Math.round((1 - Number(p.flash_deal_price) / Number(p.price)) * 100);
              return (
                <div key={p.id} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                  <Link href={'/marketplace/p/' + encodeURIComponent(p.slug)}>
                    <div className="relative aspect-square bg-gray-100">
                      {image ? (
                        <img src={String(image)} alt={p.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-3xl text-gray-300">📦</div>
                      )}
                      <span className="absolute left-2 top-2 rounded-full bg-red-600 px-2 py-1 text-[10px] font-extrabold text-white">
                        -{discount}%
                      </span>
                    </div>
                    <div className="p-2">
                      <p className="line-clamp-2 text-xs font-semibold text-gray-800">{p.name}</p>
                      <p className="mt-1 text-sm font-extrabold text-red-600">
                        ₦{Number(p.flash_deal_price).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400 line-through">
                        ₦{Number(p.price).toLocaleString()}
                      </p>
                      {p.flash_deal_ends_at && (
                        <p className="mt-1 text-[10px] text-gray-500">
                          Ends {new Date(p.flash_deal_ends_at).toLocaleDateString('en-NG')}
                        </p>
                      )}
                      <p className="mt-1 truncate text-[10px] text-gray-500">
                        {p.merchant?.store_name}
                      </p>
                    </div>
                  </Link>
                  <div className="px-2 pb-2">
                    <ProductCardAddButton
                      productId={p.id}
                      storeSlug={p.merchant?.store_slug || ''}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <MarketplaceBottomNav active="shop" />
    </div>
  );
}
