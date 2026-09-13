'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { FlyerCover, flyerColorKey } from '@/components/storefront/FlyerCover';
import Link from 'next/link';

interface ProductModalProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
  storeSlug: string;
}

export function ProductModal({ product, isOpen, onClose, storeSlug }: ProductModalProps) {
  if (!isOpen || !product) return null;

  // Prevent background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 z-10 w-8 h-8 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-colors">
          ✕
        </button>

        {/* Image / Flyer Area */}
        <div className="relative aspect-square w-full bg-gray-100">
          {product.is_digital ? (
            <FlyerCover 
              title={product.name} 
              category="Digital Product" 
              colorKey={flyerColorKey(product.name)} 
              className="w-full h-full" 
            />
          ) : product.images?.[0]?.url ? (
            <Image src={product.images[0].url} alt={product.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">🛍️</div>
          )}
        </div>

        {/* Details */}
        <div className="p-6 space-y-4">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 leading-snug">{product.name}</h2>
            <p className="mt-2 text-2xl font-black text-purple-700">₦{Number(product.price).toLocaleString()}</p>
          </div>

          {product.is_digital && (
            <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <p className="text-xs font-bold text-purple-800">Instant Digital Download</p>
            </div>
          )}

          <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">
            {product.description || 'No description available.'}
          </p>

          {/* Actions */}
          <div className="pt-2 flex gap-3">
            <Link 
              href={`/store/${storeSlug}/p/${product.id}`}
              className="flex-1 bg-gray-900 text-white font-bold py-3 rounded-xl text-center text-sm hover:bg-gray-800"
              onClick={onClose}
            >
              View Full Page
            </Link>
            <Link 
              href={`/store/${storeSlug}?add=${product.id}`}
              className="flex-1 bg-purple-600 text-white font-bold py-3 rounded-xl text-center text-sm hover:bg-purple-700"
              onClick={onClose}
            >
              Add to Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}