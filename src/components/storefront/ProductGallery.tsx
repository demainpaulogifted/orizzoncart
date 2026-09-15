'use client';
import { useState } from 'react';
import Image from 'next/image';
import { FlyerCover, flyerColorKey } from '@/components/storefront/FlyerCover';

export function ProductGallery({ images, name, isDigital, category, coverColor }: any) {
  const [active, setActive] = useState(0);
  const urls = (images || []).map((i: any) => (typeof i === 'string' ? i : i.url)).filter(Boolean);

  if (urls.length === 0) {
    if (isDigital) {
      return (
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl shadow-sm">
          <FlyerCover title={name} category={category || 'Digital'} colorKey={coverColor || flyerColorKey(name)} className="w-full h-full" />
        </div>
      );
    }
    return (
      <div className="aspect-[4/5] w-full rounded-2xl bg-gray-100 flex items-center justify-center text-6xl">🛍️</div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-white shadow-sm">
        <Image
          src={urls[active]}
          alt={name}
          fill
          priority
          quality={85}
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      {urls.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {urls.map((u: string, i: number) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                i === active ? 'border-purple-600 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <Image src={u} alt={`${name} view ${i + 1}`} fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}