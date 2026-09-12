import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

const GRADIENTS: Record<string, string> = {
  green: 'from-green-500 to-emerald-700',
  blue: 'from-blue-500 to-indigo-700',
  purple: 'from-purple-500 to-violet-700',
  pink: 'from-pink-500 to-rose-700',
  orange: 'from-orange-500 to-red-700',
  yellow: 'from-amber-400 to-orange-600',
  teal: 'from-teal-500 to-cyan-700',
  red: 'from-red-500 to-rose-700',
  indigo: 'from-indigo-500 to-purple-700',
  gray: 'from-slate-500 to-slate-700',
};

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { store_slug, product_id } = await params;
  const admin = createAdminClient();
  const { data: product } = await admin.from('products').select('name, description, images').eq('id', product_id).maybeSingle();
  if (!product) return {};
  const title = `${product.name} | ${store_slug} on OrizzonCart`;
  const description = product.description || `Buy ${product.name} online. Secure payment & instant delivery.`;
  const image = product.images?.[0]?.url || `${process.env.NEXT_PUBLIC_APP_URL || 'https://orizzoncart.name.ng'}/icon-512.png`;
  return { title, description, openGraph: { title, description, images: [image] }, twitter: { card: 'summary_large_image', title, description } };
}

export default async function ProductPage({ params }: any) {
  const { store_slug, product_id } = await params;
  const admin = createAdminClient();

  const { data: merchant } = await admin.from('merchants').select('id, store_name, store_slug').eq('store_slug', store_slug).maybeSingle();
  if (!merchant) notFound();

  const { data: product } = await admin.from('products').select('*').eq('id', product_id).eq('merchant_id', merchant.id).maybeSingle();
  if (!product) notFound();

  let catalog: any = null;
  if (product.catalog_id) {
    const { data: c } = await admin.from('digital_catalog').select('cover_color, category').eq('id', product.catalog_id).maybeSingle();
    catalog = c;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden grid md:grid-cols-2">
        <div className="flex items-center justify-center p-10 min-h-[300px] bg-gradient-to-br from-purple-100 to-blue-100">
          {product.images?.[0]?.url ? (
            <Image src={product.images[0].url} alt={product.name} width={500} height={500} className="rounded-2xl object-cover" />
          ) : product.is_digital ? (
            <div className={`w-full h-64 rounded-2xl bg-gradient-to-br ${GRADIENTS[catalog?.cover_color] || GRADIENTS.purple} p-6 flex flex-col justify-between relative overflow-hidden shadow-lg`}>
              <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-white/10" />
              <span className="self-start bg-black/25 text-white text-[9px] font-extrabold uppercase tracking-wider px-2 py-1 rounded">{catalog?.category || 'Digital'}</span>
              <p className="text-white font-extrabold text-xl leading-tight uppercase relative">{product.name}</p>
              <p className="text-white/70 text-[9px] font-bold tracking-widest relative">ORIZZONCART DIGITAL</p>
            </div>
          ) : (
            <span className="text-8xl">🛍️</span>
          )}
        </div>
        <div className="p-8 space-y-4">
          <p className="text-xs font-bold text-purple-600 uppercase">{merchant.store_name}</p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">{product.name}</h1>
          <p className="text-3xl font-extrabold text-purple-600">₦{Number(product.price).toLocaleString()}</p>
          {product.is_digital && (
            <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">⚡ Digital • Instant Delivery</span>
          )}
          <p className="text-gray-600 leading-relaxed">{product.description}</p>
          <a href={`/store/${store_slug}`} className="block text-center bg-purple-600 text-white py-3.5 rounded-xl font-bold hover:bg-purple-700">
            Buy from {merchant.store_name}
          </a>
        </div>
      </div>
    </div>
  );
}