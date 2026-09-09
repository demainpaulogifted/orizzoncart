'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import { useCart } from './CartContext';

export function ProductModal({ product, merchant, isShowcaseMode, onClose }: { product: any; merchant: any; isShowcaseMode: boolean; onClose: () => void }) {
  const { add } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [showDetails, setShowDetails] = useState(false);
  const imageUrl = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800';

  const handleAdd = () => {
    add(product.id, qty);
    toast.success(`${product.name} added to cart!`);
    onClose();
  };

  const handleBuyNow = () => {
    add(product.id, qty);
    onClose();
    router.push(`/checkout/${merchant.store_slug}`);
  };

  const waLink = `https://wa.me/${(merchant.whatsapp_number || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${merchant.store_name}! I'm interested in: ${product.name} (₦${Number(product.price).toLocaleString()})`)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="relative aspect-square sm:aspect-[4/3] bg-gray-100">
          <Image src={imageUrl} alt={product.name} fill className="object-cover" />
          <button onClick={onClose} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 text-gray-800 font-bold shadow-lg">✕</button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <h2 className="text-2xl font-[var(--font-heading)] font-bold text-gray-900">{product.name}</h2>
            <p className="text-2xl font-extrabold text-[var(--color-primary)] mt-1">₦{Number(product.price).toLocaleString()}</p>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed">
            {showDetails ? product.description || 'No additional description provided.' : (product.description || 'A premium piece from our collection.').slice(0, 90)}
            {(product.description || '').length > 90 && (
              <button onClick={() => setShowDetails(!showDetails)} className="ml-1 text-purple-600 font-bold text-xs">
                {showDetails ? 'Show less' : 'View more details'}
              </button>
            )}
          </p>

          {showDetails && (
            <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-600 space-y-1">
              <p>🚚 Delivery: 2–5 working days nationwide</p>
              <p>🔒 Secure payment via Paystack</p>
              <p>↩️ Returns accepted within 7 days</p>
            </div>
          )}

          {!isShowcaseMode && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-gray-600">Qty</span>
              <div className="flex items-center border border-gray-300 rounded-full">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-1.5 font-bold text-gray-600">−</button>
                <span className="px-3 font-bold">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="px-3 py-1.5 font-bold text-gray-600">+</button>
              </div>
              <span className="ml-auto text-sm font-bold text-gray-700">= ₦{(Number(product.price) * qty).toLocaleString()}</span>
            </div>
          )}

          {isShowcaseMode ? (
            <a href={waLink} target="_blank" rel="noopener" className="block w-full text-center bg-green-500 text-white py-3.5 rounded-full font-bold hover:bg-green-600">
              💬 Inquire on WhatsApp
            </a>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button onClick={handleAdd} className="py-3.5 rounded-full border-2 border-gray-900 font-bold text-gray-900 hover:bg-gray-50">
                Add to Cart
              </button>
              <button onClick={handleBuyNow} className="py-3.5 rounded-full bg-[var(--color-primary)] text-white font-bold hover:opacity-90">
                Buy Now →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}