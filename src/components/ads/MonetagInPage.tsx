'use client';

import { useEffect, useRef } from 'react';

interface MonetagInPageProps {
  zoneId: string;
  className?: string;
}

export function MonetagInPage({ zoneId, className = '' }: MonetagInPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !zoneId) return;

    // Clear previous script to prevent duplicates on re-render
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    // Monetag In-Page script structure
    script.src = `//pl24859737.revenuecpmgate.com/inpage.js?z=${zoneId}`; 
    
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [zoneId]);

  return <div ref={containerRef} className={className} />;
}
