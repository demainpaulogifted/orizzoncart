'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊', grad: 'from-blue-400 to-indigo-600' },
  { name: 'Products', href: '/dashboard/products', icon: '📦', grad: 'from-orange-400 to-red-500' },
  { name: 'Orders', href: '/dashboard/orders', icon: '🛒', grad: 'from-green-400 to-emerald-600' },
  { name: 'Analytics', href: '/dashboard/analytics', icon: '📈', grad: 'from-fuchsia-400 to-purple-600' },
  { name: 'Settings', href: '/dashboard/settings', icon: '⚙️', grad: 'from-slate-500 to-slate-700' },
];

export function DashboardSidebar({ merchant }: { merchant: any }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-20 sm:w-24 bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-1 overflow-y-auto">
      <Link
        href="/dashboard"
        className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 text-white font-extrabold flex items-center justify-center mb-3 shadow-md"
      >
        O
      </Link>

      {navigation.map((item) => {
        const active = isActive(item.href);
        return (
          <Link key={item.name} href={item.href} className="flex flex-col items-center gap-1 w-full py-2 group">
            <span
              className={cn(
                'w-11 h-11 rounded-2xl bg-gradient-to-br flex items-center justify-center text-xl shadow-sm transition-transform group-hover:scale-105',
                item.grad,
                active && 'ring-2 ring-offset-2 ring-purple-400'
              )}
            >
              {item.icon}
            </span>
            <span className={cn('text-[10px] font-semibold', active ? 'text-purple-600' : 'text-gray-600')}>
              {item.name}
            </span>
          </Link>
        );
      })}

      <div className="mt-auto pt-4">
        <Link href={`/store/${merchant?.store_slug}`} className="flex flex-col items-center gap-1 py-2 group">
          <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-xl shadow-sm transition-transform group-hover:scale-105">
            👀
          </span>
          <span className="text-[10px] font-semibold text-gray-600">My Store</span>
        </Link>
      </div>
    </aside>
  );
}