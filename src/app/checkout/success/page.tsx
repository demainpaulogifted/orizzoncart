
'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  getSharedCart,
  removeSharedCartItem,
  updateSharedCartItem,
} from '@/lib/marketplace-cart-client';

type OrderItem = {
  product_id: string;
  name: string;
  quantity: number;
  total: number;
};

type OrderInfo = {
  order_number: string;
  store_name: string;
  store_slug: string;
  customer_name: string;
  total_amount: number;
  tracking_number: string | null;
  items: OrderItem[];
  digital_files: { name: string; url: string }[];
};

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order');
  const reference = searchParams.get('reference');

  const [info, setInfo] = useState<OrderInfo | null>(null);
  const [loadError, setLoadError] = useState(false);

  // Prevent repeated cleanup while this page remains mounted.
  const processedOrder = useRef<string | null>(null);
  const processingOrder = useRef<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    let cancelled = false;

    const load = async () => {
      setLoadError(false);

      try {
        const url = new URL(
          `/api/orders/${encodeURIComponent(orderId)}/public`,
          window.location.origin
        );

        if (reference) {
          url.searchParams.set('ref', reference);
        }

        const response = await fetch(url.toString(), {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(
            response.status === 403
              ? 'Payment has not been confirmed yet.'
              : 'Could not load your order.'
          );
        }

        const data = (await response.json()) as OrderInfo;

        if (!cancelled) {
          setInfo(data);
        }
      } catch (error) {
        console.error('Could not load confirmed order:', error);

        if (!cancelled) {
          setLoadError(true);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [orderId, reference]);

  useEffect(() => {
    if (
      !orderId ||
      !info?.store_slug ||
      !Array.isArray(info.items) ||
      processedOrder.current === orderId ||
      processingOrder.current === orderId
    ) {
      return;
    }

    let cancelled = false;
    processingOrder.current = orderId;

    const clearPurchasedQuantities = async () => {
      try {
        let cartItems = await getSharedCart();

        for (const orderedItem of info.items) {
          if (cancelled) return;

          const productId = String(orderedItem.product_id || '');
          const orderedQuantity = Math.max(
            0,
            Number(orderedItem.quantity) || 0
          );

          if (!productId || orderedQuantity <= 0) continue;

          const cartItem = cartItems.find(
            (item) =>
              item.merchant_slug === info.store_slug &&
              String(item.product_id) === productId
          );

          if (!cartItem) continue;

          const remainingQuantity =
            cartItem.quantity - orderedQuantity;

          if (remainingQuantity > 0) {
            cartItems = await updateSharedCartItem(
              cartItem.merchant_id,
              cartItem.product_id,
              remainingQuantity
            );
          } else {
            cartItems = await removeSharedCartItem(
              cartItem.merchant_id,
              cartItem.product_id
            );
          }
        }

        if (!cancelled) {
          processedOrder.current = orderId;
        }
      } catch (error) {
        console.error(
          'Could not clear purchased quantities from the shared cart:',
          error
        );
      } finally {
        if (processingOrder.current === orderId) {
          processingOrder.current = null;
        }
      }
    };

    void clearPurchasedQuantities();

    return () => {
      cancelled = true;
    };
  }, [orderId, info]);

  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-gray-600 font-bold">Order not found.</p>
      </div>
    );
  }

  if (loadError && !info) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <p className="text-lg font-bold text-gray-900">
            We could not confirm your order yet.
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Please check your payment status before trying to pay again.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 rounded-xl bg-gray-900 px-5 py-3 font-bold text-white"
          >
            Check Again
          </button>
        </div>
      </div>
    );
  }

  if (!info) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto" />
          <p className="mt-4 text-gray-600">
            Confirming your order...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-8 text-center">
        <div className="text-6xl mb-4">🎉</div>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          Payment Successful!
        </h1>

        <p className="text-gray-600 mb-6">
          Thank you for your purchase from {info.store_name}
        </p>

        <div className="bg-gray-50 rounded-2xl p-6 mb-6 text-left">
          <p className="text-sm font-bold text-gray-500 uppercase mb-3">
            Order #{info.order_number}
          </p>

          <div className="space-y-2">
            {info.items?.map((item, index) => (
              <div
                key={`${item.product_id || item.name}-${index}`}
                className="flex justify-between gap-4"
              >
                <span className="text-gray-700">
                  {item.name} × {item.quantity}
                </span>
                <span className="font-bold whitespace-nowrap">
                  ₦{Number(item.total).toLocaleString('en-NG')}
                </span>
              </div>
            ))}

            <div className="border-t pt-2 mt-2 flex justify-between gap-4 font-extrabold text-lg">
              <span>Total</span>
              <span>
                ₦{Number(info.total_amount).toLocaleString('en-NG')}
              </span>
            </div>
          </div>
        </div>

        {info.digital_files?.length > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 mb-6 text-left">
            <p className="font-bold text-purple-900 mb-3">
              ⚡ Your Digital Products — Download Now:
            </p>

            <div className="space-y-2">
              {info.digital_files.map((file, index) => (
                <a
                  key={`${file.url}-${index}`}
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 bg-purple-600 text-white py-3 px-4 rounded-xl font-bold hover:bg-purple-700"
                >
                  <span className="truncate">📄 {file.name}</span>
                  <span className="text-xs shrink-0">DOWNLOAD ↓</span>
                </a>
              ))}
            </div>

            <p className="text-xs text-purple-700 mt-3">
              💡 Bookmark this page — your downloads stay available here.
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Link
            href={`/track-order?order=${encodeURIComponent(orderId)}`}
            className="block bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-gray-800"
          >
            📦 Track Your Order
          </Link>

          <Link
            href="/marketplace"
            className="block text-purple-600 font-bold hover:underline"
          >
            Continue Shopping
          </Link>

          <Link
            href="/marketplace/cart"
            className="block text-sm text-gray-600 font-bold hover:underline"
          >
            View Remaining Cart Items
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto" />
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
