'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AdminSidebar({ role }: { role?: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const items = [
    { href: '/admin', icon: '👑', label: 'Overview' },
    { href: '/admin/businesses', icon: '🏢', label: 'Businesses' },
    { href: '/admin/verifications', icon: '⏳', label: 'Verify' },
    { href: '/admin/orders', icon: '📦', label: 'Orders' },
    { href: '/admin/blog', icon: '✍️', label: 'Blog' },
    { href: '/admin/settings/billing', icon: '💰', label: 'Billing' },
    { href: '/admin/themes', icon: '🎨', label: 'Themes' },
    { href: '/admin/keys', icon: '🔑', label: 'Keys' },
    { href: '/admin/team', icon: '👥', label: 'Team' },
    { href: '/admin/inbox', icon: '💬', label: 'Inbox' },
    { href: '/dashboard', icon: '📊', label: 'Dashboard' },
  ];

  return (
    <>
      {/* Top bar with hamburger */}
      <header className="fixed top-0 inset-x-0 z-40 h-14 bg-white border-b border-gray-200 flex items-center gap-3 px-4">
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="w-10 h-10 rounded-lg hover:bg-gray-100 flex flex-col items-center justify-center gap-1.5"
        >
          <span className="block w-5 h-0.5 bg-gray-800 rounded"></span>
          <span className="block w-5 h-0.5 bg-gray-800 rounded"></span>
          <span className="block w-5 h-0.5 bg-gray-800 rounded"></span>
        </button>
        <span className="font-extrabold text-gray-900">👑 Admin</span>
        {role && (
          <span className="text-[10px] font-bold uppercase bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
            {role}
          </span>
        )}
      </header>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-14 flex items-center justify-between px-4 border-b border-gray-100">
          <span className="font-extrabold text-gray-900">👑 Control Center</span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="w-9 h-9 rounded-lg hover:bg-gray-100 text-gray-500 text-lg"
          >
            ✕
          </button>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto">
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
        </nav>
      </aside>
    </>
  );
}