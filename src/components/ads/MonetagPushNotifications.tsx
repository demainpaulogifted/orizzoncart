'use client';

import { useEffect } from 'react';

interface MonetagPushNotificationsProps {
  zoneId: string;
}

export function MonetagPushNotifications({ zoneId }: MonetagPushNotificationsProps) {
  useEffect(() => {
    // Load push notifications script
    const script = document.createElement('script');
    script.src = `https://5gvci.com/act/files/tag.min.js?z=${zoneId}`;
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [zoneId]);

  return null;
}