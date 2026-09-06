import Link from 'next/link';
import Image from 'next/image';

export function ProductCard({ product, isShowcaseMode }: { product: any; isShowcaseMode: boolean }) {
  const imageUrl = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800'; // Beautiful fallback image
  
  return (
    <Link href={`/store/${product.merchant_id}/products/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-gray-100 shadow-md group-hover:shadow-xl transition-shadow duration-300">
        <Image 
          src={imageUrl} 
          alt={product.name} 
          fill 
          className="object-cover group-hover:scale-110 transition-transform duration-500" 
        />
      </div>
      <div className="mt-4 text-center">
        <h3 className="text-lg font-medium text-gray-900 font-display">{product.name}</h3>
        <p className="mt-1 text-xl font-bold text-[#8b4513]">₦{product.price.toLocaleString()}</p>
        {isShowcaseMode && (
          <p className="mt-2 text-xs text-gray-500 italic">View details</p>
        )}
      </div>
    </Link>
  );
}