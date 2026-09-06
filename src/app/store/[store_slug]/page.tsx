import { notFound } from 'next/navigation';
import { getMerchantBySlug } from '@/lib/supabase/queries';
import { ProductCard } from '@/components/storefront/ProductCard';
import { MerchantHeader } from '@/components/storefront/MerchantHeader';

export default async function StorePage({ params }: { params: { store_slug: string } }) {
  const merchant = await getMerchantBySlug(params.store_slug);
  if (!merchant) notFound();

  const isShowcaseMode = merchant.cart_status === 'LOCKED';

  return (
    <div className="min-h-screen bg-white">
      <MerchantHeader merchant={merchant} isShowcaseMode={isShowcaseMode} />
      {isShowcaseMode && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
          <p className="text-sm text-yellow-800 text-center">🛍️ This store is in showcase mode. Online ordering is currently unavailable.</p>
        </div>
      )}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {merchant.products?.filter((p: any) => p.is_featured && p.is_active).map((product: any) => (
            <ProductCard key={product.id} product={product} isShowcaseMode={isShowcaseMode} />
          ))}
        </div>
      </main>
    </div>
  );
}