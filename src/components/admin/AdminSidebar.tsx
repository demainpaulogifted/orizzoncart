'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const allItems = [
  { name: 'Overview', href: '/admin', icon: '👑', grad: 'from-amber-400 to-yellow-600', adminOnly: true },
  { name: 'Businesses', href: '/admin/businesses', icon: '🏪', grad: 'from-blue-400 to-indigo-600', adminOnly: true },
  { name: 'Billing', href: '/admin/settings/billing', icon: '💰', grad: 'from-green-400 to-emerald-600', adminOnly: true },
  { name: 'Themes', href: '/admin/settings/themes', icon: '🎨', grad: 'from-fuchsia-400 to-purple-600', adminOnly: true },
  { name: 'Keys', href: '/admin/settings/payments', icon: '🔑', grad: 'from-red-400 to-rose-600', adminOnly: true },
  { name: 'Team', href: '/admin/team', icon: '🧑‍🤝‍🧑', grad: 'from-teal-400 to-cyan-600', adminOnly: true },
  { name: 'Inbox', href: '/admin/support', icon: '💬', grad: 'from-cyan-400 to-blue-600', adminOnly: false },
  { name: 'Dashboard', href: '/dashboard', icon: '📊', grad: 'from-slate-500 to-slate-700', adminOnly: false },
];

export function AdminSidebar({ role }: { role?: string }) {
  const pathname = usePathname();
  const items = allItems.filter((i) => !i.adminOnly || role === 'platform_admin');
  const isActive = (href: string) => (href === '/admin' ? pathname === '/admin' : pathname.startsWith(href));

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-16 sm:w-20 md:w-24 bg-white border-r border-gray-200 flex flex-col items-center py-3 sm:py-4 gap-0.5 sm:gap-1 overflow-y-auto overflow-x-hidden">
      <Link
        href="/admin"
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 text-white font-extrabold flex items-center justify-center mb-2 sm:mb-3 shadow-md text-lg"
      >
        👑
      </Link>
      {items.map((item) => {
        const active = isActive(item.href);
        return (
          <Link key={item.name} href={item.href} className="flex flex-col items-center gap-0.5 w-full py-1.5 sm:py-2 group">
            <span
              className={cn(
                'w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br flex items-center justify-center text-lg sm:text-xl shadow-sm transition-transform group-hover:scale-105',
                item.grad,
                active && 'ring-2 ring-offset-1 sm:ring-offset-2 ring-amber-400'
              )}
            >
              {item.icon}
            </span>
            <span className={cn('text-[9px] sm:text-[10px] font-semibold leading-tight text-center px-0.5', active ? 'text-amber-600' : 'text-gray-600')}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </aside>
  );
}