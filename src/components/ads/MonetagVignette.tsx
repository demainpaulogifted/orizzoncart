'use client';

import { useEffect } from 'react';

interface MonetagVignetteProps {
  zoneId: string;
  storageKey: string;
  delay?: number;
  frequency?: number; // Show every N views (default: 1 = always on first view)
}

export function MonetagVignette({ 
  zoneId, 
  storageKey, 
  delay = 2000,
  frequency = 1 
}: MonetagVignetteProps) {
  useEffect(() => {
    // Check if we should show based on frequency
    const views = parseInt(sessionStorage.getItem(storageKey) || '0', 10);
    const shouldShow = views === 0 || ((views + 1) % frequency === 0);
    
    if (!shouldShow) return;

    // Increment view counter
    sessionStorage.setItem(storageKey, (views + 1).toString());

    // Load vignette after delay
    const timer = setTimeout(() => {
      const script = document.createElement('script');
      script.dataset.zone = zoneId;
      script.src = 'https://n6wxm.com/vignette.min.js';
      script.async = true;
      document.body.appendChild(script);
    }, delay);

    return () => clearTimeout(timer);
  }, [zoneId, storageKey, delay, frequency]);

  return null; // Vignette renders as overlay
}