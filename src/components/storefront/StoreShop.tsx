'use client';
import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/storefront/ProductCard';
import { ProductModal } from '@/components/storefront/ProductModal';

interface StoreShopProps {
  products: any[];
  merchant: any;
  isShowcaseMode: boolean;
}

export function StoreShop({ products, merchant, isShowcaseMode }: StoreShopProps) {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  // Extract unique categories from products
  const categories = ['All', ...Array.from(new Set(products.map((p: any) => p.category || 'General')))];

  // Filter logic
  const filteredProducts = products.filter((p: any) => {
    const matchesCategory = category === 'All' || p.category === category;
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle URL params for direct product view
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('add');
    if (productId && products.length > 0) {
      const product = products.find((p: any) => p.id === productId);
      if (product) {
        setSelectedProduct(product);
        setIsModalOpen(true);
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [products]);

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* CUSTOMER SEARCH & FILTER BAR */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md py-3 -mx-4 px-4 border-b shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-100 border-0 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
            />
            <svg className="absolute left-3 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                  category === cat 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.map((product: any) => (
          <div key={product.id} onClick={() => handleProductClick(product)}>
            <ProductCard 
              product={{ ...product, store_slug: merchant?.store_slug }} 
              isShowcaseMode={isShowcaseMode} 
              onClick={() => handleProductClick(product)}
            />
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed">
          <p className="text-gray-500 font-medium">No products match your search.</p>
          <button onClick={() => {setSearch(''); setCategory('All');}} className="mt-2 text-sm text-purple-600 font-bold hover:underline">Clear filters</button>
        </div>
      )}

      {/* Product Modal */}
      <ProductModal 
        product={selectedProduct} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        storeSlug={merchant?.store_slug || ''}
      />
    </div>
  );
}