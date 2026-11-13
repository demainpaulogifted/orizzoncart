'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function MarketplaceAppExperience() {
  const [isAndroid, setIsAndroid] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const android = /android/i.test(navigator.userAgent);
    setIsAndroid(android);

    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (standalone) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      setShowHelp(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) {
      setShowHelp(true);
      return;
    }

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;

    if (choice.outcome === 'accepted') {
      setInstallPrompt(null);
      setShowHelp(false);
    }
  };

  if (!isAndroid || isInstalled) return null;

  return (
    <div className="fixed right-3 bottom-20 z-[60] flex flex-col items-end gap-2">
      {showHelp && (
        <div className="w-72 rounded-2xl border border-gray-200 bg-white p-4 text-gray-900 shadow-2xl">
          <p className="text-sm font-extrabold">
            Install OrizzonCart Marketplace
          </p>
          <p className="mt-2 text-xs leading-5 text-gray-600">
            Open your browser menu (⋮) and select
            {' '}Install app or Add to Home screen.
            Follow the instructions to add the marketplace to your phone.
          </p>
          <button
            type="button"
            onClick={() => setShowHelp(false)}
            className="mt-3 text-xs font-bold text-purple-700"
          >
            Close
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={handleInstall}
        className="rounded-full border border-white/20 bg-purple-700 px-5 py-3 text-xs font-extrabold text-white shadow-xl hover:bg-purple-800"
        aria-label="Install OrizzonCart Marketplace"
      >
        Install Marketplace
      </button>
    </div>
  );
}
