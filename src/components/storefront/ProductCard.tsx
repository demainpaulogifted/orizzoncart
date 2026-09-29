import Link from 'next/link';
import Image from 'next/image';

export default function ProductCard({
  product,
  isShowcaseMode,
}: {
  product: any;
  isShowcaseMode?: boolean;
}) {
  const storeSlug = product.store_slug || '';
  const productIdentifier = product.slug || product.id;
  const href = `/store/\( {storeSlug}/p/ \){encodeURIComponent(productIdentifier)}`;

  const imageUrl =
    Array.isArray(product.images) && product.images.length > 0
      ? typeof product.images[0] === 'string'
        ? product.images[0]
        : product.images[0]?.url || '/placeholder-product.png'
      : '/placeholder-product.png';

  return (
    <Link href={href} className="group block">
      <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-100 border border-gray-200 group-hover:border-gray-300 transition-colors">
        <Image
          src={imageUrl}
          alt={product.name || 'Product'}
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
          ₦{Number(product.price || 0).toLocaleString()}
        </p>
      </div>
    </Link>
  );
}