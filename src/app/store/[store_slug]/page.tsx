// @ts-nocheck
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMerchantBySlug } from '@/lib/supabase/queries';
import { ProductCard } from '@/components/storefront/ProductCard';
import { MerchantHeader } from '@/components/storefront/MerchantHeader';
import { ThemeWrapper } from '@/components/storefront/ThemeWrapper';
import { WhatsAppButton } from '@/components/storefront/WhatsAppButton';
import { ShareButtons } from '@/components/storefront/ShareButtons';
import { getStoreUrl } from '@/lib/store-url';

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { store_slug } = await params;
  const merchant = await getMerchantBySlug(store_slug);
  if (!merchant) return {};

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://orizzoncart.vercel.app';
  const image =
    merchant.products?.find((p: any) => p.is_active && p.images?.[0]?.url)?.images?.[0]?.url ||
    `${appUrl}/icon-512.png`;
  const url = getStoreUrl(store_slug);
  const title = `${merchant.store_name} — Online Store | OrizzonCart`;
  const description =
    merchant.store_description ||
    `Shop ${merchant.store_name} online. Secure payments, fast delivery & WhatsApp support.`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'OrizzonCart',
      type: 'website',
      images: [{ url: image, width: 1200, height: 630, alt: merchant.store_name }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default async function StorePage({ params, searchParams }: any) {
  const { store_slug } = await params;
  const sp = await searchParams;

  const merchant = await getMerchantBySlug(store_slug);
  if (!merchant) notFound();

  const themeId = sp?.preview_theme || merchant.theme_id;
  const maintenanceExpired = merchant.maintenance_expires_at && new Date(merchant.maintenance_expires_at) < new Date();
  const isShowcaseMode = merchant.cart_status === 'LOCKED' || !!maintenanceExpired;
  const products = (merchant.products || []).filter((p: any) => p.is_active);
  const storeUrl = getStoreUrl(store_slug);

  return (
    <ThemeWrapper themeId={themeId}>
      {sp?.preview_theme && (
        <div className="bg-purple-600 text-white text-center text-xs font-bold py-2 px-4">
          👁 Theme Preview Mode — this is how your store looks with this theme.
        </div>
      )}

      <MerchantHeader merchant={merchant} isShowcaseMode={isShowcaseMode} />

      {isShowcaseMode && (
        <div className="bg-yellow-100 border-b border-yellow-200 px-4 py-3">
          <p className="text-sm text-yellow-800 text-center font-medium">
            🛍️ This store is in showcase mode. Online ordering is currently unavailable.
          </p>
        </div>
      )}

      <ShareButtons url={storeUrl} title={merchant.store_name} />

      <section className="px-4 pt-16 pb-20 text-center bg-[var(--color-surface)]">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--color-primary)] mb-4">
          Premium Collection
        </p>
        <h1 className="text-5xl md:text-7xl font-[var(--font-heading)] text-[var(--color-text)] mb-5 leading-tight">
          {merchant.store_name}
        </h1>
        <p className="text-lg md:text-xl italic text-[var(--color-text-muted)] mb-10 max-w-2xl mx-auto font-[var(--font-heading)]">
          {merchant.store_description || 'Curated pieces, crafted for you.'}
        </p>
        <button className="bg-[var(--color-primary)] text-white px-10 py-4 rounded-full font-semibold tracking-wide hover:opacity-90 transition-opacity shadow-xl hover:-translate-y-0.5 transform duration-300">
          Shop New Arrivals
        </button>
        <div className="flex flex-wrap justify-center gap-6 mt-10 text-xs font-semibold text-[var(--color-text-muted)]">
          <span>🔒 Secure Payments</span>
          <span>🚚 Fast Delivery</span>
          <span>💬 WhatsApp Support</span>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-[var(--font-heading)] text-[var(--color-text)]">Featured Pieces</h2>
          <div className="w-16 h-0.5 bg-[var(--color-primary)] mx-auto mt-3" />
        </div>

        {products.length === 0 ? (
          <p className="text-center text-[var(--color-text-muted)] py-16">New arrivals coming soon.</p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-8">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} isShowcaseMode={isShowcaseMode} />
            ))}
          </div>
        )}
      </main>

      <footer className="py-10 text-center bg-[var(--color-surface)] border-t border-[var(--color-text-muted)]/10">
        <p className="font-[var(--font-heading)] text-lg text-[var(--color-text)]">{merchant.store_name}</p>
        <p className="text-xs text-[var(--color-text-muted)] mt-2">Powered by OrizzonCart • OrizzonS Inc.</p>
      </footer>

      {merchant.whatsapp_number && (
        <WhatsAppButton phoneNumber={merchant.whatsapp_number} storeName={merchant.store_name} />
      )}
    </ThemeWrapper>
  );
}