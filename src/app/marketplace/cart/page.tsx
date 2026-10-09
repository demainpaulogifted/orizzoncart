"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Store,
  LoaderCircle,
} from "lucide-react";
import { toast } from "sonner";
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
      const parsed = JSON.parse(raw);
      return getImageUrl(parsed);
    } catch {
      return raw.startsWith("http") || raw.startsWith("/")
        ? raw
        : null;
    }
  }

  if (Array.isArray(raw)) {
    return raw.length > 0 ? getImageUrl(raw[0]) : null;
  }

  if (typeof raw === "object") {
    const value = raw as {
      url?: unknown;
      src?: unknown;
    };

    return getImageUrl(value.url ?? value.src);
  }

  return null;
}

function formatNaira(value: number) {
  return `₦${Number(value || 0).toLocaleString("en-NG")}`;
}

function getStoreUrl(slug: string) {
  if (!slug) return "/marketplace";

  // Storefronts use the configured OrizzonCart subdomain pattern.
  return `https://${slug}.orizzoncart.name.ng`;
}

export default function MarketplaceCartPage() {
  const [items, setItems] = useState<SharedCartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyItems, setBusyItems] = useState<string[]>([]);

  const loadCart = useCallback(async () => {
    try {
      const data = await getSharedCart();
      setItems(data);
    } catch (error) {
      console.error("Could not load shared cart:", error);
      toast.error("Could not load your cart. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCart();

    // Refresh when another cart component changes the shared cart.
    const handleCartUpdated = async () => {
      try {
        const response = await fetch("/api/marketplace-cart", {
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) return;

        const result = await response.json();
        setItems(Array.isArray(result.items) ? result.items : []);
      } catch (error) {
        console.error("Could not refresh shared cart:", error);
      }
    };

    window.addEventListener("cart-updated", handleCartUpdated);

    return () => {
      window.removeEventListener("cart-updated", handleCartUpdated);
    };
  }, [loadCart]);

  const markBusy = (key: string, busy: boolean) => {
    setBusyItems((current) =>
      busy
        ? [...current.filter((item) => item !== key), key]
        : current.filter((item) => item !== key)
    );
  };

  const changeQuantity = async (
    item: SharedCartItem,
    quantity: number
  ) => {
    const key = `\( {item.merchant_id}: \){item.product_id}`;

    if (busyItems.includes(key)) return;

    markBusy(key, true);

    try {
      const updatedItems = await updateSharedCartItem(
        item.merchant_id,
        item.product_id,
        quantity
      );

      setItems(updatedItems);
    } catch (error) {
      console.error("Could not update cart quantity:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update the quantity."
      );
    } finally {
      markBusy(key, false);
    }
  };

  const removeItem = async (item: SharedCartItem) => {
    const key = `\( {item.merchant_id}: \){item.product_id}`;

    if (busyItems.includes(key)) return;

    markBusy(key, true);

    try {
      const updatedItems = await removeSharedCartItem(
        item.merchant_id,
        item.product_id
      );

      setItems(updatedItems);
      toast.success("Item removed from your cart.");
    } catch (error) {
      console.error("Could not remove cart item:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not remove this item."
      );
    } finally {
      markBusy(key, false);
    }
  };

  const groupedCarts = Object.values(
    items.reduce<
      Record<
        string,
        {
          merchant_id: string;
          merchant_name: string;
          merchant_slug: string;
          items: SharedCartItem[];
        }
      >
    >((groups, item) => {
      const key = item.merchant_id;

      if (!groups[key]) {
        groups[key] = {
          merchant_id: item.merchant_id,
          merchant_name: item.merchant_name,
          merchant_slug: item.merchant_slug,
          items: [],
        };
      }

      groups[key].items.push(item);
      return groups;
    }, {})
  );

  const totalItems = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const subtotal = items.reduce(
    (sum, item) => sum + item.line_total,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <Link
            href="/marketplace"
            className="-ml-2 rounded-full p-2 text-gray-600 hover:bg-gray-100"
            aria-label="Back to marketplace"
          >
            <ArrowLeft size={20} />
          </Link>

          <div className="min-w-0">
            <h1 className="text-xl font-bold text-gray-900">
              Your Carts
            </h1>
            <p className="text-sm text-gray-500">
              {totalItems} {totalItems === 1 ? "item" : "items"} across{" "}
              {groupedCarts.length}{" "}
              {groupedCarts.length === 1 ? "store" : "stores"}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {/* Track Past Orders — pinned near the top */}
        <div className="mb-6 rounded-2xl border border-gray-100 bg-white px-4 py-4 shadow-sm">
          <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Already purchased something?
              </h3>
              <p className="mt-0.5 text-xs text-gray-500">
                Find your previous orders and tracking information.
              </p>
            </div>
            <Link
              href="/marketplace/orders"
              className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-700 transition hover:bg-purple-100"
            >
              📦 Track Past Orders
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <LoaderCircle className="mb-3 animate-spin" size={32} />
            <p>Loading your carts...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white px-5 py-16 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <ShoppingBag size={32} className="text-gray-400" />
            </div>

            <h2 className="mb-2 text-lg font-semibold text-gray-900">
              Your cart is empty
            </h2>

            <p className="mb-6 text-sm text-gray-500">
              Browse OrizzonCart and add products from your favourite stores.
            </p>

            <Link
              href="/marketplace"
              className="inline-flex items-center justify-center rounded-full bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-700"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {groupedCarts.map((merchantCart) => {
              const storeSubtotal = merchantCart.items.reduce(
                (sum, item) => sum + item.line_total,
                0
              );

              const storeItemCount = merchantCart.items.reduce(
                (sum, item) => sum + item.quantity,
                0
              );

              return (
                <section
                  key={merchantCart.merchant_id}
                  className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-gray-100 bg-gray-50 px-4 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                        <Store size={21} />
                      </div>

                      <div className="min-w-0">
                        <h2 className="truncate font-bold text-gray-900">
                          {merchantCart.merchant_name}
                        </h2>
                        <p className="text-xs text-gray-500">
                          {storeItemCount}{" "}
                          {storeItemCount === 1 ? "item" : "items"}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={getStoreUrl(merchantCart.merchant_slug)}
                      className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-800"
                    >
                      Visit store
                      <ExternalLink size={13} />
                    </Link>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {merchantCart.items.map((item) => {
                      const key = `\( {item.merchant_id}: \){item.product_id}`;
                      const isBusy = busyItems.includes(key);
                      const imageUrl = getImageUrl(item.image);

                      return (
                        <div
                          key={key}
                          className="flex gap-3 p-4 sm:gap-4"
                        >
                          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50 sm:h-24 sm:w-24">
                            {imageUrl ? (
                              <Image
                                src={imageUrl}
                                alt={item.name}
                                fill
                                sizes="96px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-3xl">
                                {item.is_digital ? "📄" : "🛍️"}
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="line-clamp-2 text-sm font-semibold text-gray-900">
                              {item.name}
                            </h3>

                            <p className="mt-1 font-bold text-purple-700">
                              {formatNaira(item.price)}
                            </p>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <div className="inline-flex items-center overflow-hidden rounded-lg border border-gray-200">
                                <button
                                  type="button"
                                  onClick={() =>
                                    void changeQuantity(
                                      item,
                                      item.quantity - 1
                                    )
                                  }
                                  disabled={isBusy}
                                  className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                                  aria-label={`Decrease quantity of ${item.name}`}
                                >
                                  <Minus size={14} />
                                </button>

                                <span className="min-w-8 text-center text-sm font-semibold">
                                  {item.quantity}
                                </span>

                                <button
                                  type="button"
                                  onClick={() =>
                                    void changeQuantity(
                                      item,
                                      item.quantity + 1
                                    )
                                  }
                                  disabled={isBusy || item.quantity >= 99}
                                  className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                                  aria-label={`Increase quantity of ${item.name}`}
                                >
                                  <Plus size={14} />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => void removeItem(item)}
                                disabled={isBusy}
                                className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                              >
                                {isBusy ? (
                                  <LoaderCircle
                                    size={14}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Trash2 size={14} />
                                )}
                                Remove
                              </button>
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            <p className="text-sm font-bold text-gray-900">
                              {formatNaira(item.line_total)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-4 py-3">
                    <span className="text-sm text-gray-600">
                      Store subtotal
                    </span>
                    <span className="font-bold text-gray-900">
                      {formatNaira(storeSubtotal)}
                    </span>
                  </div>
                </section>
              );
            })}

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Cart subtotal
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Delivery fees and final totals may vary by store.
                  </p>
                </div>

                <p className="text-xl font-extrabold text-purple-700">
                  {formatNaira(subtotal)}
                </p>
              </div>

              <Link
                href="/marketplace"
                className="mt-5 flex w-full items-center justify-center rounded-xl border border-purple-200 bg-white px-5 py-3 font-semibold text-purple-700 transition hover:bg-purple-50"
              >
                Continue Shopping
              </Link>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}