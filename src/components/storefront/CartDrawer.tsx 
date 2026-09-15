'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FlyerCover, flyerColorKey } from '@/components/storefront/FlyerCover';

export function CartDrawer({ slug, open, onClose }: { slug: string; open: boolean; onClose: () => void }) {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/products?slug=${slug}`)
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .catch(() => {});
  }, [slug]);

  useEffect(() => {
    const sync = () => {
      try { setCart(JSON.parse(localStorage.getItem(`orz_cart_${slug}`) || '[]')); } catch { setCart([]); }
    };
    sync();
    window.addEventListener('cart-updated', sync);
    return () => window.removeEventListener('cart-updated', sync);
  }, [slug, open]);

  const update = (id: string, qty: number) => {
    let next: any[] = [];
    try { next = JSON.parse(localStorage.getItem(`orz_cart_${slug}`) || '[]'); } catch {}
    if (qty <= 0) next = next.filter((c: any) => c.product_id !== id);
    else next = next.map((c: any) => (c.product_id === id ? { ...c, quantity: qty } : c));
    localStorage.setItem(`orz_cart_${slug}`, JSON.stringify(next));
    setCart(next);
    window.dispatchEvent(new Event('cart-updated'));
  };

  const lines = cart
    .map((c: any) => ({ ...c, product: products.find((p: any) => p.id === c.product_id) }))
    .filter((l: any) => l.product);
  const subtotal = lines.reduce((a: number, l: any) => a + Number(l.product.price) * l.quantity, 0);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[95]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-lg font-extrabold text-gray-900">🛒 Your Cart ({lines.length})</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 font-bold text-gray-700">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {lines.length === 0 && (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">🛒</p>
              <p className="font-bold text-gray-700">Your cart is empty</p>
              <p className="text-sm text-gray-500 mt-1">Tap any product to add it.</p>
            </div>
          )}
          {lines.map((l: any) => (
            <div key={l.product_id} className="flex gap-3">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                {l.product.is_digital && !l.product.images?.[0]?.url ? (
                  <FlyerCover title={l.product.name} category="Digital" colorKey={flyerColorKey(l.product.name)} className="w-full h-full" />
                ) : l.product.images?.[0]?.url ? (
                  <Image src={l.product.images[0].url} alt={l.product.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">🛍️</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{l.product.name}</p>
                <p className="text-sm font-extrabold text-purple-700">₦{Number(l.product.price).toLocaleString()}</p>
                <div className="flex items-center gap-2 mt-1">
                  <button onClick={() => update(l.product_id, l.quantity - 1)} className="w-7 h-7 rounded-full bg-gray-100 font-bold">−</button>
                  <span className="text-sm font-bold w-5 text-center">{l.quantity}</span>
                  <button onClick={() => update(l.product_id, l.quantity + 1)} className="w-7 h-7 rounded-full bg-gray-100 font-bold">+</button>
                  <button onClick={() => update(l.product_id, 0)} className="ml-auto text-xs font-bold text-red-500">Remove</button>
                </div>
              </div>
              <p className="text-sm font-extrabold text-gray-900 shrink-0">₦{(Number(l.product.price) * l.quantity).toLocaleString()}</p>
            </div>
          ))}
        </div>

        {lines.length > 0 && (
          <div className="border-t px-5 py-4 space-y-3 bg-gray-50 rounded-b-none">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 font-bold">Subtotal</span>
              <span className="font-extrabold text-gray-900">₦{subtotal.toLocaleString()}</span>
            </div>
            <Link
              href={`/checkout/${slug}`}
              onClick={onClose}
              className="block w-full bg-green-600 text-white text-center py-4 rounded-xl font-extrabold hover:bg-green-700 shadow-lg"
            >
              Proceed to Checkout →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}