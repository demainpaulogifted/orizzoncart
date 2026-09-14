'use client';
import { useState, useEffect, useMemo } from 'react';
import { ProductCard } from '@/components/storefront/ProductCard';
import { ProductModal } from '@/components/storefront/ProductModal';

export function StoreShop({
  products,
  merchant,
  isShowcaseMode,
}: {
  products: any[];
  merchant: any;
  isShowcaseMode: boolean;
}) {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('All');

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) {
      if (p.category) set.add(p.category);
    }
    return ['All', ...Array.from(set).sort()];
  }, [products]);

  const visible = useMemo(() => {
    if (filter === 'All') return products;
    return products.filter((p) => p.category === filter);
  }, [products, filter]);

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
    <div id="shop" className="px-4 py-10 max-w-6xl mx-auto space-y-6">
      {/* Category tabs — only if at least one product has category */}
      {categories.length > 1 && (
        <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                filter === cat
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-text-muted)]/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {visible.map((product: any) => (
          <div key={product.id} onClick={() => handleProductClick(product)}>
            <ProductCard
              product={{ ...product, store_slug: merchant?.store_slug }}
              isShowcaseMode={isShowcaseMode}
              onClick={() => handleProductClick(product)}
            />
          </div>
        ))}
      </div>

      {visible.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed">
          <p className="text-gray-500 font-medium">
            {filter === 'All' ? 'No products available yet.' : `No products in “${filter}”.`}
          </p>
        </div>
      )}

      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        storeSlug={merchant?.store_slug || ''}
      />
    </div>
  );
}