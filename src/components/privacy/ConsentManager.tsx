'use client';

import { useEffect, useState } from 'react';

type Preferences = {
  analytics: boolean;
  advertising: boolean;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

const COOKIE_NAME = 'orz_consent_v1';
const DEFAULTS: Preferences = {
  analytics: false,
  advertising: false,
};

function readPreferences(): Preferences | null {
  const item = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(COOKIE_NAME + '='));

  if (!item) return null;

  try {
    const value = JSON.parse(
      decodeURIComponent(item.slice(COOKIE_NAME.length + 1)),
    ) as Partial<Preferences> & { version?: number };

    if (value.version !== 1) return null;

    return {
      analytics: value.analytics === true,
      advertising: value.advertising === true,
    };
  } catch {
    return null;
  }
}

function savePreferences(preferences: Preferences) {
  const value = encodeURIComponent(
    JSON.stringify({
      ...preferences,
      version: 1,
      updatedAt: new Date().toISOString(),
    }),
  );

  const domain = location.hostname.endsWith('orizzoncart.com.ng')
    ? '; Domain=.orizzoncart.com.ng'
    : '';

  document.cookie =
    COOKIE_NAME +
    '=' +
    value +
    '; Path=/; Max-Age=15552000; SameSite=Lax; Secure' +
    domain;
}

function applyConsent(preferences: Preferences) {
  window.dataLayer = window.dataLayer || [];

  const gtag = (...args: unknown[]) => {
    window.dataLayer?.push(args);
  };

  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
  });

  gtag('consent', 'update', {
    ad_storage: preferences.advertising ? 'granted' : 'denied',
    ad_user_data: preferences.advertising ? 'granted' : 'denied',
    ad_personalization: preferences.advertising ? 'granted' : 'denied',
    analytics_storage: preferences.analytics ? 'granted' : 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
  });
}

function loadGoogleTagManager() {
  if (document.getElementById('google-tag-manager')) return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    'gtm.start': Date.now(),
    event: 'gtm.js',
  });

  const script = document.createElement('script');
  script.id = 'google-tag-manager';
  script.async = true;
  script.src =
    'https://www.googletagmanager.com/gtm.js?id=GTM-TDM43S9C';

  document.head.appendChild(script);
}

function loadAdSense() {
  if (document.getElementById('google-adsense')) return;

  const script = document.createElement('script');
  script.id = 'google-adsense';
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src =
    'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3957914903160068';

  document.head.appendChild(script);
}

export function ConsentManager({
  enableAnalytics,
  enableAds,
}: {
  enableAnalytics: boolean;
  enableAds: boolean;
}) {
  const [preferences, setPreferences] =
    useState<Preferences>(DEFAULTS);
  const [visible, setVisible] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = readPreferences();

    if (saved) {
      setPreferences(saved);
      applyConsent(saved);

      if (
        enableAnalytics &&
        (saved.analytics || saved.advertising)
      ) {
        loadGoogleTagManager();
      }

      if (enableAds && saved.advertising) {
        loadAdSense();
      }
    } else {
      applyConsent(DEFAULTS);
      setVisible(true);
    }

    setReady(true);
  }, [enableAnalytics, enableAds]);

  function choose(next: Preferences) {
    savePreferences(next);
    setPreferences(next);
    applyConsent(next);
    setVisible(false);
    setCustomizing(false);

    window.location.reload();
  }

  if (!ready) return null;

  return (
    <>
      {visible ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-consent-title"
          className="fixed inset-x-0 bottom-0 z-[100] border-t border-gray-200 bg-white p-4 shadow-2xl sm:p-6"
        >
          <div className="mx-auto max-w-5xl">
            <h2
              id="cookie-consent-title"
              className="text-lg font-bold text-gray-900"
            >
              Your privacy choices
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              OrizzonCart uses essential cookies for accounts,
              shopping carts and security. With your permission,
              we also use analytics and advertising technologies.
              Accept all, reject optional cookies, or choose
              separately. Read our{' '}
              <a
                className="font-semibold text-purple-700 underline"
                href="/privacy"
              >
                Privacy Policy
              </a>.
            </p>

            {customizing && (
              <div className="mt-4 grid gap-3 rounded-xl bg-gray-50 p-4 sm:grid-cols-3">
                <div>
                  <p className="font-semibold text-gray-900">
                    Essential
                  </p>
                  <p className="text-xs text-gray-600">
                    Required for core site functions.
                  </p>
                  <span className="mt-2 inline-block text-xs font-semibold text-green-700">
                    Always on
                  </span>
                </div>

                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(event) =>
                      setPreferences((current) => ({
                        ...current,
                        analytics: event.target.checked,
                      }))
                    }
                    className="mt-1 accent-purple-700"
                  />
                  <span>
                    <span className="block font-semibold text-gray-900">
                      Analytics
                    </span>
                    <span className="block text-xs text-gray-600">
                      Helps us understand site usage and improve
                      the service.
                    </span>
                  </span>
                </label>

                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={preferences.advertising}
                    onChange={(event) =>
                      setPreferences((current) => ({
                        ...current,
                        advertising: event.target.checked,
                      }))
                    }
                    className="mt-1 accent-purple-700"
                  />
                  <span>
                    <span className="block font-semibold text-gray-900">
                      Advertising
                    </span>
                    <span className="block text-xs text-gray-600">
                      Allows Google AdSense advertising
                      technologies.
                    </span>
                  </span>
                </label>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  choose({
                    analytics: true,
                    advertising: true,
                  })
                }
                className="rounded-lg bg-purple-700 px-4 py-2.5 text-sm font-semibold text-white"
              >
                Accept all
              </button>

              <button
                type="button"
                onClick={() => choose(DEFAULTS)}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-800"
              >
                Reject optional
              </button>

              {customizing ? (
                <button
                  type="button"
                  onClick={() => choose(preferences)}
                  className="rounded-lg border border-purple-300 px-4 py-2.5 text-sm font-semibold text-purple-800"
                >
                  Save my choices
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setCustomizing(true)}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-800"
                >
                  Choose settings
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            setPreferences(readPreferences() || DEFAULTS);
            setCustomizing(true);
            setVisible(true);
          }}
          className="fixed bottom-3 left-3 z-[90] rounded-full border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-lg"
        >
          Cookie settings
        </button>
      )}
    </>
  );
}
