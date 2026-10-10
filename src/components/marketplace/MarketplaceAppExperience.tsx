'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function MarketplaceAppExperience() {
  const [deferred, setDeferred] = useState<any>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [tourDone, setTourDone] = useState<boolean>(() => {
    try {
      return localStorage.getItem('orz_market_tour_done') === '1';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    setIsIOS(/iphone|ipad|ipod/i.test(navigator.userAgent));
    setIsStandalone(
      window.matchMedia('(display-mode: standalone)').matches ||
        // @ts-expect-error iOS Safari
        window.navigator.standalone === true
    );

    // Register service worker — required for Chrome install prompt
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .catch((err) => console.warn('SW register failed:', err));
    }

    const onPrompt = (e: any) => {
      e.preventDefault();
      setDeferred(e);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);

    const onTourDone = () => setTourDone(true);
    window.addEventListener('orz-market-tour-done', onTourDone);

    // From dashboard: /marketplace?install=1
    const params = new URLSearchParams(window.location.search);
    if (params.get('install') === '1') {
      setTourDone(true);
      setShowPopup(true);
      const url = new URL(window.location.href);
      url.searchParams.delete('install');
      window.history.replaceState({}, '', url.pathname + url.search);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('orz-market-tour-done', onTourDone);
    };
  }, []);

  useEffect(() => {
    if (!tourDone || isStandalone) return;

    const seen = sessionStorage.getItem('mkt_app_popup');
    let t: any;
    if (!seen) {
      t = setTimeout(() => setShowPopup(true), 2500);
    } else {
      setShowButton(true);
    }

    return () => {
      if (t) clearTimeout(t);
    };
  }, [tourDone, isStandalone]);

  function closePopup() {
    setShowPopup(false);
    setShowButton(true);
    try {
      sessionStorage.setItem('mkt_app_popup', '1');
    } catch {
      /* ignore */
    }
  }

  async function install() {
    if (isStandalone) {
      toast.success('Marketplace App is already installed');
      closePopup();
      return;
    }

    // Native install prompt available (Chrome / Edge / Android)
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

    // No prompt yet — try re-registering SW, then guide user
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/sw.js');
      } catch {
        /* ignore */
      }
    }

    if (isIOS) {
      toast.info('On iPhone: tap Share → Add to Home Screen');
    } else {
      toast.info(
        'Use the browser menu (⋮) → Install app / Add to Home screen'
      );
    }
  }

  if (isStandalone) return null;

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

              {/* Always show steps when native prompt is not ready */}
              {!deferred && (
                isIOS ? (
                  <ol className="text-left text-xs text-gray-600 space-y-1.5 border-t pt-3">
                    <li>
                      1. Tap the <strong>Share</strong> button (square with arrow)
                    </li>
                    <li>
                      2. Scroll and tap <strong>Add to Home Screen</strong>
                    </li>
                    <li>
                      3. Tap <strong>Add</strong>
                    </li>
                  </ol>
                ) : (
                  <ol className="text-left text-xs text-gray-600 space-y-1.5 border-t pt-3">
                    <li>
                      1. Tap the browser menu <strong>⋮</strong> (top right)
                    </li>
                    <li>
                      2. Tap <strong>Install app</strong> or{' '}
                      <strong>Add to Home screen</strong>
                    </li>
                    <li>3. Confirm — Marketplace opens like an app</li>
                  </ol>
                )
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