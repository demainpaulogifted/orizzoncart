import Link from 'next/link';
import Image from 'next/image';

export default function ProductCard({
  product,
  storeSlug,
  isShowcaseMode = false,
}: {
  product: any;
  storeSlug?: string;
  isShowcaseMode?: boolean;
}) {
  const productIdentifier = product.slug || product.id;
  const href = `/p/${encodeURIComponent(productIdentifier)}`;

  const first = Array.isArray(product.images) ? product.images[0] : product.images;
  const rawUrl =
    typeof first === 'string' ? first : first && typeof first === 'object' ? (first as any).url : null;
  const imageUrl = rawUrl && (rawUrl.startsWith('http') || rawUrl.startsWith('/')) ? rawUrl : null;

  const content = (
    <>
      <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-100 border border-gray-200 transition-colors relative">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            width={500}
            height={500}
            className="h-full w-full object-cover object-center"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-gray-100 to-gray-200">
            🛍️
          </div>
        )}
        {isShowcaseMode && (
          <span className="absolute top-2 left-2 bg-yellow-100 border border-yellow-300 text-yellow-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
            👀 View only
          </span>
        )}
      </div>
      <div className="mt-4 space-y-1">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{product.name}</h3>
        <p className="text-sm font-bold text-gray-900">
          ₦{Number(product.price || 0).toLocaleString()}
        </p>
      </div>
    </>
  );

  return (
    <Link href={href} className="group block hover:opacity-90 transition-opacity">
      {content}
    </Link>
  );
}