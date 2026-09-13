import Image from 'next/image';
import Link from 'next/link';
import { FlyerCover, flyerColorKey } from '@/components/storefront/FlyerCover';

export function ProductCard({ product, isShowcaseMode, onClick }: { product: any; isShowcaseMode: boolean; onClick: () => void }) {
  const imageUrl = product.images?.[0]?.url;

  return (
    <Link href={`/store/${product.store_slug || 'demo'}/p/${product.id}`} className="group block cursor-pointer">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[var(--color-surface)] shadow-md group-hover:shadow-2xl transition-shadow duration-300">
        {product.is_digital ? (
          <div className="absolute inset-0">
            <FlyerCover title={product.name} category="Digital Product" colorKey={flyerColorKey(product.name)} className="w-full h-full" />
          </div>
        ) : imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            quality={75}
            loading="lazy"
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <span className="text-4xl opacity-40">🛍️</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="px-4 py-1.5 rounded-full bg-white/95 text-gray-900 text-xs font-bold whitespace-nowrap shadow-lg">
            👁 View Product
          </span>
        </div>
      </div>
      <div className="mt-4 text-center px-2">
        <h3 className="text-lg font-medium text-[var(--color-text)] font-[var(--font-heading)] leading-snug">{product.name}</h3>
        <p className="mt-1 text-xl font-bold text-[var(--color-primary)]">₦{Number(product.price).toLocaleString()}</p>
      </div>
    </Link>
  );
}