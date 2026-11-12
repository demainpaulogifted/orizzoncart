'use client';

import { useEffect, useState } from 'react';

export function MarketplaceAppExperience() {
  const [isAndroid, setIsAndroid] = useState(false);
  const [isNativeApp, setIsNativeApp] = useState(false);

  useEffect(() => {
    const capacitor = (window as any).Capacitor;
    const nativeApp = Boolean(
      capacitor?.isNativePlatform?.() ||
      (capacitor?.getPlatform && capacitor.getPlatform() !== 'web')
    );

    setIsNativeApp(nativeApp);
    setIsAndroid(/android/i.test(navigator.userAgent));
  }, []);

  if (isNativeApp || !isAndroid) return null;

  return (
    <a
      href="/marketplace/download-app"
      className="fixed right-3 bottom-20 z-[60] px-4 py-2.5 rounded-full bg-blue-600 text-white text-[11px] font-extrabold shadow-xl hover:bg-blue-700 border border-white/20"
      aria-label="Download OrizzonCart Marketplace Android app"
    >
      Install App
    </a>
  );
}
