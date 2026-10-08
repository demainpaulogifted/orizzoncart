"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

function getCookie(name: string) {
  if (typeof document === "undefined") return 0;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? parseInt(match[2], 10) : 0;
}

export function MarketplaceCartButton({ active }: { active?: string }) {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      // 1. Read from the cross-subdomain cookie (most reliable)
      const cookieCount = getCookie("orz_cart_total");
      
      if (cookieCount > 0) {
        setCartCount(cookieCount);
      } else {
        // 2. Fallback: check localStorage (works if testing on exact same domain/port)
        let total = 0;
        if (typeof window !== "undefined") {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith("orz_cart_")) {
              try {
                const parsed = JSON.parse(localStorage.getItem(key) || "[]");
                const items = Array.isArray(parsed) ? parsed : (parsed.items || []);
                if (Array.isArray(items)) {
                  total += items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
                }
              } catch (e) {}
            }
          }
        }
        setCartCount(total);
      }
    };

    updateCount();
    window.addEventListener("storage", updateCount);
    window.addEventListener("cart-updated", updateCount);

    return () => {
      window.removeEventListener("storage", updateCount);
      window.removeEventListener("cart-updated", updateCount);
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
          <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 border border-white">
            {cartCount > 99 ? "99+" : cartCount}
          </span>
        )}
      </div>
      Cart
    </Link>
  );
}