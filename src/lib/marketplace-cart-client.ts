"use client";

export interface SharedCartItem {
  id: string;
  product_id: string;
  merchant_id: string;
  merchant_name: string;
  merchant_slug: string;
  name: string;
  price: number;
  image: unknown;
  is_digital: boolean;
  quantity: number;
  line_total: number;
}

type CartMethod = "GET" | "POST" | "PATCH" | "DELETE";

async function requestCart(
  method: CartMethod,
  body?: Record<string, unknown>
): Promise<SharedCartItem[]> {
  const response = await fetch("/api/marketplace-cart", {
    method,
    credentials: "include",
    cache: "no-store",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.error || "Cart request failed.");
  }

  const items = Array.isArray(result.items) ? result.items : [];

  // A read must not emit this event; mutations should.
  if (method !== "GET" && typeof window !== "undefined") {
    window.dispatchEvent(new Event("cart-updated"));
  }

  return items as SharedCartItem[];
}

export function getSharedCart(): Promise<SharedCartItem[]> {
  return requestCart("GET");
}

export function addSharedCartItem(
  slug: string,
  productId: string,
  quantity = 1
): Promise<SharedCartItem[]> {
  return requestCart("POST", {
    slug,
    product_id: productId,
    quantity,
  });
}

export function updateSharedCartItem(
  merchantId: string,
  productId: string,
  quantity: number
): Promise<SharedCartItem[]> {
  return requestCart("PATCH", {
    merchant_id: merchantId,
    product_id: productId,
    quantity,
  });
}

export function removeSharedCartItem(
  merchantId: string,
  productId: string
): Promise<SharedCartItem[]> {
  return requestCart("DELETE", {
    merchant_id: merchantId,
    product_id: productId,
  });
}

export function getSharedCartCount(items: SharedCartItem[]): number {
  return items.reduce(
    (total, item) => total + Math.max(0, Number(item.quantity) || 0),
    0
  );
}