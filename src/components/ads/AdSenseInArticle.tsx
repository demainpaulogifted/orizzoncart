'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface AdSenseInArticleProps {
  className?: string;
}

export default function AdSenseInArticle({
  className = '',
}: AdSenseInArticleProps) {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    const element = adRef.current;
    if (!element || element.dataset.adInitialized === 'true') return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      element.dataset.adInitialized = 'true';
    } catch (error) {
      console.warn('AdSense in-article ad could not be initialized.', error);
    }
  }, []);

  return (
    <div
      className={`my-12 min-w-0 overflow-hidden rounded-2xl border border-purple-100 bg-white p-3 shadow-sm ${className}`}
      aria-label="Advertisement"
    >
      <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-widest text-gray-500">
        Advertisements
      </p>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', textAlign: 'center' }}
        data-ad-layout="in-article"
        data-ad-format="fluid"
        data-ad-client="ca-pub-3957914903160068"
        data-ad-slot="7989882568"
      />
    </div>
  );
}
