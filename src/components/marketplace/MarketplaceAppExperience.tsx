'use client';

import { useEffect, useState } from 'react';

export function MarketplaceAppExperience() {
  const [deferred, setDeferred] = useState<any>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    setIsIOS(/iphone|ipad|ipod/i.test(navigator.userAgent));

    const onPrompt = (e: any) => {
      e.preventDefault();
      setDeferred(e);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);

    // Bold popup ~8s after first visit; floating button on return visits
    const seen = sessionStorage.getItem('mkt_app_popup');
    let t: any;
    if (!seen) {
      t = setTimeout(() => setShowPopup(true), 8000);
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
    sessionStorage.setItem('mkt_app_popup', '1');
  }

  async function install() {
    if (deferred) {
      deferred.prompt();
      try {
        await deferred.userChoice;
      } catch {}
      closePopup();
    } else {
      closePopup();
    }
  }

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
              {isIOS && (
                <p className="text-[10px] text-gray-400 text-center">
                  iPhone: tap Share → "Add to Home Screen"
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

      {/* Floating download button (appears after popup is dismissed or on return visits) */}
      {showButton && !showPopup && (
        <button
          onClick={() => setShowPopup(true)}
          className="fixed right-3 bottom-20 z-[60] px-4 py-2.5 rounded-full bg-gray-900 text-white text-[11px] font-bold shadow-xl hover:bg-gray-700 border border-white/20"
        >
          📲 Get App
        </button>
      )}
    </>
  );
}