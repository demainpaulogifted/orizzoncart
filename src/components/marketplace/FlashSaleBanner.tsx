'use client';

import { useEffect, useState } from 'react';

export function FlashSaleBanner() {
  const [left, setLeft] = useState('00:00:00');

  useEffect(() => {
    function tick() {
      const now = new Date();
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const diff = Math.max(0, end.getTime() - now.getTime());
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setLeft(
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      );
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 text-white rounded-2xl p-4 flex items-center justify-between shadow-lg">
      <div>
        <p className="font-extrabold text-lg leading-tight">⚡ Flash Deals</p>
        <p className="text-xs text-orange-100">Real discounts from verified Nigerian stores</p>
      </div>
      <div className="text-right">
        <p className="text-[10px] uppercase tracking-wider text-orange-100">Ends in</p>
        <p className="font-mono font-extrabold text-xl bg-black/25 rounded-lg px-2 py-1">{left}</p>
      </div>
    </div>
  );
}