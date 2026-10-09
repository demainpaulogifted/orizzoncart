"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import {
getSharedCart,
updateSharedCartItem,
removeSharedCartItem,
type SharedCartItem,
} from "@/lib/marketplace-cart-client";

type ShippingMethod = "DELIVERY" | "PICKUP" | "LOCAL";

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

function money(value: number) {
return "₦${Number(value || 0).toLocaleString("en-NG")}";
}

export default function CheckoutPage() {
const params = useParams();
const rawParams = params as Record<string, string | string[] | undefined>;
const slugValue = rawParams.store_slug ?? rawParams.slug;
const slug = Array.isArray(slugValue) ? slugValue[0] : slugValue || "";

const [cart, setCart] = useState<SharedCartItem[]>([]);
const [shipping, setShipping] = useState<any>(null);
const [loading, setLoading] = useState(true);
const [busyItems, setBusyItems] = useState<string[]>([]);
const [method, setMethod] = useState<ShippingMethod>("DELIVERY");
const [form, setForm] = useState({
name: "",
email: "",
phone: "",
address_line1: "",
city: "",
state: "",
});
const [paying, setPaying] = useState(false);
const [error, setError] = useState("");

const loadCart = useCallback(async () => {
if (!slug) {
setCart([]);
setLoading(false);
return;
}

try {
  const items = await getSharedCart();
  setCart(items.filter((item) => item.merchant_slug === slug));
} catch (e) {
  console.error("Checkout cart load failed:", e);
  setError("Could not load your cart. Please refresh and try again.");
} finally {
  setLoading(false);
}

}, [slug]);

useEffect(() => {
void loadCart();

const onCartUpdated = () => {
  void loadCart();
};

window.addEventListener("cart-updated", onCartUpdated);
return () => window.removeEventListener("cart-updated", onCartUpdated);

}, [loadCart]);

useEffect(() => {
if (!slug) return;

let cancelled = false;

async function loadShipping() {
  try {
    const response = await fetch(
      `/api/products?slug=${encodeURIComponent(slug)}`,
      { cache: "no-store" }
    );
    const data = await response.json();

    if (cancelled) return;

    if (!response.ok) {
      throw new Error(data.error || "Could not load store delivery options.");
    }

    setShipping(data.shipping || null);

    const options = data.shipping;
    if (options?.delivery) setMethod("DELIVERY");
    else if (options?.local) setMethod("LOCAL");
    else if (options?.pickup) setMethod("PICKUP");
  } catch (e) {
    if (!cancelled) {
      console.error("Could not load shipping options:", e);
      setShipping(null);
    }
  }
}

void loadShipping();

return () => {
  cancelled = true;
};

}, [slug]);

const changeQuantity = async (
item: SharedCartItem,
quantity: number
) => {
const key = "${item.merchant_id}:${item.product_id}";
if (busyItems.includes(key)) return;

setBusyItems((current) => [...current, key]);
setError("");

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
} catch (e) {
  const message =
    e instanceof Error ? e.message : "Could not update your cart.";
  setError(message);
  toast.error(message);
} finally {
  setBusyItems((current) => current.filter((value) => value !== key));
}

};

const subtotal = cart.reduce(
(sum, item) => sum + Number(item.price || 0) * item.quantity,
0
);

const shippingCost =
method === "DELIVERY" ? Number(shipping?.delivery_fee || 0) : 0;
const total = subtotal + shippingCost;

const options = [
shipping?.delivery && {
id: "DELIVERY" as const,
icon: "🚚",
title: "Door Delivery",
desc: "Delivery fee: ${money(Number(shipping?.delivery_fee || 0))}",
},
shipping?.pickup && {
id: "PICKUP" as const,
icon: "🏪",
title: "Pickup",
desc: shipping?.pickup_address || "Collect from the seller",
},
shipping?.local && {
id: "LOCAL" as const,
icon: "🏘️",
title: shipping?.local_label || "Neighbourhood delivery",
desc: "Free delivery within the seller's area",
},
].filter(Boolean) as {
id: ShippingMethod;
icon: string;
title: string;
desc: string;
}[];

const pay = async () => {
setError("");

if (cart.length === 0) {
  setError("There are no items from this store in your cart.");
  return;
}

if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
  setError("Please enter your name, email address, and phone number.");
  return;
}

if (method !== "PICKUP" && !form.address_line1.trim()) {
  setError("Please enter your delivery address.");
  return;
}

if (options.length === 0) {
  setError("This store has no delivery or pickup method configured. Please contact the seller.");
  return;
}

if (options.length > 0 && !options.some((option) => option.id === method)) {
  setError("Please select an available delivery method for this store.");
  return;
}

setPaying(true);

