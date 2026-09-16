'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const params = useParams() as any;
  const slug = (params?.slug || params?.store_slug || '') as string;

  const [products, setProducts] = useState<any[]>([]);
  const [shipping, setShipping] = useState<any>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [method, setMethod] = useState<'DELIVERY' | 'PICKUP' | 'LOCAL'>('DELIVERY');
  const [form, setForm] = useState({ name: '', email: '', phone: '', address_line1: '', city: '', state: '' });
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  const readCart = () => {
    try { return JSON.parse(localStorage.getItem(`orz_cart_${slug}`) || '[]'); } catch { return []; }
  };

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      const res = await fetch(`/api/products?slug=${slug}`);
      const data = await res.json();
      setProducts(data.products || []);
      setShipping(data.shipping || null);

      const ids = (data.products || []).map((p: any) => p.id);
      const current = readCart();
      const valid = current.filter((c: any) => ids.includes(c.product_id));
      if (valid.length !== current.length) {
        localStorage.setItem(`orz_cart_${slug}`, JSON.stringify(valid));
        toast.error('Unavailable items were removed from your cart');
      }
      setCart(valid);

      const s = data.shipping;
      if (s) {
        if (s.delivery) setMethod('DELIVERY');
        else if (s.local) setMethod('LOCAL');
        else if (s.pickup) setMethod('PICKUP');
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const syncCart = (next: any[]) => {
    localStorage.setItem(`orz_cart_${slug}`, JSON.stringify(next));
    setCart(next);
    window.dispatchEvent(new Event('cart-updated'));
  };

  const updateQty = (id: string, q: number) => {
    const next = q <= 0 ? cart.filter((c: any) => c.product_id !== id) : cart.map((c: any) => (c.product_id === id ? { ...c, quantity: q } : c));
    syncCart(next);
  };

  const lines = cart.map((c: any) => ({ ...c, product: products.find((p: any) => p.id === c.product_id) })).filter((l: any) => l.product);
  const subtotal = lines.reduce((a: number, l: any) => a + Number(l.product.price) * l.quantity, 0);
  const shippingCost = method === 'DELIVERY' ? Number(shipping?.delivery_fee || 0) : 0;
  const total = subtotal + shippingCost;

  const options = [
    shipping?.delivery && { id: 'DELIVERY', icon: '🚚', title: 'Door Delivery', desc: `Waybill fee: ₦${Number(shipping?.delivery_fee || 0).toLocaleString()}` },
    shipping?.pickup && { id: 'PICKUP', icon: '🏪', title: 'Pickup', desc: shipping?.pickup_address || 'Collect from the seller' },
    shipping?.local && { id: 'LOCAL', icon: '🏘️', title: shipping?.local_label || 'Neighbourhood — free delivery', desc: 'Free delivery within the seller\'s area' },
  ].filter(Boolean) as any[];

  const pay = async () => {
    setError('');
    if (lines.length === 0) { setError('Your cart is empty.'); return; }
    if (!form.name || !form.email || !form.phone) { setError('Please fill in your name, email and phone number.'); return; }
    if (method !== 'PICKUP' && !form.address_line1) { setError('Please enter your delivery address.'); return; }
    setPaying(true);
    try {
      const res = await fetch('/api/checkout/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_slug: slug,
          items: lines.map((l: any) => ({ product_id: l.product_id, quantity: l.quantity })),
          customer: form,
          shipping_mode: method,
          shipping_cost: shippingCost,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');
      syncCart([]);
      window.location.href = data.authorization_url;
    } catch (e: any) {
      setError(e.message);
      setPaying(false);
    }
  };

  if (!slug) return <div className="p-10 text-center text-gray-500">Store not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Checkout</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm font-bold text-red-700">⚠️ {error}</div>
        )}

        {/* CONTACT + ADDRESS */}
        <div className="bg-white rounded-2xl border p-5 space-y-3">
          <h2 className="font-bold text-gray-900">Your Details</h2>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" className="w-full px-4 py-3 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-purple-500" />
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email address" className="w-full px-4 py-3 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-purple-500" />
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" className="w-full px-4 py-3 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-purple-500" />

          {method !== 'PICKUP' ? (
            <>
              <input value={form.address_line1} onChange={(e) => setForm({ ...form, address_line1: e.target.value })} placeholder="Delivery address" className="w-full px-4 py-3 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-purple-500" />
              <div className="grid grid-cols-2 gap-3">
                <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" className="w-full px-4 py-3 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-purple-500" />
                <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="State" className="w-full px-4 py-3 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
            </>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
              🏪 <strong>Pickup address:</strong> {shipping?.pickup_address || 'The seller will share the pickup location with you.'}
            </div>
          )}
        </div>

        {/* SHIPPING CHOICE */}
        {options.length > 0 && (
          <div className="bg-white rounded-2xl border p-5 space-y-3">
            <h2 className="font-bold text-gray-900">Delivery Method</h2>
            {options.map((o: any) => (
              <button
                key={o.id}
                onClick={() => setMethod(o.id)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${method === o.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}
              >
                <p className="font-bold text-gray-900 text-sm">{o.icon} {o.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{o.desc}</p>
              </button>
            ))}
          </div>
        )}

        {/* SUMMARY */}
        <div className="bg-white rounded-2xl border p-5 space-y-4">
          <h2 className="font-bold text-gray-900">Order Summary</h2>
          {lines.length === 0 && <p className="text-sm text-gray-500">Your cart is empty.</p>}
          {lines.map((l: any) => (
            <div key={l.product_id} className="flex items-center gap-3">
              <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                {l.product.images?.[0]?.url ? (
                  <Image src={l.product.images[0].url} alt={l.product.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">🛍️</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{l.product.name}</p>
                <p className="text-xs text-gray-500">₦{Number(l.product.price).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQty(l.product_id, l.quantity - 1)} className="w-7 h-7 rounded-full bg-gray-100 font-bold">−</button>
                <span className="text-sm font-bold w-5 text-center">{l.quantity}</span>
                <button onClick={() => updateQty(l.product_id, l.quantity + 1)} className="w-7 h-7 rounded-full bg-gray-100 font-bold">+</button>
              </div>
            </div>
          ))}

          <div className="border-t pt-3 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-bold">₦{subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between">
              <span className="text-gray-500">{method === 'DELIVERY' ? 'Waybill' : method === 'PICKUP' ? 'Pickup' : 'Neighbourhood delivery'}</span>
              <span className="font-bold">{shippingCost === 0 ? 'FREE' : `₦${shippingCost.toLocaleString()}`}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold border-t pt-2">
              <span>Total</span><span className="text-purple-700">₦{total.toLocaleString()}</span>
            </div>
          </div>

          <button onClick={pay} disabled={paying || lines.length === 0} className="w-full bg-green-600 text-white py-4 rounded-xl font-extrabold hover:bg-green-700 disabled:opacity-50">
            {paying ? 'Redirecting...' : `Pay ₦${total.toLocaleString()} securely`}
          </button>
          <p className="text-xs text-center text-gray-400">🔒 Powered by Paystack — card, transfer, USSD</p>
        </div>
      </div>
    </div>
  );
}