import Link from 'next/link';
import Image from 'next/image';

export default function ProductCard({ product, storeSlug }: { product: any; storeSlug: string }) {
  const productIdentifier = product.slug || product.id;
  const href = `/p/${encodeURIComponent(productIdentifier)}`;
  const imageUrl = Array.isArray(product.images) && product.images.length > 0 
    ? product.images[0] 
    : '/placeholder-product.png';

  return (
    <Link href={href} className="group block">
      <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-100 border border-gray-200 group-hover:border-gray-300 transition-colors">
        <Image
          src={imageUrl}
          alt={product.name}
          width={500}
          height={500}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="mt-4 space-y-1">
        <h3 className="text-sm font-medium text-gray-900 group-hover:text-gray-700 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-sm font-bold text-gray-900">
          ₦{Number(product.price).toLocaleString()}
        </p>
      </div>
    </Link>
  );
}
