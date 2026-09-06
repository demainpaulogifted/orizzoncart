'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

export default function CheckoutPage() {
  const params = useParams();
  const store_slug = params.store_slug as string;

  const [loading, setLoading] = useState(false);
  
  const [customer, setCustomer] = useState({
    name: '', email: '', phone: '', address_line1: '', city: '', state: ''
  });

  // Mock cart data for testing the UI
  const cart = [
    { product_id: 'mock-id-1', name: 'Sample Product', price: 15000, quantity: 1, is_digital: false }
  ];

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shippingCost = cart.every((item) => item.is_digital) ? 0 : 2500;
  const total = subtotal + shippingCost;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/checkout/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_slug,
          items: cart.map(item => ({ product_id: item.product_id, quantity: item.quantity })),
          customer
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Redirect customer to Paystack secure payment page
      window.location.href = data.authorization_url;
    } catch (error: any) {
      toast.error(error.message || 'Failed to initialize checkout');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left: Customer Details Form */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border">
          <h2 className="text-2xl font-bold mb-6 font-display">Contact & Shipping Details</h2>
          <form onSubmit={handleCheckout} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input required placeholder="First Name" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} className="p-3 border rounded-lg" />
              <input required placeholder="Last Name" className="p-3 border rounded-lg" />
            </div>
            <input required type="email" placeholder="Email Address" value={customer.email} onChange={e => setCustomer({...customer, email: e.target.value})} className="w-full p-3 border rounded-lg" />
            <input required type="tel" placeholder="Phone Number" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} className="w-full p-3 border rounded-lg" />
            
            {!cart.every((item) => item.is_digital) && (
              <>
                <input required placeholder="Street Address" value={customer.address_line1} onChange={e => setCustomer({...customer, address_line1: e.target.value})} className="w-full p-3 border rounded-lg" />
                <div className="grid grid-cols-2 gap-4">
                  <input required placeholder="City" value={customer.city} onChange={e => setCustomer({...customer, city: e.target.value})} className="p-3 border rounded-lg" />
                  <input required placeholder="State" value={customer.state} onChange={e => setCustomer({...customer, state: e.target.value})} className="p-3 border rounded-lg" />
                </div>
              </>
            )}

            <button type="submit" disabled={loading} className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 disabled:opacity-50 mt-4">
              {loading ? 'Processing...' : `Pay ${formatCurrency(total)}`}
            </button>
          </form>
        </div>

        {/* Right: Order Summary */}
        <div className="bg-gray-100 p-8 rounded-2xl h-fit">
          <h2 className="text-xl font-bold mb-6">Order Summary</h2>
          <div className="space-y-4 mb-6">
            {cart.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span>{item.name} x {item.quantity}</span>
                <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span>{shippingCost === 0 ? 'Free (Digital)' : formatCurrency(shippingCost)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold pt-4 border-t">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}