'use client';

import { useEffect } from 'react';

interface MonetagReadingTimeVignetteProps {
  zoneId: string;
  triggerSeconds?: number; // Default: 60 seconds
}

export function MonetagReadingTimeVignette({ 
  zoneId, 
  triggerSeconds = 60 
}: MonetagReadingTimeVignetteProps) {
  useEffect(() => {
    const storageKey = `read_vignette_${zoneId}`;
    const hasSeen = sessionStorage.getItem(storageKey);
    
    // Don't show if they already saw it in this session
    if (hasSeen) return;

    const timer = setTimeout(() => {
      const script = document.createElement('script');
      script.dataset.zone = zoneId;
      script.src = 'https://n6wxm.com/vignette.min.js';
      script.async = true;
      document.body.appendChild(script);
      
      // Mark as seen for this session
      sessionStorage.setItem(storageKey, 'true');
    }, triggerSeconds * 1000);

    return () => clearTimeout(timer);
  }, [zoneId, triggerSeconds]);

  return null;
}
