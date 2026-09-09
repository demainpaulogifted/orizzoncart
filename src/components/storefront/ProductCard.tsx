import Image from 'next/image';

export function ProductCard({ product, isShowcaseMode }: { product: any; isShowcaseMode: boolean }) {
  const imageUrl =
    product.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800';

  return (
    <div className="group block cursor-pointer">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[var(--color-surface)] shadow-md group-hover:shadow-2xl transition-shadow duration-300">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="px-4 py-1.5 rounded-full bg-white/95 text-[var(--color-text)] text-xs font-bold whitespace-nowrap shadow-lg">
            {isShowcaseMode ? 'Inquire to Buy' : 'Add to Cart'}
          </span>
        </div>
      </div>
      <div className="mt-4 text-center px-2">
        <h3 className="text-lg font-medium text-[var(--color-text)] font-[var(--font-heading)] leading-snug">
          {product.name}
        </h3>
        <p className="mt-1 text-xl font-bold text-[var(--color-primary)]">
          ₦{Number(product.price).toLocaleString()}
        </p>
      </div>
    </div>
  );
}