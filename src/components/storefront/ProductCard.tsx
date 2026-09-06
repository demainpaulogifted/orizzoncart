import Link from 'next/link';
import Image from 'next/image';

export function ProductCard({ product, isShowcaseMode }: { product: any; isShowcaseMode: boolean }) {
  const imageUrl = product.images?.[0]?.url || '/placeholder.jpg';
  return (
    <Link href={`/store/${product.merchant_id}/products/${product.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
        <Image src={imageUrl} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
      </div>
      <div className="mt-3">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{product.name}</h3>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-base font-bold text-gray-900">₦{product.price.toLocaleString()}</span>
        </div>
        {isShowcaseMode && <div className="mt-2 text-xs text-gray-500">View details</div>}
      </div>
    </Link>
  );
}