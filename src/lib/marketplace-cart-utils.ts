// src/lib/marketplace-cart-utils.ts

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  // Add other fields that exist in your current cart structure
}

export interface MerchantCart {
  slug: string;
  items: CartItem[];
  totalItems: number;
  storefrontUrl: string;
}

// Adjust this domain to match your actual storefront subdomain pattern
const STOREFRONT_DOMAIN = "orizzoncart.name.ng"; 

export function getAggregatedCarts(): MerchantCart[] {
  if (typeof window === "undefined") return [];

  const carts: MerchantCart[] = [];
  let grandTotal = 0;

  // 1. Scan all localStorage keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    
    // 2. Identify cart keys (assuming format: orz_cart_{slug})
    if (key && key.startsWith("orz_cart_")) {
      const slug = key.replace("orz_cart_", "");
      
      try {
        const rawCart = localStorage.getItem(key);
        if (rawCart) {
          const items: CartItem[] = JSON.parse(rawCart);
          
          // Calculate items for this specific merchant
          const merchantTotal = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
          grandTotal += merchantTotal;

          carts.push({
            slug,
            items,
            totalItems: merchantTotal,
            storefrontUrl: `https://${slug}.${STOREFRONT_DOMAIN}`, // Link to their store
          });
        }
      } catch (e) {
        console.error(`Error parsing cart for ${slug}`, e);
      }
    }
  }

  return carts;
}

export function getTotalCartCount(): number {
  const carts = getAggregatedCarts();
  return carts.reduce((sum, merchantCart) => sum + merchantCart.totalItems, 0);
}