try {
  const response = await fetch("/api/checkout/initialize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      store_slug: slug,
      items: cart.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      })),
      customer: {
        ...form,
        country: "Nigeria",
      },
      shipping_mode: method,
      shipping_cost: shippingCost,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Could not initialize checkout.");
  }

  if (!data.authorization_url) {
    throw new Error("The payment provider did not return a payment link.");
  }

  // Keep the cart until payment is verified as successful.
  window.location.assign(data.authorization_url);
} catch (e) {
  const message = e instanceof Error ? e.message : "Checkout failed.";
  setError(message);
  setPaying(false);
}

};

if (!slug) {
return <div className="p-10 text-center text-gray-500">Store not found.</div>;
}

return (
<div className="min-h-screen bg-gray-50 px-4 py-8">
<div className="mx-auto max-w-4xl space-y-6">
<div>
<h1 className="text-2xl font-extrabold text-gray-900">Checkout</h1>
<p className="mt-1 text-sm text-gray-500">
Your order from this store will be processed separately from
purchases at other stores.
</p>
</div>

    {error && (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
        ⚠️ {error}
      </div>
    )}

    {loading ? (
      <div className="rounded-2xl border bg-white p-10 text-center text-gray-500">
        Loading your cart…
      </div>
    ) : (
      <>
        <section className="space-y-3 rounded-2xl border bg-white p-5">
          <h2 className="font-bold text-gray-900">Your Details</h2>

          <input
            required
            autoComplete="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Full name"
            className="w-full rounded-xl bg-gray-100 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
          />

          <input
            required
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Email address"
            className="w-full rounded-xl bg-gray-100 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
          />

          <input
            required
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="Phone number"
            className="w-full rounded-xl bg-gray-100 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
          />

          {method !== "PICKUP" && (
            <>
              <input
                value={form.address_line1}
                onChange={(e) =>
                  setForm({ ...form, address_line1: e.target.value })
                }
                placeholder="Delivery address"
                className="w-full rounded-xl bg-gray-100 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
              />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="City"
                  className="w-full rounded-xl bg-gray-100 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  placeholder="State"
                  className="w-full rounded-xl bg-gray-100 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </>
          )}

          {method === "PICKUP" && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
              <strong>Pickup address:</strong>{" "}
              {shipping?.pickup_address ||
                "The seller will share the pickup location with you."}
            </div>
          )}
        </section>

        {options.length > 0 && (
          <section className="space-y-3 rounded-2xl border bg-white p-5">
            <h2 className="font-bold text-gray-900">Delivery Method</h2>

            {options.map((option) => (
              <button
                type="button"
                key={option.id}
                onClick={() => setMethod(option.id)}
                className={`w-full rounded-xl border-2 p-4 text-left transition-colors ${
                  method === option.id
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200"
                }`}
              >
                <p className="text-sm font-bold text-gray-900">
                  {option.icon} {option.title}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">{option.desc}</p>
              </button>
            ))}
          </section>
        )}

        <section className="space-y-4 rounded-2xl border bg-white p-5">
          <h2 className="font-bold text-gray-900">Order Summary</h2>

          {cart.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-sm text-gray-500">
                No products from this store are in your cart.
              </p>
              <a
                href="/marketplace/cart"
                className="mt-3 inline-block font-bold text-purple-700 hover:underline"
              >
                Return to marketplace cart
              </a>
            </div>
          ) : (
            cart.map((item) => {
              const key = `${item.merchant_id}:${item.product_id}`;
              const imageUrl = getImageUrl(item.image);
              const busy = busyItems.includes(key);

              return (
                <div
                  key={key}
                  className="flex items-center gap-3 border-b border-gray-100 pb-3"
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {imageUrl && (
                      <Image
                        src={imageUrl}
                        alt={item.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-gray-900">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">{money(item.price)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void changeQuantity(item, item.quantity - 1)}
                      className="h-7 w-7 rounded-full bg-gray-100 font-bold disabled:opacity-50"
                      aria-label={`Decrease ${item.name} quantity`}
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
                      className="h-7 w-7 rounded-full bg-gray-100 font-bold disabled:opacity-50"
                      aria-label={`Increase ${item.name} quantity`}
                    >
                      +
                    </button>
                  </div>

                  <span className="text-sm font-bold">
                    {money(item.price * item.quantity)}
                  </span>
                </div>
              );
            })
          )}

          <div className="space-y-2 border-t pt-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-bold">{money(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">
                {method === "DELIVERY"
                  ? "Delivery"
                  : method === "PICKUP"
                    ? "Pickup"
                    : "Neighbourhood delivery"}
              </span>
              <span className="font-bold">
                {shippingCost === 0 ? "FREE" : money(shippingCost)}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2 text-base font-extrabold">
              <span>Total</span>
              <span className="text-purple-700">{money(total)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void pay()}
            disabled={paying || loading || cart.length === 0}
            className="w-full rounded-xl bg-green-600 py-4 font-extrabold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {paying ? "Redirecting to payment…" : `Pay ${money(total)} securely`}
          </button>

          <p className="text-center text-xs text-gray-400">
            🔒 Payment is handled by your configured payment provider.
          </p>
        </section>
      </>
    )}
  </div>
</div>

);
}