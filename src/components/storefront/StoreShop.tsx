'use client';
import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/storefront/ProductCard';
import { ProductModal } from '@/components/storefront/ProductModal';

export function StoreShop({ products, merchant, isShowcaseMode }: { products: any[]; merchant: any; isShowcaseMode: boolean }) {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle URL params for direct product view
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('add');
    if (productId && products.length > 0) {
      const product = products.find((p: any) => p.id === productId);
      if (product) {
        setSelectedProduct(product);
        setIsModalOpen(true);
        // Clean URL without reloading
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
      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product: any) => (
          <div key={product.id} onClick={() => handleProductClick(product)}>
            <ProductCard 
              product={{ ...product, store_slug: merchant?.store_slug }} 
              isShowcaseMode={isShowcaseMode} 
              onClick={() => handleProductClick(product)}
            />
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed">
          <p className="text-gray-500 font-medium">No products available yet.</p>
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