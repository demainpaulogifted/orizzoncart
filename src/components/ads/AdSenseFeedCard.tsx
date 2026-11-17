'use client';

import { useEffect, useRef, useState } from 'react';

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
  const [adStatus, setAdStatus] = useState<
    'pending' | 'filled' | 'unfilled' | 'optimized'
  >('pending');

  useEffect(() => {
    const element = adRef.current;
    if (!element || element.dataset.adInitialized === 'true') return;

    const updateStatus = () => {
      const status = element.getAttribute('data-ad-status');

      if (status === 'filled') {
        setAdStatus('filled');
      } else if (status === 'unfilled') {
        setAdStatus('unfilled');
      } else if (status === 'unfill-optimized') {
        setAdStatus('optimized');
      }
    };

    const observer = new MutationObserver(updateStatus);

    observer.observe(element, {
      attributes: true,
      attributeFilter: ['data-ad-status'],
    });

    try {
      element.dataset.adInitialized = 'true';

      (window.adsbygoogle = window.adsbygoogle || []).push({});

      updateStatus();
    } catch (error) {
      console.warn('AdSense feed ad could not be initialized.', error);
      setAdStatus('unfilled');
    }

    return () => observer.disconnect();
  }, []);

  if (adStatus === 'unfilled') {
    return null;
  }

  const isVisible = adStatus === 'filled' || adStatus === 'optimized';

  return (
    <div
      className={`min-w-0 overflow-hidden ${isVisible ? 'rounded-xl border border-gray-200 bg-white' : ''} ${className}`}
      style={{
        minHeight: 0,
        display: 'block',
      }}
      aria-label={isVisible ? 'Sponsored advertisement' : undefined}
    >
      {isVisible && (
        <p className="px-2 pt-2 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
          Sponsored
        </p>
      )}

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
