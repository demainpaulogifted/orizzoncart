'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function MarketplaceAppExperience() {
  const [deferred, setDeferred] = useState<any>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isNativeApp, setIsNativeApp] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const capacitor = (window as any).Capacitor;
    const nativeApp = Boolean(
      capacitor?.isNativePlatform?.() ||
        (capacitor?.getPlatform && capacitor.getPlatform() !== 'web')
    );
    setIsNativeApp(nativeApp);
    if (nativeApp) return;

    // Force marketplace manifest (this is what made it work before)
    const link = document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null;
    if (link) {
      link.setAttribute('href', '/manifest-marketplace.json');
    } else {
      const l = document.createElement('link');
      l.rel = 'manifest';
      l.href = '/manifest-marketplace.json';
      document.head.appendChild(l);
    }

    setIsIOS(/iphone|ipad|ipod/i.test(navigator.userAgent));
    setIsStandalone(
      window.matchMedia('(display-mode: standalone)').matches ||
        // @ts-expect-error iOS
        window.navigator.standalone === true
    );

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .catch((err) => console.warn('SW register failed:', err));
    }

    const onPrompt = (e: any) => {
      e.preventDefault();
      setDeferred(e);
      // Show the popup as soon as the browser says we can install
      setShowPopup(true);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);

    // Fallback popup after a few seconds if the event never fires
    const seen = sessionStorage.getItem('mkt_app_popup');
    let t: any;
    if (!seen) {
      t = setTimeout(() => setShowPopup(true), 4000);
    } else {
      setShowButton(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      if (t) clearTimeout(t);
    };
  }, []);

  function closePopup() {
    setShowPopup(false);
    setShowButton(true);
    try {
      sessionStorage.setItem('mkt_app_popup', '1');
    } catch {}
  }

  async function install() {
    if (isStandalone) {
      toast.success('Marketplace App is already installed');
      closePopup();
      return;
    }

    if (deferred) {
      setInstalling(true);
      try {
        deferred.prompt();
        const choice = await deferred.userChoice;
        if (choice?.outcome === 'accepted') {
          toast.success('Marketplace App installed!');
          closePopup();
        } else {
          toast.message('Install cancelled');
        }
      } catch {
        toast.error('Could not open install prompt');
      } finally {
        setDeferred(null);
        setInstalling(false);
      }
      return;
    }

    // Fallback: direct user to browser install or APK
    if (isIOS) {
      toast.info('On iPhone: tap Share → Add to Home Screen');
    } else {
      // Try the APK as last resort for Android when PWA prompt is missing
      window.location.href = '/marketplace/download-app';
    }
  }

  if (isNativeApp || isStandalone) return null;

  return (
    <>
      {showPopup && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-br from-purple-700 to-blue-700 text-white p-6 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-white/20 flex items-center justify-center text-3xl">
                🛍️
              </div>
              <h2 className="text-xl font-extrabold mt-3">
                Get OrizzonCart Marketplace
              </h2>
              <p className="text-xs text-purple-100 mt-1">
                Install the app for faster shopping & order tracking
              </p>
            </div>
            <div className="p-5 space-y-3">
              <ul className="text-xs text-gray-600 space-y-1.5">
                <li>⚡ One-tap access to hundreds of verified stores</li>
                <li>📦 Track every order & tracking number in one place</li>
                <li>⚡ Flash deal alerts before they sell out</li>
              </ul>

              <button
                type="button"
                onClick={() => void install()}
                disabled={installing}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-extrabold rounded-xl shadow-lg disabled:opacity-70"
              >
                {installing
                  ? 'Opening install…'
                  : deferred
                    ? '📲 Install App Free'
                    : isIOS
                      ? '📲 How to install on iPhone'
                      : '📲 Install App Free'}
              </button>

              {!deferred && !isIOS && (
                <p className="text-[11px] text-center text-gray-500">
                  If the install dialog does not appear, the Android app will download instead.
                </p>
              )}

              {!deferred && isIOS && (
                <ol className="text-left text-xs text-gray-600 space-y-1.5 border-t pt-3">
                  <li>1. Tap the <strong>Share</strong> button</li>
                  <li>2. Tap <strong>Add to Home Screen</strong></li>
                  <li>3. Tap <strong>Add</strong></li>
                </ol>
              )}

              <button
                type="button"
                onClick={closePopup}
                className="w-full py-2 text-xs font-bold text-gray-400 hover:text-gray-600"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      )}

      {showButton && !showPopup && (
        <button
          type="button"
          onClick={() => setShowPopup(true)}
          className="fixed right-3 bottom-20 z-[60] px-4 py-2.5 rounded-full bg-blue-600 text-white text-[11px] font-extrabold shadow-xl hover:bg-blue-700 border border-white/20"
        >
          📲 Install App
        </button>
      )}
    </>
  );
}
