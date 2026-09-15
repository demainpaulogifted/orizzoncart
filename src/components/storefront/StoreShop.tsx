'use client';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ProductCard } from '@/components/storefront/ProductCard';

interface StoreShopProps {
  products: any[];
  merchant: any;
  isShowcaseMode: boolean;
}

export function StoreShop({ products, merchant, isShowcaseMode }: StoreShopProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const storeSlug = merchant?.store_slug || '';

  const categories = ['All', ...Array.from(new Set(products.map((p: any) => p.category).filter(Boolean)))];

  const filteredProducts = products.filter((p: any) => {
    const matchesCategory = category === 'All' || p.category === category;
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (id: string) => {
    const key = `orz_cart_${storeSlug}`;
    let cart: any[] = [];
    try { cart = JSON.parse(localStorage.getItem(key) || '[]'); } catch {}
    const found = cart.find((c) => c.product_id === id);
    if (found) found.quantity += 1;
    else cart.push({ product_id: id, quantity: 1 });
    localStorage.setItem(key, JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-updated'));
    toast.success('Added to cart 🛒');
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('add');
    if (productId && products.length > 0) {
      const exists = products.find((p: any) => p.id === productId);
      if (exists) {
        addToCart(productId);
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md py-3 -mx-4 px-4 border-b shadow-sm space-y-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-0 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all"
          />
          <svg className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>

        {categories.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                  category === cat ? 'bg-purple-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.map((product: any) => (
          <ProductCard
            key={product.id}
            product={{ ...product, store_slug: storeSlug }}
            isShowcaseMode={isShowcaseMode}
          />
        ))}
      </div>

      {filteredProducts.length === 0 && products.length > 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed">
          <p className="text-gray-500 font-medium">No products match your search.</p>
          <button onClick={() => { setSearch(''); setCategory('All'); }} className="mt-2 text-sm text-purple-600 font-bold hover:underline">
            Clear filters
          </button>
        </div>
      )}

      {products.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed">
          <p className="text-gray-500 font-medium">No products available yet.</p>
        </div>
      )}
    </div>
  );
}