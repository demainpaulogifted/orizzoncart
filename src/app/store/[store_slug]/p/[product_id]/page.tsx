import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { ProductGallery } from '@/components/storefront/ProductGallery';
import { ShareButtons } from '@/components/storefront/ShareButtons';
import { getStoreUrl } from '@/lib/store-url';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { store_slug, product_id } = await params;
  const admin = createAdminClient();
  const { data: product } = await admin
    .from('products')
    .select('name, description, images')
    .eq('id', product_id)
    .maybeSingle();

  if (!product) return {};

  const title = `${product.name} | ${store_slug}`;
  const description = product.description || `Buy ${product.name} online.`;
  const image =
    product.images?.[0]?.url ||
    `${process.env.NEXT_PUBLIC_APP_URL || 'https://orizzoncart.name.ng'}/icon-512.png`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: product.images?.map((i: any) => i.url).filter(Boolean) || [image],
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

function TrustRow({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
      <span className="text-lg">{icon}</span>
      <p className="text-xs font-bold text-gray-700">{text}</p>
    </div>
  );
}

export default async function ProductDetailPage({ params }: any) {
  const { store_slug, product_id } = await params;
  const admin = createAdminClient();

  const { data: merchant } = await admin
    .from('merchants')
    .select('id, store_name, store_slug')
    .eq('store_slug', store_slug)
    .maybeSingle();

  if (!merchant) notFound();

  const { data: product } = await admin
    .from('products')
    .select('*')
    .eq('id', product_id)
    .eq('merchant_id', merchant.id)
    .maybeSingle();

  if (!product) notFound();

  let catalog: any = null;
  if (product.is_digital && product.catalog_id) {
    const { data: c } = await admin
      .from('digital_catalog')
      .select('cover_color, category')
      .eq('id', product.catalog_id)
      .maybeSingle();
    catalog = c;
  }

  const images = (product.images || [])
    .map((i: any) => (typeof i === 'string' ? i : i.url))
    .filter(Boolean);

  const paragraphs = (product.description || '').split(/\n+/).filter(Boolean);
  const productUrl = `\( {getStoreUrl(store_slug)}/p/ \){product.id}`;

  return (
    <div className="min-h-screen bg-gray-50 pb-28 md:pb-12">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 mb-4 flex gap-1 items-center">
          <Link href={`/store/${store_slug}`} className="hover:text-purple-600 font-bold">
            {merchant.store_name}
          </Link>
          <span>/</span>
          <span className="truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-8">
          <ProductGallery
            images={product.images}
            name={product.name}
            isDigital={product.is_digital}
            category={catalog?.category || product.category}
            coverColor={catalog?.cover_color}
          />

          <div className="space-y-4">
            {product.is_digital && (
              <span className="inline-block bg-blue-100 text-blue-700 text-xs font-extrabold px-3 py-1 rounded-full">
                ⚡ INSTANT DIGITAL DELIVERY
              </span>
            )}
            {!product.is_digital && product.category && (
              <span className="inline-block bg-purple-100 text-purple-700 text-xs font-extrabold px-3 py-1 rounded-full uppercase">
                {product.category}
              </span>
            )}

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
              {product.name}
            </h1>
            <p className="text-3xl font-black text-purple-700">
              ₦{Number(product.price).toLocaleString()}
            </p>

            {paragraphs[0] && (
              <p className="text-gray-600 leading-relaxed text-sm">{paragraphs[0]}</p>
            )}

            {/* SHARE BUTTONS – Shopify style */}
            <div className="pt-2">
              <ShareButtons url={productUrl} title={product.name} />
            </div>

            <div className="space-y-2 pt-2">
              <TrustRow icon="🔒" text="Secure checkout — card, transfer, USSD" />
              <TrustRow
                icon={product.is_digital ? '⚡' : '🚚'}
                text={
                  product.is_digital
                    ? 'Download delivered instantly after payment'
                    : 'Fast delivery nationwide'
                }
              />
              <TrustRow icon="💬" text="WhatsApp support from the seller" />
            </div>

            <Link
              href={`/store/\( {store_slug}?add= \){product.id}`}
              className="hidden md:block w-full bg-purple-600 text-white text-center py-4 rounded-xl font-extrabold hover:bg-purple-700 shadow-lg shadow-purple-200 transition-colors"
            >
              Add to Cart 🛒
            </Link>
          </div>
        </div>

        {/* Description */}
        <div className="mt-10 bg-white rounded-2xl border p-6 space-y-4">
          <h2 className="text-lg font-extrabold text-gray-900">Description</h2>
          {paragraphs.length === 0 && (
            <p className="text-sm text-gray-500">No description provided.</p>
          )}
          {paragraphs.slice(1).map((p: string, i: number) => (
            <p key={i} className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">
              {p}
            </p>
          ))}

          {images.length > 1 && (
            <>
              <h3 className="text-sm font-extrabold text-gray-900 pt-2">More views</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.slice(1).map((u: string, i: number) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border">
                    <Image
                      src={u}
                      alt={`${product.name} view ${i + 2}`}
                      fill
                      sizes="(max-width: 640px) 50vw, 33vw"
                      loading="lazy"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur border-t p-3 z-40 md:hidden">
        <Link
          href={`/store/\( {store_slug}?add= \){product.id}`}
          className="block w-full bg-purple-600 text-white text-center py-3.5 rounded-xl font-extrabold"
        >
          Add to Cart — ₦{Number(product.price).toLocaleString()}
        </Link>
      </div>
    </div>
  );
}