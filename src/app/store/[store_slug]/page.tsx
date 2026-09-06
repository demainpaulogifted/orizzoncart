// @ts-nocheck
import { notFound } from 'next/navigation';
import { getMerchantBySlug } from '@/lib/supabase/queries';
import { ProductCard } from '@/components/storefront/ProductCard';
import { MerchantHeader } from '@/components/storefront/MerchantHeader';
import { ThemeWrapper } from '@/components/storefront/ThemeWrapper';
import { WhatsAppButton } from '@/components/storefront/WhatsAppButton';

export default async function StorePage({ params }: any) {
  const { store_slug } = await params;
  
  const merchant = await getMerchantBySlug(store_slug);
  if (!merchant) notFound();

  const isShowcaseMode = merchant.cart_status === 'LOCKED';

  return (
    <ThemeWrapper themeId={merchant.theme_id}>
      <MerchantHeader merchant={merchant} isShowcaseMode={isShowcaseMode} />
      
      {isShowcaseMode && (
        <div className="bg-yellow-100 border-b border-yellow-200 px-4 py-3">
          <p className="text-sm text-yellow-800 text-center font-medium">
            🛍️ This store is in showcase mode. Online ordering is currently unavailable.
          </p>
        </div>
      )}

      <section className="py-20 px-4 text-center bg-[var(--color-surface)]">
        <h2 className="text-5xl md:text-6xl font-[var(--font-heading)] text-[var(--color-text)] mb-4">
          {merchant.store_name}
        </h2>
        <p className="text-lg text-[var(--color-text-muted)] mb-8 max-w-2xl mx-auto">
          {merchant.store_description || 'Welcome to our premium store.'}
        </p>
        <button className="bg-[var(--color-primary)] text-white px-8 py-3 rounded-full font-medium hover:opacity-90 transition-opacity shadow-lg">
          Shop New Arrivals
        </button>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h3 className="text-2xl font-bold text-[var(--color-text)] mb-8 font-[var(--font-heading)]">Featured Products</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {merchant.products?.filter((p: any) => p.is_active).map((product: any) => (
            <ProductCard key={product.id} product={product} isShowcaseMode={isShowcaseMode} />
          ))}
        </div>
      </main>

      {merchant.whatsapp_number && (
        <WhatsAppButton phoneNumber={merchant.whatsapp_number} storeName={merchant.store_name} />
      )}
    </ThemeWrapper>
  );
}