'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { FlyerCover, flyerColorKey } from '@/components/storefront/FlyerCover';
import ProductCard from '@/components/storefront/ProductCard';
import ConfirmWithSeller from '@/components/storefront/ConfirmWithSeller';
import { addSharedCartItem } from '@/lib/marketplace-cart-client';

interface ProductDetailClientProps {
  product: any;
  merchant: any;
  relatedProducts?: any[];
}

function extractImageUrl(raw: any): string | null {
  if (!raw) return null;

  const url =
    typeof raw === 'string'
      ? raw
      : typeof raw === 'object'
        ? raw.url
        : null;

  return url && (url.startsWith('http') || url.startsWith('/'))
    ? url
    : null;
}

export default function ProductDetailClient({
  product,
  merchant,
  relatedProducts = [],
}: ProductDetailClientProps) {
  const [quantity, setQuantity] = useState(1);
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [selectedTab, setSelectedTab] = useState<
    'description' | 'reviews' | 'shipping'
  >('description');

  const storeSlug = merchant?.store_slug || '';

  const imageUrls: string[] = (() => {
    const raw = product.images;

    if (!raw) return [];
    if (typeof raw === 'string') return [raw];

    if (Array.isArray(raw)) {
      return raw
        .map((item: any) => extractImageUrl(item))
        .filter((url: string | null): url is string => !!url);
    }

    if (typeof raw === 'object') {
      const url = extractImageUrl(raw);
      return url ? [url] : [];
    }

    return [];
  })();

  const mainImage = imageUrls[activeIndex] || null;

  const isTrackable = product.track_inventory !== false;
  const currentStock = isTrackable ? Number(product.stock || 0) : 999999;
  const isOutOfStock =
    isTrackable && currentStock <= 0 && !product.allow_backorders;
  const isLowStock = isTrackable && currentStock > 0 && currentStock <= 5;

  const addToCart = async () => {
    if (isAddingToCart) return;

    if (isOutOfStock) {
      toast.error('This product is out of stock');
      return;
    }

    if (!storeSlug || !product?.id) {
      toast.error('Could not identify this store or product.');
      return;
    }

    if (isTrackable && !product.allow_backorders && quantity > currentStock) {
      toast.error(`Only ${currentStock} item(s) available.`);
      return;
    }

    setIsAddingToCart(true);

    try {
      await addSharedCartItem(storeSlug, String(product.id), quantity);
      toast.success('Added to your OrizzonCart! 🛒');
    } catch (error) {
      console.error('Add to shared cart failed:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Could not add this product. Please try again.'
      );
    } finally {
      setIsAddingToCart(false);
    }
  };

  const shareProduct = (platform: string) => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const text = `Check out ${product.name} at ${merchant?.store_name || 'this store'}`;

    const shareUrls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    };

    if (platform === 'copy') {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard
          .writeText(url)
          .then(() => toast.success('Link copied to clipboard!'))
          .catch(() => toast.error('Could not copy the link.'));
      } else {
        toast.error('Copying is not supported by this browser.');
      }
    } else if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'noopener,noreferrer');
    }

    setShowShareMenu(false);
  };

  const totalPrice = (
    Number(product.price || 0) * quantity
  ).toLocaleString('en-NG');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
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

            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Share product"
                aria-expanded={showShareMenu}
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
              </button>

              {showShareMenu && (
                <div className="absolute top-12 right-0 bg-white rounded-xl shadow-lg border p-2 z-50 min-w-40">
                  <button
                    onClick={() => shareProduct('whatsapp')}
                    className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg text-sm"
                  >
                    WhatsApp
                  </button>
                  <button
                    onClick={() => shareProduct('facebook')}
                    className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg text-sm"
                  >
                    Facebook
                  </button>
                  <button
                    onClick={() => shareProduct('twitter')}
                    className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg text-sm"
                  >
                    X / Twitter
                  </button>
                  <button
                    onClick={() => shareProduct('copy')}
                    className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg text-sm"
                  >
                    Copy Link
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-4">
            <div className="relative aspect-square bg-white rounded-2xl overflow-hidden shadow-lg border">
              {!imageLoaded && mainImage && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
                </div>
              )}

              {mainImage ? (
                <Image
                  src={mainImage}
                  alt={product.name}
                  fill
                  className={`object-cover transition-opacity duration-300 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageLoaded(true)}
                />
              ) : product.is_digital ? (
                <FlyerCover
                  title={product.name}
                  category={product.category || 'Digital'}
                  colorKey={flyerColorKey(product.name)}
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-gray-100 to-gray-200">
                  🛍️
                </div>
              )}

              {imageUrls.length > 1 && (
                <span className="absolute top-4 right-4 bg-black/70 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  {activeIndex + 1} / {imageUrls.length}
                </span>
              )}

              {product.is_digital && (
                <span className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  Digital Download
                </span>
              )}
            </div>

            {imageUrls.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {imageUrls.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveIndex(idx);
                      setImageLoaded(false);
                    }}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      idx === activeIndex
                        ? 'border-purple-600 ring-2 ring-purple-200'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                    aria-label={`Show image ${idx + 1}`}
                  >
                    <Image
                      src={url}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              {product.category && (
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full uppercase tracking-wide mb-3">
                  {product.category}
                </span>
              )}

              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="text-4xl font-black text-purple-700">
                  ₦{Number(product.price || 0).toLocaleString('en-NG')}
                </div>

                {isOutOfStock ? (
                  <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-bold rounded-full">
                    Out of Stock
                  </span>
                ) : isLowStock ? (
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-bold rounded-full">
                    Only {currentStock} left!
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-bold rounded-full">
                    In Stock
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                <span>Ships from {merchant?.store_name || 'this store'}</span>
              </div>
            </div>

            {isLowStock && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="font-bold text-amber-900">
                    Hurry! Only {currentStock} left in stock
                  </p>
                  <p className="text-sm text-amber-700">
                    Order now before it sells out
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4 pt-6 border-t">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantity
                </label>

                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-3 hover:bg-gray-100 transition-colors font-bold text-gray-600"
                      disabled={isOutOfStock || isAddingToCart}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>

                    <span className="px-6 py-3 font-bold text-gray-900 min-w-[4rem] text-center bg-gray-50">
                      {quantity}
                    </span>

                    <button
                      onClick={() =>
                        setQuantity((current) =>
                          isTrackable && !product.allow_backorders
                            ? Math.min(currentStock || 1, current + 1)
                            : current + 1
                        )
                      }
                      className="px-4 py-3 hover:bg-gray-100 transition-colors font-bold text-gray-600"
                      disabled={
                        isOutOfStock ||
                        isAddingToCart ||
                        (isTrackable &&
                          !product.allow_backorders &&
                          quantity >= currentStock)
                      }
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={addToCart}
                    disabled={isOutOfStock || isAddingToCart}
                    className={`flex-1 font-bold py-3.5 px-4 sm:px-8 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${
                      isOutOfStock || isAddingToCart
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20'
                    }`}
                  >
                    {isAddingToCart ? (
                      'Adding...'
                    ) : isOutOfStock ? (
                      'Out of Stock'
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                          />
                        </svg>
                        Add to Cart - ₦{totalPrice}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <ConfirmWithSeller product={product} merchant={merchant} />

            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center p-3 bg-white rounded-xl border">
                <div className="text-2xl mb-1">🔒</div>
                <div className="text-xs font-bold text-gray-700">
                  Secure Payment
                </div>
              </div>

              <div className="text-center p-3 bg-white rounded-xl border">
                <div className="text-2xl mb-1">🚚</div>
                <div className="text-xs font-bold text-gray-700">
                  Fast Delivery
                </div>
              </div>

              <div className="text-center p-3 bg-white rounded-xl border">
                <div className="text-2xl mb-1">💬</div>
                <div className="text-xs font-bold text-gray-700">
                  24/7 Support
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <div className="border-b border-gray-200">
            <div className="flex gap-8">
              {(['description', 'reviews', 'shipping'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`pb-4 px-2 font-semibold capitalize transition-colors relative ${
                    selectedTab === tab
                      ? 'text-purple-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                  {selectedTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
                  )}
                  {tab === 'reviews' && (
                    <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                      ({product.reviewCount || 0})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="py-8">
            {selectedTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed text-lg">
                  {product.description || 'No description available.'}
                </p>
              </div>
            )}

            {selectedTab === 'reviews' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="text-gray-500 italic">Reviews loading...</div>
              </div>
            )}

            {selectedTab === 'shipping' && (
              <div className="space-y-4 text-gray-700">
                <div className="flex items-start gap-3">
                  <span className="text-xl">🚚</span>
                  <div>
                    <h3 className="font-bold text-gray-900">
                      Shipping Information
                    </h3>
                    <p className="text-sm mt-1">
                      Ships within 1-2 business days. Delivery time varies by
                      location.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-xl">↩️</span>
                  <div>
                    <h3 className="font-bold text-gray-900">
                      Returns & Exchanges
                    </h3>
                    <p className="text-sm mt-1">
                      30-day return policy. Items must be in original condition.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-12 border-t">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              You Might Also Like
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
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

      <footer className="border-t bg-white mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-600">
          <p>
            © {new Date().getFullYear()} {merchant?.store_name || 'Store'}. All
            rights reserved.
          </p>
          <p className="mt-1 text-xs text-gray-400">Powered by OrizzonCart</p>
        </div>
      </footer>
    </div>
  );
}