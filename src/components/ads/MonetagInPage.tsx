'use client';

import { useEffect, useRef } from 'react';

interface MonetagInPageProps {
  zoneId: string;
  className?: string;
  position?: 'top' | 'bottom' | 'inline';
}

export function MonetagInPage({ 
  zoneId, 
  className = '',
  position = 'inline'
}: MonetagInPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const script = document.createElement('script');
    script.dataset.zone = zoneId;
    script.src = 'https://nap5k.com/tag.min.js';
    script.async = true;
    
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [zoneId]);

  const positionStyles = {
    top: 'sticky top-0 z-30 mb-4',
    bottom: 'mt-6 mb-4',
    inline: 'my-6'
  };

  return (
    <div
      ref={containerRef}
      className={`monetag-inpage-ad ${className} ${positionStyles[position]}`}
      style={{
        minHeight: position === 'bottom' ? '100px' : '250px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="text-xs text-gray-400 text-center">
        Advertisement
      </div>
    </div>
  );
}