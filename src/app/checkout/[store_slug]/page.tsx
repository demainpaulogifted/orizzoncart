'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import Link from 'next/link';

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.store_slug as string;

  const [products, setProducts] = useState<any[]>([]);
  const [showcase, setShowcase] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '', address_line1: '', city: '', state: '' });

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/products?slug=${slug}`);
      const data = await res.json();
      setProducts(data.products || []);
      setShowcase(!!data.showcase);
      try { setItems(JSON.parse(localStorage.getItem(`orz_cart_${slug}`) || '[]')); } catch {}
      setLoading(false);
    };
    load();
  }, [slug]);

  const cartProducts = items
    .map((i: any) => ({ ...products.find((p) => p.id === i.product_id), quantity: i.quantity }))
    .filter((p: any) => p.id);

  const hasPhysical = cartProducts.some((p: any) => !p.is_digital);
  const subtotal = cartProducts.reduce((a: number, p: any) => a + Number(p.price) * p.quantity, 0);
  const shipping = hasPhysical ? 2500 : 0;
  const total = subtotal + shipping;

  const setQty = (id: string, qty: number) => {
    const next = qty <= 0 ? items.filter((i: any) => i.product_id !== id) : items.map((i: any) => (i.product_id === id ? { ...i, quantity: qty } : i));
    setItems(next);
    localStorage.setItem(`orz_cart_${slug}`, JSON.stringify(next));
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaying(true);
    try {
      const res = await fetch('/api/checkout/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_slug: slug,
          items: items.map((i: any) => ({ product_id: i.product_id, quantity: i.quantity })),
          customer,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem(`orz_cart_${slug}`, '[]');
      window.location.href = data.authorization_url;
    } catch (err: any) {
      toast.error(err.message || 'Checkout failed');
      setPaying(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading checkout...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link href={`/store/${slug}`} className="text-sm font-bold text-purple-600 hover:underline">← Back to store</Link>
        <h1 className="text-3xl font-extrabold text-gray-900">Checkout</h1>

        {showcase && (
          <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-xl p-4 text-sm font-bold text-center">
            🛍️ This store is in showcase mode — online ordering is currently unavailable.
          </div>
        )}

        {cartProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border p-16 text-center">
            <p className="text-5xl mb-4">🛒</p>
            <p className="font-bold text-gray-700 mb-4">Your cart is empty</p>
            <Link href={`/store/${slug}`} className="inline-block px-6 py-3 bg-gray-900 text-white rounded-full font-bold">Browse Products</Link>
          </div>
        ) : (
          <form onSubmit={handlePay} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border p-5 space-y-3">
                <h2 className="font-bold text-gray-900">Your Details</h2>
                <input required placeholder="Full name" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-purple-500" />
                <input required type="email" placeholder="Email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-purple-500" />
                <input required type="tel" placeholder="Phone number" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-purple-500" />
                {hasPhysical && (
                  <>
                    <input required placeholder="Delivery address" value={customer.address_line1} onChange={(e) => setCustomer({ ...customer, address_line1: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-purple-500" />
                    <div className="grid grid-cols-2 gap-3">
                      <input required placeholder="City" value={customer.city} onChange={(e) => setCustomer({ ...customer, city: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-purple-500" />
                      <input required placeholder="State" value={customer.state} onChange={(e) => setCustomer({ ...customer, state: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-purple-500" />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border p-5 space-y-4 h-fit">
              <h2 className="font-bold text-gray-900">Order Summary</h2>
              <div className="space-y-3">
                {cartProducts.map((p: any) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {p.images?.[0]?.url && <Image src={p.images[0].url} alt={p.name} fill className="object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{p.name}</p>
                      <p className="text-xs text-gray-500">₦{Number(p.price).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button type="button" onClick={() => setQty(p.id, p.quantity - 1)} className="w-6 h-6 rounded-full bg-gray-100 text-xs font-bold">−</button>
                      <span className="text-sm font-bold w-4 text-center">{p.quantity}</span>
                      <button type="button" onClick={() => setQty(p.id, p.quantity + 1)} className="w-6 h-6 rounded-full bg-gray-100 text-xs font-bold">+</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-bold">₦{subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span className="font-bold">{hasPhysical ? '₦2,500' : 'Free (digital)'}</span></div>
                <div className="flex justify-between text-base border-t pt-2"><span className="font-extrabold">Total</span><span className="font-extrabold text-purple-700">₦{total.toLocaleString()}</span></div>
              </div>
              <button type="submit" disabled={paying || showcase} className="w-full py-4 rounded-full bg-green-600 text-white font-bold text-lg hover:bg-green-700 disabled:opacity-50">
                {paying ? 'Redirecting to Paystack...' : `Pay ₦${total.toLocaleString()} securely`}
              </button>
              <p className="text-xs text-gray-400 text-center">🔒 Powered by Paystack — card, transfer, USSD</p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}