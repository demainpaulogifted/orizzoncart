import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { headers } from 'next/headers';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { ProductGallery } from '@/components/storefront/ProductGallery';
import { ShareButtons } from '@/components/storefront/ShareButtons';
import { getStoreUrl } from '@/lib/store-url';
import { redirectToSubdomain } from '@/lib/store-redirect';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { store_slug, product_id } = await params;
  const admin = createAdminClient();

  const { data: merchant } = await admin
    .from('merchants')
    .select('id, store_name')
    .eq('store_slug', store_slug)
    .maybeSingle();
  if (!merchant) return {};

  let { data: product } = await admin
    .from('products')
    .select('name, description, images, slug')
    .eq('merchant_id', merchant.id)
    .eq('slug', product_id)
    .maybeSingle();
  if (!product) {
    const { data } = await admin
      .from('products')
      .select('name, description, images, slug')
      .eq('merchant_id', merchant.id)
      .eq('id', product_id)
      .maybeSingle();
    product = data;
  }
  if (!product) return {};

  const identifier = product.slug || product_id;
  const title = `${product.name} | ${merchant.store_name}`;
  const description = product.description || `Buy ${product.name} online at ${merchant.store_name}.`;
  const image =
    product.images?.[0]?.url ||
    `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.orizzoncart.name.ng'}/icon-192.png`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: merchant.store_name,
      url: `https://${store_slug}.orizzoncart.name.ng/p/${identifier}`,
      images: product.images?.map((i: any) => i.url).filter(Boolean) || [image],
    },
    twitter: { card: 'summary_large_image', title, description },
    alternates: { canonical: `https://${store_slug}.orizzoncart.name.ng/p/${identifier}` },
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

