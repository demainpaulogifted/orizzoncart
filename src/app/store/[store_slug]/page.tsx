import { notFound } from 'next/navigation';
import { getMerchantBySlug } from '@/lib/supabase/queries';
import { ProductCard } from '@/components/storefront/ProductCard';
import { MerchantHeader } from '@/components/storefront/MerchantHeader';

export default async function StorePage({ params }: { params: { store_slug: string } }) {
  const merchant = await getMerchantBySlug(params.store_slug);
  if (!merchant) notFound();

  const isShowcaseMode = merchant.cart_status === 'LOCKED';

  return (
    <div className="min-h-screen bg-[#faf7f2]"> {/* Warm cream background */}
      <MerchantHeader merchant={merchant} isShowcaseMode={isShowcaseMode} />
      
      {isShowcaseMode && (
        <div className="bg-yellow-100 border-b border-yellow-200 px-4 py-3">
          <p className="text-sm text-yellow-800 text-center font-medium">
            🛍️ This store is in showcase mode. Online ordering is currently unavailable.
          </p>
        </div>
      )}

      {/* Hero Section */}
      <section className="py-20 px-4 text-center bg-gradient-to-b from-[#faf7f2] to-white">
        <h2 className="text-5xl md:text-6xl font-display text-[#8b4513] mb-4">Sunlit. Unhurried.</h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">Resort wear for golden days.</p>
        <button className="bg-[#d4a574] text-white px-8 py-3 rounded-full font-medium hover:bg-[#c49464] transition-colors shadow-lg">
          Shop New Arrivals
        </button>
      </section>

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h3 className="text-2xl font-bold text-gray-900 mb-8 font-display">Featured Products</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {merchant.products?.filter((p: any) => p.is_active).map((product: any) => (
            <ProductCard key={product.id} product={product} isShowcaseMode={isShowcaseMode} />
          ))}
        </div>
      </main>
    </div>
  );
}