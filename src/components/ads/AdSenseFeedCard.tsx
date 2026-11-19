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

  const [status, setStatus] = useState<
    'pending' | 'filled' | 'unfilled'
  >('pending');

  useEffect(() => {
    const element = adRef.current;

    if (!element || element.dataset.adInitialized === 'true') {
      return;
    }

    const updateStatus = () => {
      const googleStatus = element.getAttribute('data-ad-status');

      if (googleStatus === 'filled') {
        setStatus('filled');
      }

      if (googleStatus === 'unfilled') {
        setStatus('unfilled');
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
      console.warn('AdSense initialization failed:', error);
      setStatus('unfilled');
    }

    return () => observer.disconnect();
  }, []);

  if (status === 'unfilled') {
    return null;
  }

  return (
    <div
      className={
        status === 'pending'
          ? 'h-0 min-w-0 overflow-hidden invisible'
          : `min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white p-2 ${className}`
      }
      aria-label={status === 'filled' ? 'Sponsored advertisement' : undefined}
    >
      {status === 'filled' && (
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
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
