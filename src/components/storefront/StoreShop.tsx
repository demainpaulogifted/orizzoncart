'use client';

import { useState, useMemo } from 'react';
import ProductCard from './ProductCard';

// ⚠️ REPLACE THIS WITH YOUR ACTUAL MONETAG IN-PAGE ZONE ID

interface StoreShopProps {
  products: any[];
  merchant: any;
  isShowcaseMode?: boolean;
}

export function StoreShop({ products, merchant, isShowcaseMode = false }: StoreShopProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const storeSlug = merchant?.store_slug || '';

  const categories = useMemo(() => {
    const cats = new Set(products.map((p: any) => p.category).filter(Boolean));
    return ['All', ...Array.from(cats)];
  }, [products]);

  const filteredProducts = products.filter((p: any) => {
    const matchesCategory = category === 'All' || p.category === category;
    const matchesSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Show an in-content ad after every 4th product

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md py-3 -mx-4 px-4 border-b shadow-sm space-y-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-0 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all"
          />
        </div>

        {categories.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                  category === cat
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Grid with In-Content Ads */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.map((product: any, index: number) => (
          <div key={product.id}>
            <ProductCard
              product={{ ...product, store_slug: storeSlug }}
              isShowcaseMode={isShowcaseMode}
            />

          </div>
        ))}
      </div>
      
      {filteredProducts.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No products found matching your search.
        </div>
      )}
    </div>
  );
}
