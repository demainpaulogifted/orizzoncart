'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

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
  const pathname = usePathname();
  const router = useRouter();

  const items = [
    { href: '/dashboard', icon: '📊', label: 'Home' },
    { href: '/dashboard/products', icon: '📦', label: 'Products' },
    { href: '/dashboard/orders', icon: '🛒', label: 'Orders' },
    { href: '/dashboard/marketing', icon: '📣', label: 'Marketing' },
    { href: '/dashboard/support', icon: '💬', label: 'Help' },
    { href: '/dashboard/settings', icon: '⚙️', label: 'Settings' },
    { href: '/dashboard/settings/notifications', icon: '🔔', label: 'Notify' },
  ];

  if (isAdmin) items.push({ href: '/admin', icon: '👑', label: 'Admin' });

  const external = [
    { href: '/marketplace', icon: '🏪', label: 'Marketplace' },
    { href: `/store/${merchant?.store_slug}`, icon: '👀', label: 'View My Store' },
  ];

  // 🏪 Switch the active store for this account
  function switchStore(id: string) {
    document.cookie = `active_merchant_id=${id}; path=/; max-age=31536000`;
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      {/* Slim top bar with hamburger + store switcher trigger */}
      <header className="fixed top-0 inset-x-0 z-40 h-14 bg-white border-b border-gray-200 flex items-center gap-3 px-4">
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="w-10 h-10 rounded-lg hover:bg-gray-100 flex flex-col items-center justify-center gap-1.5 shrink-0"
        >
          <span className="block w-5 h-0.5 bg-gray-800 rounded"></span>
          <span className="block w-5 h-0.5 bg-gray-800 rounded"></span>
          <span className="block w-5 h-0.5 bg-gray-800 rounded"></span>
        </button>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 min-w-0 hover:opacity-80"
          aria-label="Switch store"
        >
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 text-white flex items-center justify-center text-sm font-extrabold shrink-0">
            O
          </span>
          <span className="font-extrabold text-gray-900 truncate">
            {merchant?.store_name || 'OrizzonCart'}
          </span>
          {(merchants?.length || 0) > 1 && (
            <span className="text-gray-400 text-xs shrink-0">⌄</span>
          )}
        </button>
      </header>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-in drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-200 flex flex-col ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-14 flex items-center justify-between px-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 text-white flex items-center justify-center text-sm font-extrabold shrink-0">
              O
            </span>
            <span className="font-extrabold text-gray-900 truncate">
              {merchant?.store_name || 'My Store'}
            </span>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="w-9 h-9 rounded-lg hover:bg-gray-100 text-gray-500 text-lg shrink-0"
          >
            ✕
          </button>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto flex-1">
          {items.map((it) => {
            const active = pathname === it.href;
            return (
              <Link
                key={it.href}
                href={it.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                  active
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-purple-50 hover:text-purple-700'
                }`}
              >
                <span className="text-base leading-none">{it.icon}</span>
                {it.label}
              </Link>
            );
          })}

          {/* 🏪 YOUR STORES — switch or create */}
          <div className="pt-3 mt-3 border-t border-gray-100">
            <p className="px-3 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
              Your Stores ({merchants?.length || 1})
            </p>
            {(merchants || []).map((m: any) => {
              const isActive = m.id === merchant?.id;
              return (
                <button
                  key={m.id}
                  onClick={() => switchStore(m.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                    isActive
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 text-white text-xs font-extrabold flex items-center justify-center shrink-0">
                    {m.store_name?.[0]?.toUpperCase() || 'S'}
                  </span>
                  <span className="truncate flex-1 text-left">{m.store_name}</span>
                  {isActive && <span className="text-green-600 text-xs shrink-0">✓ active</span>}
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

          {/* External links (same tab to preserve session) */}
          <div className="pt-3 mt-3 border-t border-gray-100 space-y-1">
            {external.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-purple-50 hover:text-purple-700 transition-colors"
              >
                <span className="text-base leading-none">{it.icon}</span>
                {it.label}
              </Link>
            ))}
          </div>
        </nav>
      </aside>
    </>
  );
}