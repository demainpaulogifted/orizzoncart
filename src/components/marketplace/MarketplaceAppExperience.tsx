'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function MarketplaceAppExperience() {
  const [deferred, setDeferred] = useState<any>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [tourDone, setTourDone] = useState<boolean>(() => {
    // Check if tour was already completed on a previous visit
    try {
      return localStorage.getItem('orz_market_tour_done') === '1';
    } catch {
      return true; // If localStorage fails, assume tour is done
    }
  });

  useEffect(() => {
    setIsIOS(/iphone|ipad|ipod/i.test(navigator.userAgent));
    setIsStandalone(
      window.matchMedia('(display-mode: standalone)').matches ||
        // @ts-expect-error iOS Safari
        window.navigator.standalone === true
    );

    const onPrompt = (e: any) => {
      e.preventDefault();
      setDeferred(e);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);

    // 🎯 Listen for the tour completion event
    const onTourDone = () => setTourDone(true);
    window.addEventListener('orz-market-tour-done', onTourDone);

    // Open install sheet when coming from dashboard (?install=1)
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
    // 🎯 Only show popup AFTER the tour is done
    if (!tourDone || isStandalone) return;

    // Bold popup after first visit (after tour); floating button on return visits
    const seen = sessionStorage.getItem('mkt_app_popup');
    let t: any;
    if (!seen) {
      t = setTimeout(() => setShowPopup(true), 2500); // 2.5s after tour finishes
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
    sessionStorage.setItem('mkt_app_popup', '1');
  }

  async function install() {
    if (isStandalone) {
      toast.success('Marketplace App is already installed');
      closePopup();
      return;
    }

    if (deferred) {
      deferred.prompt();
      try {
        const choice = await deferred.userChoice;
        if (choice?.outcome === 'accepted') {
          toast.success('Marketplace App installed!');
        }
      } catch {}
      closePopup();
      return;
    }

    // No native prompt — keep popup open so user can follow the steps
  }

  // Don't show anything if already running as installed app
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
              <h2 className="text-xl font-extrabold mt-3">Get OrizzonCart Marketplace</h2>
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
                onClick={install}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-extrabold rounded-xl shadow-lg"
              >
                📲 Install App Free
              </button>

              {/* Show steps when browser has no native install prompt */}
              {!deferred && (
                isIOS ? (
                  <ol className="text-left text-xs text-gray-600 space-y-1.5">
                    <li>1. Tap the <strong>Share</strong> button in Safari</li>
                    <li>2. Tap <strong>Add to Home Screen</strong></li>
                    <li>3. Tap <strong>Add</strong></li>
                  </ol>
                ) : (
                  <ol className="text-left text-xs text-gray-600 space-y-1.5">
                    <li>1. Open the browser menu (⋮ or ⋯)</li>
                    <li>2. Tap <strong>Install app</strong> or <strong>Add to Home screen</strong></li>
                    <li>3. Confirm to add Marketplace to your home screen</li>
                  </ol>
                )
              )}

              {isIOS && deferred && (
                <p className="text-[10px] text-gray-400 text-center">
                  iPhone: tap Share → &quot;Add to Home Screen&quot;
                </p>
              )}

              <button
                onClick={closePopup}
                className="w-full py-2 text-xs font-bold text-gray-400 hover:text-gray-600"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating install button (appears after popup is dismissed or on return visits) */}
      {showButton && !showPopup && (
        <button
          onClick={() => setShowPopup(true)}
          className="fixed right-3 bottom-20 z-[60] px-4 py-2.5 rounded-full bg-blue-600 text-white text-[11px] font-extrabold shadow-xl hover:bg-blue-700 border border-white/20"
        >
          📲 Install App
        </button>
      )}
    </>
  );
}