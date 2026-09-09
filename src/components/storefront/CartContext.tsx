'use client';
import { createContext, useContext, useEffect, useState } from 'react';

export type CartItem = { product_id: string; quantity: number };
const CartContext = createContext<any>(null);

export function CartProvider({ storeSlug, children }: { storeSlug: string; children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem(`orz_cart_${storeSlug}`) || '[]')); } catch {}
  }, [storeSlug]);

  useEffect(() => {
    localStorage.setItem(`orz_cart_${storeSlug}`, JSON.stringify(items));
  }, [items, storeSlug]);

  const add = (id: string, qty = 1) =>
    setItems((prev) => {
      const ex = prev.find((i) => i.product_id === id);
      if (ex) return prev.map((i) => (i.product_id === id ? { ...i, quantity: i.quantity + qty } : i));
      return [...prev, { product_id: id, quantity: qty }];
    });

  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.product_id !== id));

  const setQty = (id: string, qty: number) =>
    qty <= 0 ? remove(id) : setItems((prev) => prev.map((i) => (i.product_id === id ? { ...i, quantity: qty } : i)));

  const clear = () => setItems([]);
  const count = items.reduce((a, i) => a + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, add, remove, setQty, clear, count, drawerOpen, setDrawerOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);