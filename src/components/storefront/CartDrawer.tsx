"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { FlyerCover, flyerColorKey } from "@/components/storefront/FlyerCover";
import {
  getSharedCart,
  updateSharedCartItem,
  removeSharedCartItem,
  type SharedCartItem,
} from "@/lib/marketplace-cart-client";

function getImageUrl(raw: unknown): string | null {
  if (!raw) return null;

  if (typeof raw === "string") {
    try {
      return getImageUrl(JSON.parse(raw));
    } catch {
      return raw.startsWith("http") || raw.startsWith("/") ? raw : null;
    }
  }

  if (Array.isArray(raw)) {
    return raw.length ? getImageUrl(raw[0]) : null;
  }

  if (typeof raw === "object") {
    const image = raw as { url?: unknown; src?: unknown };
    return getImageUrl(image.url ?? image.src);
  }

  return null;
}

function formatNaira(value: number) {
  return `₦${Number(value || 0).toLocaleString("en-NG")}`;
}

export function CartDrawer({
  slug,
  open,
  onClose,
}: {
  slug: string;
  open: boolean;
  onClose: () => void;
}) {
  const [cart, setCart] = useState<SharedCartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyItems, setBusyItems] = useState<string[]>([]);

  const loadCart = useCallback(async () => {
    if (!slug) {
      setCart([]);
      setLoading(false);
      return;
    }

    try {
      const items = await getSharedCart();
      setCart(items.filter((item) => item.merchant_slug === slug));
    } catch (error) {
      console.error("Could not load storefront cart:", error);
      toast.error("Could not load your cart.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void loadCart();

    const handleCartUpdated = () => {
      void loadCart();
    };

    window.addEventListener("cart-updated", handleCartUpdated);

    return () => {
      window.removeEventListener("cart-updated", handleCartUpdated);
    };
  }, [loadCart, open]);

  const changeQuantity = async (
    item: SharedCartItem,
    quantity: number
  ) => {
    const key = `${item.merchant_id}:${item.product_id}`;
    if (busyItems.includes(key)) return;

    setBusyItems((current) => [...current, key]);

    try {
      const updated =
        quantity <= 0
          ? await removeSharedCartItem(item.merchant_id, item.product_id)
          : await updateSharedCartItem(
              item.merchant_id,
              item.product_id,
              Math.min(99, quantity)
            );

      setCart(updated.filter((row) => row.merchant_slug === slug));
    } catch (error) {
      console.error("Could not update storefront cart:", error);
      toast.error(
        error instanceof Error ? error.message : "Could not update your cart."
      );
    } finally {
      setBusyItems((current) => current.filter((value) => value !== key));
    }
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * item.quantity,
    0
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[95]">
      <button
        type="button"
        aria-label="Close cart"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-label="Your store cart"
        className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-3xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-lg font-extrabold text-gray-900">
            🛒 Your Cart ({cart.reduce((n, item) => n + item.quantity, 0)})
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cart"
            className="h-9 w-9 rounded-full bg-gray-100 font-bold text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {loading ? (
            <p className="py-12 text-center text-sm text-gray-500">
              Loading your cart…
            </p>
          ) : cart.length === 0 ? (
            <div className="py-16 text-center">
              <p className="mb-3 text-4xl">🛒</p>
              <p className="font-bold text-gray-700">Your cart is empty</p>
              <p className="mt-1 text-sm text-gray-500">
                Add a product from this store to get started.
              </p>
              <Link
                href="/marketplace/cart"
                onClick={onClose}
                className="mt-4 inline-block font-bold text-purple-700 hover:underline"
              >
                View your marketplace cart
              </Link>
            </div>
          ) : (
            cart.map((item) => {
              const key = `${item.merchant_id}:${item.product_id}`;
              const imageUrl = getImageUrl(item.image);
              const busy = busyItems.includes(key);

              return (
                <div
                  key={key}
                  className="flex gap-3 border-b border-gray-100 pb-4"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={item.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : item.is_digital ? (
                      <FlyerCover
                        title={item.name}
                        category="Digital"
                        colorKey={flyerColorKey(item.name)}
                        className="h-full w-full"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        🛍️
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-gray-900">
                      {item.name}
                    </p>
                    <p className="text-sm font-extrabold text-purple-700">
                      {formatNaira(item.price)}
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void changeQuantity(item, item.quantity - 1)}
                        aria-label={`Decrease ${item.name} quantity`}
                        className="h-7 w-7 rounded-full bg-gray-100 font-bold disabled:opacity-50"
                      >
                        −
                      </button>

                      <span className="w-5 text-center text-sm font-bold">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        disabled={busy || item.quantity >= 99}
                        onClick={() => void changeQuantity(item, item.quantity + 1)}
                        aria-label={`Increase ${item.name} quantity`}
                        className="h-7 w-7 rounded-full bg-gray-100 font-bold disabled:opacity-50"
                      >
                        +
                      </button>

                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void changeQuantity(item, 0)}
                        className="ml-auto text-xs font-bold text-red-500 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <p className="shrink-0 text-sm font-extrabold text-gray-900">
                    {formatNaira(Number(item.price) * item.quantity)}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {cart.length > 0 && (
          <div className="space-y-3 border-t bg-gray-50 px-5 py-4">
            <div className="flex justify-between text-sm">
              <span className="font-bold text-gray-600">Store subtotal</span>
              <span className="font-extrabold text-gray-900">
                {formatNaira(subtotal)}
              </span>
            </div>

            <p className="text-xs text-gray-500">
              Checkout is processed for this store. Items from other stores
              remain in your marketplace cart.
            </p>

            <Link
              href={`/checkout/${encodeURIComponent(slug)}`}
              onClick={onClose}
              className="block w-full rounded-xl bg-green-600 py-4 text-center font-extrabold text-white shadow-lg hover:bg-green-700"
            >
              Proceed to Checkout →
            </Link>

            <Link
              href="/marketplace/cart"
              onClick={onClose}
              className="block text-center text-sm font-bold text-purple-700 hover:underline"
            >
              View all store carts
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}