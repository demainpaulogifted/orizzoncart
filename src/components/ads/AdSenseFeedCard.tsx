'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface AdSenseFeedCardProps {
  className?: string;
}

export default function AdSenseFeedCard({
  className = '',
}: AdSenseFeedCardProps) {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    const element = adRef.current;
    if (!element || element.dataset.adInitialized === 'true') return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      element.dataset.adInitialized = 'true';
    } catch (error) {
      console.warn('AdSense feed ad could not be initialized.', error);
    }
  }, []);

  return (
    <div
      className={`min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white p-2 ${className}`}
      aria-label="Sponsored advertisement"
    >
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
        Sponsored
      </p>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-format="fluid"
        data-ad-layout-key="+1w+qt+2d+9-27"
        data-ad-client="ca-pub-3957914903160068"
        data-ad-slot="5848146405"
      />
    </div>
  );
}
