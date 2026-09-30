'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { FlyerCover, flyerColorKey } from '@/components/storefront/FlyerCover';
import ProductCard from '@/components/storefront/ProductCard';

interface ProductDetailClientProps {
  product: any;
  merchant: any;
  relatedProducts?: any[];
}

// ✅ SAFE: Extract a clean URL from any image shape (string, object, null)
function extractImageUrl(raw: any): string | null {
  if (!raw) return null;
  const url = typeof raw === 'string' ? raw : typeof raw === 'object' ? raw.url : null;
  return url && (url.startsWith('http') || url.startsWith('/')) ? url : null;
}

export default function ProductDetailClient({
  product,
  merchant,
  relatedProducts = [],
}: ProductDetailClientProps) {
  const [quantity, setQuantity] = useState(1);
  const [activeIndex, setActiveIndex] = useState(0);
  const storeSlug = merchant?.store_slug || '';

  // ✅ Build a clean array of image URLs from ANY shape (string, array, object array)
  const imageUrls: string[] = (() => {
    const raw = product.images;
    if (!raw) return [];
    if (typeof raw === 'string') return [raw];
    if (Array.isArray(raw)) {
      return raw
        .map((item: any) => extractImageUrl(item))
        .filter((u: string | null): u is string => !!u);
    }
    if (typeof raw === 'object') {
      const u = extractImageUrl(raw);
      return u ? [u] : [];
    }
    return [];
  })();

  const mainImage = imageUrls[activeIndex] || null;

  const addToCart = () => {
    const key = `orz_cart_${storeSlug}`;
    let cart: any[] = [];
    try {
      cart = JSON.parse(localStorage.getItem(key) || '[]');
    } catch (e) {
      // Ignore parse errors
    }

    const found = cart.find((c) => c.product_id === product.id);
    if (found) {
      found.quantity += quantity;
    } else {
      cart.push({ product_id: product.id, quantity });
    }

    localStorage.setItem(key, JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-updated'));
    toast.success('Added to cart ');
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface,#f8fafc)] text-[var(--color-text,#111827)]">
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Breadcrumb / Back */}
        <div className="mb-6">
          <Link
            href={`/`}
            className="inline-flex items-center text-sm text-gray-600 hover:text-purple-600 transition-colors"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to {merchant?.store_name || 'Store'}
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* ✅ IMAGE GALLERY */}
          <div className="space-y-3">
            {/* Main image */}
            <div className="relative aspect-square w-full bg-gray-100 rounded-2xl overflow-hidden shadow-sm">
              {mainImage ? (
                <Image
                  src={mainImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : product.is_digital ? (
                <FlyerCover
                  title={product.name}
                  category={product.category || 'Digital Product'}
                  colorKey={flyerColorKey(product.name)}
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-gray-100 to-gray-200">
                  🛍️
                </div>
              )}
              {product.is_digital && (
                <span className="absolute top-4 left-4 bg-blue-600/90 text-white text-xs font-extrabold px-3 py-1.5 rounded-full">
                   DIGITAL
                </span>
              )}
              {imageUrls.length > 1 && (
                <span className="absolute top-4 right-4 bg-black/60 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  {activeIndex + 1} / {imageUrls.length}
                </span>
              )}
            </div>

            {/* Thumbnails — only show when multiple images */}
            {imageUrls.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {imageUrls.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === activeIndex
                        ? 'border-purple-600 ring-2 ring-purple-200'
                        : 'border-gray-200 opacity-70 hover:opacity-100'
                    }`}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <Image
                      src={url}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="flex flex-col">
            {product.category && (
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2">
                {product.category}
              </span>
            )}
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
              {product.name}
            </h1>

            <div className="text-3xl font-black text-purple-700 mb-6">
              ₦{Number(product.price || 0).toLocaleString()}
            </div>

            <div className="prose prose-sm sm:prose-base text-gray-600 mb-8 leading-relaxed">
              {product.description || 'No description available for this product.'}
            </div>

            {/* Actions */}
            <div className="mt-auto space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 hover:bg-gray-100 transition-colors text-gray-600 font-bold"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="px-4 py-3 font-bold text-gray-900 min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-3 hover:bg-gray-100 transition-colors text-gray-600 font-bold"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={addToCart}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 px-6 rounded-xl text-base transition-all shadow-lg shadow-purple-600/20 active:scale-[0.98]"
                >
                  Add to Cart - ₦
                  {(Number(product.price || 0) * quantity).toLocaleString()}
                </button>
              </div>

              {product.is_digital && (
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 flex items-start gap-3">
                  <span className="text-xl"></span>
                  <div>
                    <p className="text-sm font-bold text-purple-900">
                      Instant Digital Download
                    </p>
                    <p className="text-xs text-purple-700 mt-1">
                      You will receive a download link immediately after payment.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-16 pt-10 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              You might also like
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map((relatedProduct: any) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={{ ...relatedProduct, store_slug: storeSlug }}
                  isShowcaseMode={false}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}