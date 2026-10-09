"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export function MarketplaceCartButton({
  active,
}: {
  active?: string;
}) {
  const [cartCount, setCartCount] = useState(0);

  const updateCount = useCallback(async () => {
    try {
      const response = await fetch("/api/marketplace-cart", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) return;

      const result = await response.json();
      const items = Array.isArray(result.items) ? result.items : [];

      const total = items.reduce(
        (sum: number, item: { quantity?: number }) =>
          sum + Math.max(0, Number(item.quantity) || 0),
        0
      );

      setCartCount(total);
    } catch (error) {
      console.error("Could not refresh marketplace cart badge:", error);
    }
  }, []);

  useEffect(() => {
    void updateCount();

    const handleCartUpdated = () => {
      void updateCount();
    };

    window.addEventListener("cart-updated", handleCartUpdated);

    return () => {
      window.removeEventListener("cart-updated", handleCartUpdated);
    };
  }, [updateCount]);

  const isActive = active === "cart";
  const textColor = isActive
    ? "text-purple-600"
    : "text-gray-400";

  return (
    <Link
      href="/marketplace/cart"
      aria-label={`Cart, ${cartCount} items`}
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