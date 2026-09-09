'use client';
import { useState } from 'react';
import { ProductCard } from './ProductCard';
import { ProductModal } from './ProductModal';
import { CartDrawer } from './CartDrawer';
import { useCart } from './CartContext';

export function StoreShop({ merchant, products, isShowcaseMode }: { merchant: any; products: any[]; isShowcaseMode: boolean }) {
  const [selected, setSelected] = useState<any>(null);
  const { drawerOpen, setDrawerOpen } = useCart();

  return (
    <>
      <main id="shop" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-[var(--font-heading)] text-[var(--color-text)]">Featured Pieces</h2>
          <div className="w-16 h-0.5 bg-[var(--color-primary)] mx-auto mt-3" />
        </div>

        {products.length === 0 ? (
          <p className="text-center text-[var(--color-text-muted)] py-16">New arrivals coming soon.</p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-8">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} isShowcaseMode={isShowcaseMode} onClick={() => setSelected(product)} />
            ))}
          </div>
        )}
      </main>

      {selected && (
        <ProductModal product={selected} merchant={merchant} isShowcaseMode={isShowcaseMode} onClose={() => setSelected(null)} />
      )}

      <CartDrawer products={products} merchant={merchant} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}