import Link from 'next/link';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { MarketplaceBottomNav } from '@/components/marketplace/MarketplaceBottomNav';
import { StoreReviews, Stars } from '@/components/reviews/StoreReviews';

export const dynamic = 'force-dynamic';

export default async function SellerProfilePage({
  params,
}: {
  params: Promise<{ store_slug: string }>;
}) {
  const { store_slug } = await params;
  const admin = createAdminClient();

  const { data: m } = await admin
    .from('merchants')
    .select('*')
    .eq('store_slug', store_slug)
    .maybeSingle();

  if (!m || !m.is_active) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 pb-24 text-center text-gray-500">
        Seller not found.
      </div>
    );
  }

  const eligible =
    m.is_verified && m.payment_receiving_status === 'ACTIVE' && m.is_on_marketplace;

  // Import store reviews for the header rating (only approved ones)
  const { data: reviewRows } = await admin
    .from('store_reviews')
    .select('rating')
    .eq('merchant_id', m.id)
    .eq('status', 'approved');

  const reviewCount = reviewRows?.length || 0;
  const reviewAvg = reviewCount
    ? Math.round((reviewRows!.reduce((a: number, r: any) => a + r.rating, 0) / reviewCount) * 10) / 10
    : 0;

  let products: any[] = [];
  if (eligible) {
    const { data } = await admin
      .from('products')
      .select('id, name, slug, price, images')
      .eq('merchant_id', m.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(24);
    products = data || [];
  }

  const locs = Array.isArray(m.business_locations) ? m.business_locations : [];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-r from-purple-700 to-blue-700 text-white">
        <div className="max-w-3xl mx-auto px-4 py-6 flex items-center gap-4">
          {m.logo_url ? (
            <img src={m.logo_url} className="w-16 h-16 rounded-2xl object-cover border-2 border-white/40" alt="" />
          ) : (
            <span className="w-16 h-16 rounded-2xl bg-white/20 text-2xl font-extrabold flex items-center justify-center">
              {m.store_name?.[0]?.toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <h1 className="text-xl font-extrabold truncate">{m.store_name}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {m.is_verified ? (
                <span className="text-[10px] font-extrabold bg-green-500 text-white px-2 py-0.5 rounded-full">
                  ✅ VERIFIED SELLER
                </span>
              ) : (
                <span className="text-[10px] font-extrabold bg-gray-500 text-white px-2 py-0.5 rounded-full">
                  UNVERIFIED
                </span>
              )}
              {reviewCount > 0 && (
                <span className="flex items-center gap-1 text-[10px] font-extrabold bg-white/15 px-2 py-0.5 rounded-full">
                  <Stars value={reviewAvg} className="text-[10px]" /> {reviewAvg} ({reviewCount})
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 pt-4 space-y-4">
        {m.business_about && (
          <div className="bg-white border rounded-2xl p-4">
            <h2 className="font-bold text-sm mb-2">About this business</h2>
            <p className="text-sm text-gray-600 whitespace-pre-line">{m.business_about}</p>
            {m.cac_number && (
              <p className="text-[10px] text-gray-400 mt-2">Registered: {m.cac_number}</p>
            )}
          </div>
        )}

        <div className="bg-white border rounded-2xl p-4 space-y-2">
          <h2 className="font-bold text-sm">Contact & Locations</h2>
          {m.business_phone && (
            <a href={`tel:${m.business_phone}`} className="block text-sm text-purple-700 font-semibold">
              📞 {m.business_phone}
            </a>
          )}
          {m.business_email && (
            <a href={`mailto:${m.business_email}`} className="block text-sm text-purple-700 font-semibold">
              ✉️ {m.business_email}
            </a>
          )}
          <div className="pt-2 space-y-2">
            {locs.map((l: any, i: number) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600">
                <b>📍 Location {i + 1}:</b> {l.address}, {l.city}, {l.state}
              </div>
            ))}
          </div>
        </div>

        {/* Imported store reviews */}
        <StoreReviews merchantId={m.id} />

        {eligible ? (
          <div>
            <h2 className="font-extrabold text-lg mb-3">Products from {m.store_name}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {products.map((p) => (
                <a
                  key={p.id}
                  href={`https://${m.store_slug}.orizzoncart.name.ng/p/${p.slug}`}
                  target="_blank"
                  className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm"
                >
                  <div className="aspect-square bg-gray-100">
                    {p.images?.[0]?.url ? (
                      <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">📦</div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium line-clamp-1">{p.name}</p>
                    <p className="text-sm font-extrabold text-purple-700">₦{Number(p.price).toLocaleString()}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-xs text-yellow-800">
            This seller is not currently active on the marketplace.
          </div>
        )}

        <a
          href={`https://${m.store_slug}.orizzoncart.name.ng`}
          target="_blank"
          className="block text-center py-3 bg-white border border-purple-600 text-purple-700 font-bold rounded-xl hover:bg-purple-50"
        >
          Visit Full Store →
        </a>
      </main>

      <MarketplaceBottomNav />
    </div>
  );
}