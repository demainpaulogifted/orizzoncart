'use client';

import { useMemo, useState } from 'react';

function normalizeImages(images: unknown): string[] {
  if (!Array.isArray(images)) return [];
  return images
    .map((img: any) => {
      if (!img) return '';
      if (typeof img === 'string') return img;
      return String(img.url || img.src || '');
    })
    .filter(Boolean);
}

export function ProductImageGallery({
  images,
  alt,
}: {
  images: unknown;
  alt: string;
}) {
  const list = useMemo(() => normalizeImages(images), [images]);
  const [index, setIndex] = useState(0);

  if (!list.length) {
    return (
      <div className="aspect-square bg-gray-100 flex items-center justify-center text-5xl text-gray-300">
        📦
      </div>
    );
  }

  const current = list[Math.min(index, list.length - 1)];

  function prev() {
    setIndex((i) => (i - 1 + list.length) % list.length);
  }

  function next() {
    setIndex((i) => (i + 1) % list.length);
  }

  return (
    <div className="relative aspect-square bg-gray-100">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={current}
        alt={alt}
        className="w-full h-full object-cover"
        onClick={next}
      />

      {list.length > 1 ? (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 text-white text-lg"
            aria-label="Previous image"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 text-white text-lg"
            aria-label="Next image"
          >
            ›
          </button>

          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
            {list.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={
                  'w-2 h-2 rounded-full ' +
                  (i === index ? 'bg-white' : 'bg-white/50')
                }
                aria-label={'Image ' + (i + 1)}
              />
            ))}
          </div>

          <div className="absolute top-2 right-2 text-[10px] font-bold bg-black/45 text-white rounded-full px-2 py-0.5">
            {index + 1}/{list.length}
          </div>
        </>
      ) : null}
    </div>
  );
}
