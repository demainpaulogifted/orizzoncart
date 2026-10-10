'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function DashboardSidebar({
  merchant,
  merchants,
  isAdmin,
}: {
  merchant: any;
  merchants?: any[];
  isAdmin?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installSheet, setInstallSheet] = useState<'merchant' | 'marketplace' | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setIsIOS(/iphone|ipad|ipod/i.test(navigator.userAgent));
    setIsStandalone(
      window.matchMedia('(display-mode: standalone)').matches ||
        // @ts-expect-error iOS Safari
        window.navigator.standalone === true
    );

    const onPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  async function installMerchantApp() {
    if (isStandalone) {
      toast.success('Merchant App is already installed on this device');
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      try {
        const choice = await deferredPrompt.userChoice;
        if (choice?.outcome === 'accepted') {
          toast.success('Merchant App installed!');
        }
      } catch {
        /* dismissed */
      }
      setDeferredPrompt(null);
      return;
    }

    setInstallSheet('merchant');
  }

  function openMarketplaceInstall() {
    if (isStandalone) {
      window.open('/marketplace', '_blank');
      return;
    }
    setInstallSheet('marketplace');
  }

  const items = [
    { href: '/dashboard', icon: '📊', label: 'Home' },
    { href: '/dashboard/products', icon: '📦', label: 'Products' },
    { href: '/dashboard/orders', icon: '🛒', label: 'Orders' },
    { href: '/dashboard/marketing', icon: '📣', label: 'Marketing' },
    { href: '/dashboard/support', icon: '💬', label: 'Help' },
    { href: '/dashboard/settings', icon: '⚙️', label: 'Settings' },
    {
      href: '/dashboard/settings/notifications',
      icon: '🔔',
      label: 'Notify',
    },
  ];

  if (isAdmin) {
    items.push({
      href: '/admin',
      icon: '👑',
      label: 'Admin',
    });
  }

  const external = [
    { href: '/marketplace', icon: '🏪', label: 'Marketplace' },
    {
      href: merchant?.store_slug
        ? `/store/${merchant.store_slug}`
        : '/dashboard',
      icon: '👀',
      label: 'View My Store',
    },
  ];

  function switchStore(id: string) {
    if (!id || id === merchant?.id || switching) {
      setOpen(false);
      return;
    }

    setSwitching(true);
    setOpen(false);

    document.cookie =
      `active_merchant_id=${encodeURIComponent(id)}; path=/; max-age=31536000; SameSite=Lax`;

    router.refresh();
  }

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-40 h-14 bg-white border-b border-gray-200 flex items-center gap-2 sm:gap-3 px-3 sm:px-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="w-10 h-10 rounded-lg hover:bg-gray-100 flex flex-col items-center justify-center gap-1.5 shrink-0"
        >
          <span className="block w-5 h-0.5 bg-gray-800 rounded" />
          <span className="block w-5 h-0.5 bg-gray-800 rounded" />
          <span className="block w-5 h-0.5 bg-gray-800 rounded" />
        </button>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 min-w-0 flex-1 hover:opacity-80"
          aria-label="Switch store"
        >
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 text-white flex items-center justify-center text-sm font-extrabold shrink-0">
            {(merchant?.store_name?.[0] || 'O').toUpperCase()}
          </span>

          <span className="font-extrabold text-gray-900 truncate">
            {switching
              ? 'Switching store...'
              : merchant?.store_name || 'OrizzonCart'}
          </span>

          {(merchants?.length || 0) > 1 && (
            <span className="text-gray-400 text-xs shrink-0">⌄</span>
          )}
        </button>

        {/* Top-right: Install App CTAs */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
          <button
            type="button"
            onClick={() => void installMerchantApp()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 px-2.5 py-1.5 text-[11px] sm:text-xs font-extrabold text-purple-700 shadow-sm hover:bg-purple-100 active:scale-95 transition"
            title="Install Merchant App to Home Screen"
          >
            <span className="text-sm leading-none">📲</span>
            <span className="hidden sm:inline">Install Merchant</span>
            <span className="sm:hidden">Merchant</span>
          </button>
          <button
            type="button"
            onClick={openMarketplaceInstall}
            className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-[11px] sm:text-xs font-extrabold text-blue-700 shadow-sm hover:bg-blue-100 active:scale-95 transition"
            title="Install Marketplace App to Home Screen"
          >
            <span className="text-sm leading-none">🏪</span>
            <span className="hidden sm:inline">Install Market</span>
            <span className="sm:hidden">Market</span>
          </button>
        </div>
      </header>

      {/* Install instructions sheet */}
      {installSheet && (
        <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white shadow-2xl overflow-hidden">
            <div
              className={`p-5 text-center text-white ${
                installSheet === 'merchant'
                  ? 'bg-gradient-to-br from-purple-600 to-violet-700'
                  : 'bg-gradient-to-br from-blue-600 to-indigo-700'
              }`}
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-3xl">
                {installSheet === 'merchant' ? '📲' : '🏪'}
              </div>
              <h2 className="mt-3 text-lg font-extrabold">
                {installSheet === 'merchant'
                  ? 'Install Merchant App'
                  : 'Install Marketplace App'}
              </h2>
              <p className="mt-1 text-xs text-white/80">
                {installSheet === 'merchant'
                  ? 'Manage orders & products from your home screen'
                  : 'Shop verified stores & track orders as an app'}
              </p>
            </div>

            <div className="space-y-3 p-5">
              {isIOS ? (
                <ol className="space-y-2 text-left text-sm text-gray-700">
                  <li className="flex gap-2">
                    <span className="font-extrabold text-purple-600">1.</span>
                    <span>
                      Tap the <strong>Share</strong> button in Safari (square with arrow)
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-extrabold text-purple-600">2.</span>
                    <span>
                      Scroll and tap <strong>Add to Home Screen</strong>
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-extrabold text-purple-600">3.</span>
                    <span>
                      Tap <strong>Add</strong> — the app icon will appear on your home screen
                    </span>
                  </li>
                </ol>
              ) : (
                <ol className="space-y-2 text-left text-sm text-gray-700">
                  <li className="flex gap-2">
                    <span className="font-extrabold text-purple-600">1.</span>
                    <span>Open the browser menu (⋮ or ⋯)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-extrabold text-purple-600">2.</span>
                    <span>
                      Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-extrabold text-purple-600">3.</span>
                    <span>Confirm — the app opens full-screen like a native app</span>
                  </li>
                </ol>
              )}

              {installSheet === 'marketplace' && (
                <Link
                  href="/marketplace"
                  onClick={() => setInstallSheet(null)}
                  className="block w-full rounded-xl bg-blue-600 py-3 text-center text-sm font-extrabold text-white hover:bg-blue-700"
                >
                  Open Marketplace → then install
                </Link>
              )}

              {installSheet === 'merchant' && deferredPrompt && (
                <button
                  type="button"
                  onClick={() => {
                    setInstallSheet(null);
                    void installMerchantApp();
                  }}
                  className="block w-full rounded-xl bg-purple-600 py-3 text-center text-sm font-extrabold text-white hover:bg-purple-700"
                >
                  📲 Install now
                </button>
              )}

              <button
                type="button"
                onClick={() => setInstallSheet(null)}
                className="w-full py-2 text-xs font-bold text-gray-400 hover:text-gray-600"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-200 flex flex-col ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-14 flex items-center justify-between px-4 border-b border-gray-100 shrink-0">
          <span className="font-extrabold text-gray-900 truncate">
            {merchant?.store_name || 'My Store'}
          </span>

          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="w-9 h-9 rounded-lg hover:bg-gray-100 text-gray-500 text-lg shrink-0"
          >
            ✕
          </button>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto flex-1">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                pathname === item.href
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-purple-50 hover:text-purple-700'
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          ))}

          <div className="pt-3 mt-3 border-t border-gray-100">
            <p className="px-3 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
              Your Stores ({merchants?.length || 0})
            </p>

            {(merchants || []).map((store: any) => {
              const isActive = store.id === merchant?.id;

              return (
                <button
                  key={store.id}
                  type="button"
                  disabled={switching}
                  onClick={() => switchStore(store.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-60 ${
                    isActive
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 text-white text-xs font-extrabold flex items-center justify-center shrink-0">
                    {(store.store_name?.[0] || 'S').toUpperCase()}
                  </span>
                  <span className="truncate flex-1 text-left">{store.store_name}</span>
                  {isActive && (
                    <span className="text-green-600 text-xs shrink-0">✓ Active</span>
                  )}
                </button>
              );
            })}

            <Link
              href="/onboarding"
              onClick={() => setOpen(false)}
              className="mt-2 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-dashed border-purple-300 text-purple-700 text-sm font-extrabold hover:bg-purple-50 transition-colors"
            >
              ＋ Create New Store
            </Link>
          </div>

          <div className="pt-3 mt-3 border-t border-gray-100 space-y-1">
            {external.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-purple-50 hover:text-purple-700 transition-colors"
              >
                <span className="text-base leading-none">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </aside>
    </>
  );
}