export default async function ProductDetailPage({ params, searchParams }: any) {
  const { store_slug, product_id } = await params;

  // ENFORCE: subdomain only
  const host = (await headers()).get('host') || '';
  const qs = new URLSearchParams(await searchParams).toString();
  redirectToSubdomain(host, store_slug, `/p/${product_id}`, qs);

  const admin = createAdminClient();

  const { data: merchant } = await admin
    .from('merchants')
    .select('id, store_name, store_slug')
    .eq('store_slug', store_slug)
    .maybeSingle();
  if (!merchant) notFound();

  let { data: product } = await admin.from('products').select('*').eq('merchant_id', merchant.id).eq('slug', product_id).maybeSingle();
  if (!product) {
    const { data } = await admin.from('products').select('*').eq('merchant_id', merchant.id).eq('id', product_id).maybeSingle();
    product = data;
  }
  if (!product) notFound();

  const { data: related } = await admin
    .from('products')
    .select('id, name, price, images, slug, is_digital')
    .eq('merchant_id', merchant.id)
    .eq('is_active', true)
    .neq('id', product.id)
    .limit(4);

  let catalog: any = null;
  if (product.is_digital && product.catalog_id) {
    const { data: c } = await admin.from('digital_catalog').select('cover_color, category').eq('id', product.catalog_id).maybeSingle();
    catalog = c;
  }

  const images = (product.images || []).map((i: any) => (typeof i === 'string' ? i : i.url)).filter(Boolean);
  const paragraphs = (product.description || '').split(/\n+/).filter(Boolean);
  const identifier = product.slug || product.id;
  const productUrl = `https://${store_slug}.orizzoncart.name.ng/p/${identifier}`;

  // Product structured data for Google
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: paragraphs[0] || product.description || '',
    image: images.length > 0 ? images : undefined,
    offers: {
      '@type': 'Offer',
      price: Number(product.price),
      priceCurrency: 'NGN',
      availability: 'https://schema.org/InStock',
      url: productUrl,
      seller: {
        '@type': 'Store',
        name: merchant.store_name,
      },
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <div className="min-h-screen bg-gray-50 pb-28 md:pb-12">
        {/* TOP STORE BAR */}
        <div className="bg-white border-b sticky top-0 z-40">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 min-w-0">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 text-white flex items-center justify-center font-extrabold text-sm shrink-0">
                {merchant.store_name?.[0]?.toUpperCase() || 'S'}
              </span>
              <span className="font-extrabold text-sm text-gray-900 truncate">← {merchant.store_name}</span>
            </Link>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-6">
          <nav className="text-xs text-gray-500 mb-4 flex gap-1 items-center">
            <Link href="/" className="hover:text-purple-600 font-bold">{merchant.store_name}</Link>
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
                <span className="inline-block bg-blue-100 text-blue-700 text-xs font-extrabold px-3 py-1 rounded-full">⚡ INSTANT DIGITAL DELIVERY</span>
              )}
              {!product.is_digital && product.category && (
                <span className="inline-block bg-purple-100 text-purple-700 text-xs font-extrabold px-3 py-1 rounded-full uppercase">{product.category}</span>
              )}

              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">{product.name}</h1>
              <p className="text-3xl font-black text-purple-700">₦{Number(product.price).toLocaleString()}</p>

              {paragraphs[0] && <p className="text-gray-600 leading-relaxed text-sm">{paragraphs[0]}</p>}

              <div className="pt-2">
                <ShareButtons url={productUrl} title={product.name} />
              </div>

              <div className="space-y-2 pt-2">
                <TrustRow icon="🔒" text="Secure checkout — card, transfer, USSD" />
                <TrustRow icon={product.is_digital ? '⚡' : '🚚'} text={product.is_digital ? 'Download delivered instantly after payment' : 'Fast delivery nationwide'} />
                <TrustRow icon="💬" text="WhatsApp support from the seller" />
              </div>

              <Link
                href={`/?add=${product.id}`}
                className="hidden md:block w-full bg-purple-600 text-white text-center py-4 rounded-xl font-extrabold hover:bg-purple-700 shadow-lg shadow-purple-200 transition-colors"
              >
                Add to Cart 🛒
              </Link>
            </div>
          </div>

          {/* MORE FROM THIS STORE */}
          {related && related.length > 0 && (
            <div className="mt-10">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-extrabold text-gray-900">More from {merchant.store_name}</h2>
                <Link href="/" className="text-xs font-bold text-purple-600 hover:underline">View all →</Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {related.map((r: any) => (
                  <Link key={r.id} href={`/p/${r.slug || r.id}`} className="bg-white rounded-xl border overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative aspect-square bg-gray-100">
                      {r.images?.[0]?.url ? (
                        <Image src={r.images[0].url} alt={r.name} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">🛍️</div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-bold text-gray-900 truncate">{r.name}</p>
                      <p className="text-sm font-extrabold text-purple-700">₦{Number(r.price).toLocaleString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-10 bg-white rounded-2xl border p-6 space-y-4">
            <h2 className="text-lg font-extrabold text-gray-900">Description</h2>
            {paragraphs.length === 0 && <p className="text-sm text-gray-500">No description provided.</p>}
            {paragraphs.slice(1).map((p: string, i: number) => (
              <p key={i} className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">{p}</p>
            ))}

            {images.length > 1 && (
              <>
                <h3 className="text-sm font-extrabold text-gray-900 pt-2">More views</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {images.slice(1).map((u: string, i: number) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border">
                      <Image src={u} alt={`${product.name} view ${i + 2}`} fill sizes="(max-width: 640px) 50vw, 33vw" loading="lazy" className="object-cover" />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="mt-8 bg-white rounded-2xl border p-5 text-center space-y-2">
            <Link href="/" className="block w-full bg-purple-600 text-white py-3.5 rounded-xl font-extrabold hover:bg-purple-700">
              🛍️ Visit {merchant.store_name} Store
            </Link>
            <p className="text-[11px] text-gray-400">
              Powered by <Link href="https://www.orizzoncart.name.ng" className="font-bold text-purple-600 hover:underline">OrizzonCart</Link>
            </p>
          </div>
        </div>

        <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur border-t p-3 z-40 md:hidden">
          <Link href={`/?add=${product.id}`} className="block w-full bg-purple-600 text-white text-center py-3.5 rounded-xl font-extrabold">
            Add to Cart — ₦{Number(product.price).toLocaleString()}
          </Link>
        </div>
      </div>
    </>
  );
}