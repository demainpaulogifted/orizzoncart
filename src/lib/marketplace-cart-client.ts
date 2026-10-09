
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

async function requestCart(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  body?: Record<string, unknown>
): Promise<SharedCartItem[]> {
  const response = await fetch("/api/marketplace-cart", {
    method,
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Cart request failed.");
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("cart-updated"));
  }

  return result.items || [];
}

export function getSharedCart() {
  return requestCart("GET");
}

export function addSharedCartItem(
  slug: string,
  productId: string,
  quantity = 1
) {
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
) {
  return requestCart("PATCH", {
    merchant_id: merchantId,
    product_id: productId,
    quantity,
  });
}

export function removeSharedCartItem(
  merchantId: string,
  productId: string
) {
  return requestCart("DELETE", {
    merchant_id: merchantId,
    product_id: productId,
  });
}

export function getSharedCartCount(items: SharedCartItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}
