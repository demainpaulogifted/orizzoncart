import Image from 'next/image';
import Link from 'next/link';
import { FlyerCover, flyerColorKey } from '@/components/storefront/FlyerCover';

export function ProductCard({ product, isShowcaseMode, onClick }: { product: any; isShowcaseMode: boolean; onClick?: () => void }) {
  const imageUrl = product.images?.[0]?.url;
  const identifier = product.slug || product.id;
  const href = identifier ? `/p/${identifier}` : '#';

  return (
    <Link href={href} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-white shadow-md group-hover:shadow-2xl transition-all duration-300">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, 33vw"
            quality={80}
            loading="lazy"
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : product.is_digital ? (
          <FlyerCover
            title={product.name}
            category={product.category || 'Digital'}
            colorKey={flyerColorKey(product.name)}
            className="absolute inset-0"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <span className="text-4xl opacity-40">🛍️</span>
          </div>
        )}

        {product.is_digital && (
          <span className="absolute top-2 left-2 bg-blue-600/90 text-white text-[9px] font-extrabold px-2 py-1 rounded-full">⚡ DIGITAL</span>
        )}
        {!product.is_digital && product.category && (
          <span className="absolute top-2 left-2 bg-white/90 text-gray-800 text-[9px] font-extrabold px-2 py-1 rounded-full uppercase">{product.category}</span>
        )}
      </div>

      <div className="mt-3 px-1 text-center">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 leading-snug line-clamp-2">{product.name}</h3>
        <p className="mt-1 text-lg font-extrabold text-purple-700">₦{Number(product.price).toLocaleString()}</p>
      </div>
    </Link>
  );
}