"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function MarketplaceCartButton({ active }: { active?: string }) {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      let total = 0;
      if (typeof window !== "undefined") {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          // Match your existing localStorage key pattern
          if (key && key.startsWith("orz_cart_")) {
            try {
              const parsed = JSON.parse(localStorage.getItem(key) || "{}");
              // Handle both array format [{}] and object format { items: [] }
              const items = Array.isArray(parsed) ? parsed : (parsed.items || []);
              
              if (Array.isArray(items)) {
                total += items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
              }
            } catch (e) {
              // Ignore parse errors for invalid JSON
            }
          }
        }
      }
      setCartCount(total);
    };

    // 1. Get initial count on mount
    updateCount();

    // 2. Listen for storage changes (e.g., user adds to cart on storefront subdomain and returns)
    window.addEventListener("storage", updateCount);
    
    // 3. Listen for custom event if cart is updated in the same tab
    window.addEventListener("cartUpdated", updateCount);

    return () => {
      window.removeEventListener("storage", updateCount);
      window.removeEventListener("cartUpdated", updateCount);
    };
  }, []);

  const isActive = active === "cart";
  const textColor = isActive ? "text-purple-600" : "text-gray-400";

  return (
    <Link 
      href="/marketplace/cart" 
      className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold relative ${textColor}`}
    >
      <div className="relative">
        <span className="text-lg leading-none">🛒</span>
        {cartCount > 0 && (
          <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 border border-white animate-in zoom-in-50">
            {cartCount > 99 ? "99+" : cartCount}
          </span>
        )}
      </div>
      Cart
    </Link>
  );
}