"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAggregatedCarts, type MerchantCart } from "@/lib/marketplace-cart-utils";
import { ShoppingBag, ExternalLink, ArrowLeft } from "lucide-react";

export default function MarketplaceCartPage() {
  const [carts, setCarts] = useState<MerchantCart[]>([]);

  useEffect(() => {
    // Load carts on client side
    setCarts(getAggregatedCarts());
  }, []);

  const totalItems = carts.reduce((sum, c) => sum + c.totalItems, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/marketplace" className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Your Carts</h1>
            <p className="text-sm text-gray-500">
              {totalItems} {totalItems === 1 ? "item" : "items"} across {carts.length} {carts.length === 1 ? "store" : "stores"}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {carts.length === 0 ? (
          // Empty State
          <div className="text-center py-20">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={32} className="text-gray-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Start exploring the marketplace to add items.</p>
            <Link 
              href="/marketplace" 
              className="bg-purple-600 text-white px-6 py-3 rounded-full font-medium hover:bg-purple-700 transition"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          // List of Merchant Carts
          <div className="space-y-4">
            {carts.map((merchantCart) => (
              <div key={merchantCart.slug} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Merchant Header */}
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🏪</span>
                    <h3 className="font-semibold text-gray-800 capitalize">{merchantCart.slug.replace(/-/g, " ")}</h3>
                  </div>
                  <span className="text-sm font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                    {merchantCart.totalItems} {merchantCart.totalItems === 1 ? "item" : "items"}
                  </span>
                </div>

                {/* Items Preview */}
                <div className="p-4 space-y-3">
                  {merchantCart.items.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                        <span className="text-gray-700 truncate max-w-[200px]">{item.name}</span>
                      </div>
                      <span className="text-gray-500">× {item.quantity}</span>
                    </div>
                  ))}
                  {merchantCart.items.length > 3 && (
                    <p className="text-xs text-gray-400 pl-4">
                      + {merchantCart.items.length - 3} more item(s)
                    </p>
                  )}
                </div>

                {/* Action Button */}
                <div className="p-4 border-t border-gray-100">
                  <Link
                    href={merchantCart.storefrontUrl}
                    target="_blank"
                    className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-2.5 rounded-lg font-medium hover:bg-purple-700 transition"
                  >
                    Go to {merchantCart.slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())} Cart
                    <ExternalLink size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ✅ ADDED: Track Past Orders Section */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Already purchased something?</h3>
          <p className="text-xs text-gray-500 mb-4">
            Enter the email you used at checkout to track your orders and get tracking numbers.
          </p>
          <Link 
            href="/marketplace/orders" 
            className="inline-flex items-center gap-2 text-purple-600 font-semibold text-sm hover:text-purple-700 hover:underline"
          >
            <span>📦</span> Track Past Orders by Email
          </Link>
        </div>
      </main>
    </div>
  );
}