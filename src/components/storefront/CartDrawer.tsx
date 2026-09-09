'use client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCart } from './CartContext';

export function CartDrawer({ products, merchant, open, onClose }: { products: any[]; merchant: any; open: boolean; onClose: () => void }) {
  const { items, setQty, remove, count } = useCart();
  const router = useRouter();

  const cartProducts = items
    .map((i: any) => ({ ...products.find((p) => p.id === i.product_id), quantity: i.quantity }))
    .filter((p: any) => p.id);

  const subtotal = cartProducts.reduce((a: number, p: any) => a + Number(p.price) * p.quantity, 0);

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />}
      <div className={`fixed inset-y-0 right-0 w-full max-w-sm bg-white z-50 shadow-2xl transform transition-transform duration-300 flex flex-col ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">Your Cart ({count})</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-100 font-bold text-gray-700">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cartProducts.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">🛒</p>
              <p className="text-sm font-medium">Your cart is empty</p>
            </div>
          )}
          {cartProducts.map((p: any) => (
            <div key={p.id} className="flex gap-3">
              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                {p.images?.[0]?.url && <Image src={p.images[0].url} alt={p.name} fill className="object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{p.name}</p>
                <p className="text-sm font-bold text-[var(--color-primary)]">₦{Number(p.price).toLocaleString()}</p>
                <div className="flex items-center gap-2 mt-1">
                  <button onClick={() => setQty(p.id, p.quantity - 1)} className="w-6 h-6 rounded-full bg-gray-100 text-xs font-bold">−</button>
                  <span className="text-sm font-bold w-5 text-center">{p.quantity}</span>
                  <button onClick={() => setQty(p.id, p.quantity + 1)} className="w-6 h-6 rounded-full bg-gray-100 text-xs font-bold">+</button>
                  <button onClick={() => remove(p.id)} className="ml-auto text-xs font-bold text-red-500">Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 font-medium">Subtotal</span>
            <span className="font-extrabold text-gray-900">₦{subtotal.toLocaleString()}</span>
          </div>
          <button
            onClick={() => { onClose(); router.push(`/checkout/${merchant.store_slug}`); }}
            disabled={cartProducts.length === 0}
            className="w-full py-3.5 rounded-full bg-[var(--color-primary)] text-white font-bold hover:opacity-90 disabled:opacity-40"
          >
            Proceed to Checkout →
          </button>
        </div>
      </div>
    </>
  );
}