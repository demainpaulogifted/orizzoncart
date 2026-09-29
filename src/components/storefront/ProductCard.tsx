import Link from 'next/link';
import Image from 'next/image';

export default function ProductCard({ 
  product, 
  storeSlug, 
  isShowcaseMode = false 
}: { 
  product: any; 
  storeSlug?: string; 
  isShowcaseMode?: boolean; 
}) {
  const productIdentifier = product.slug || product.id;
  const href = `/p/${encodeURIComponent(productIdentifier)}`;
  const imageUrl = Array.isArray(product.images) && product.images.length > 0 
    ? product.images[0] 
    : '/placeholder-product.png';

  const content = (
    <>
      <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-100 border border-gray-200 transition-colors">
        <Image
          src={imageUrl}
          alt={product.name}
          width={500}
          height={500}
          className="h-full w-full object-cover object-center"
        />
      </div>
      <div className="mt-4 space-y-1">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-sm font-bold text-gray-900">
          ₦{Number(product.price).toLocaleString()}
        </p>
      </div>
    </>
  );

  if (isShowcaseMode) {
    return <div className="block opacity-75 cursor-default">{content}</div>;
  }

  return (
    <Link href={href} className="group block hover:opacity-90 transition-opacity">
      {content}
    </Link>
  );
}