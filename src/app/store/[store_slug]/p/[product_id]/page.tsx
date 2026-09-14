import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { FlyerCover, flyerColorKey } from '@/components/storefront/FlyerCover';

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { store_slug, product_id } = await params;
  const admin = createAdminClient();
  const { data: product } = await admin.from('products').select('name, description, images').eq('id', product_id).maybeSingle();

  if (!product) return {};

  const title = `${product.name} | ${store_slug}`;
  const description = product.description || `Buy ${product.name} online.`;
  const image = product.images?.[0]?.url || `${process.env.NEXT_PUBLIC_APP_URL}/icon-512.png`;

  return {
    title,
    description,
    openGraph: { title, description, images: [image] },
    twitter: { card: 'summary_large_image', title, description },
  };
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

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="relative aspect-[4/5] w-full max-w-4xl mx-auto bg-white overflow-hidden">
        {product.is_digital ? (
          <FlyerCover
            title={product.name}
            category={catalog?.category || 'Digital'}
            colorKey={catalog?.cover_color || flyerColorKey(product.name)}
            className="w-full h-full"
          />
        ) : product.images?.[0]?.url ? (
          <Image src={product.images[0].url} alt={product.name} fill className="object-cover" priority />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-6xl">🛍️</div>
        )}

        <Link
          href={`/store/${store_slug}`}
          className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg text-gray-900 font-bold hover:bg-white transition-colors"
        >
          ←
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-5 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">{product.name}</h1>
          <p className="mt-3 text-3xl sm:text-4xl font-black text-purple-700">₦{Number(product.price).toLocaleString()}</p>
        </div>

        {product.is_digital && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
            <span className="text-2xl mt-0.5">⚡</span>
            <div>
              <p className="font-bold text-blue-900 text-sm">Instant Digital Delivery</p>
              <p className="text-xs text-blue-700 mt-0.5">You will receive access immediately after payment.</p>
            </div>
          </div>
        )}

        <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
          <p>{product.description || 'No description provided.'}</p>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex gap-3 items-center z-50">
        <Link
          href={`/store/${store_slug}?add=${product.id}`}
          className="flex-1 bg-purple-600 text-white font-bold py-3.5 rounded-xl text-center hover:bg-purple-700 transition-colors shadow-lg"
        >
          Add to Cart
        </Link>
      </div>
    </div>
  );
}