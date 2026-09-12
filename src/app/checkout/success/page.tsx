'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order');
  const [order, setOrder] = useState<any>(null);
  const [digitalLinks, setDigitalLinks] = useState<string[]>([]);

  useEffect(() => {
    if (!orderId) return;
    
    const loadOrder = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('orders')
        .select('*, merchants(*), order_items(*, products(*))')
        .eq('id', orderId)
        .single();
      
      setOrder(data);
      
      // Create digital purchases for sourced products
      if (data && data.order_items) {
        const sourcedProducts = data.order_items.filter((item: any) => item.products?.catalog_id);
        
        const links: string[] = [];
        for (const item of sourcedProducts) {
          const accessToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
          
          const { data: purchase } = await supabase
            .from('digital_purchases')
            .insert({
              order_id: orderId,
              merchant_id: data.merchant_id,
              catalog_id: item.products.catalog_id,
              customer_email: data.customer_email,
              access_token: accessToken,
            })
            .select()
            .single();
          
          if (purchase) {
            links.push(`/d/${accessToken}`);
          }
        }
        
        setDigitalLinks(links);
      }
    };
    
    loadOrder();
  }, [orderId]);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-8 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Order Confirmed!</h1>
        <p className="text-gray-600 mb-6">Thank you for your purchase from {order.merchants?.store_name}</p>

        <div className="bg-gray-50 rounded-2xl p-6 mb-6 text-left">
          <p className="text-sm font-bold text-gray-500 uppercase mb-3">Order #{order.order_number}</p>
          <div className="space-y-2">
            {order.order_items?.map((item: any) => (
              <div key={item.id} className="flex justify-between">
                <span className="text-gray-700">{item.product_name} × {item.quantity}</span>
                <span className="font-bold">₦{item.total_price.toLocaleString()}</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2 flex justify-between font-extrabold text-lg">
              <span>Total</span>
              <span>₦{order.total_amount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {digitalLinks.length > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 mb-6">
            <p className="font-bold text-purple-900 mb-3">📚 Your Digital Products:</p>
            <div className="space-y-2">
              {digitalLinks.map((link, i) => (
                <a
                  key={i}
                  href={link}
                  target="_blank"
                  className="block bg-purple-600 text-white py-3 px-4 rounded-xl font-bold hover:bg-purple-700"
                >
                  Access Digital Product {i + 1}
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Link
            href={`/track-order?order=${orderId}`}
            className="block bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-gray-800"
          >
            Track Your Order
          </Link>
          <Link
            href="/"
            className="block text-purple-600 font-bold hover:underline"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}