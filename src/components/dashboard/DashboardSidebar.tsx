'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Products', href: '/dashboard/products', icon: '📦' },
  { name: 'Orders', href: '/dashboard/orders', icon: '🛒' },
  { name: 'Analytics', href: '/dashboard/analytics', icon: '📈' },
  { name: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
];

export function DashboardSidebar({ merchant }: { merchant: any }) {
  const pathname = usePathname();
  const isShowcaseMode = merchant.cart_status === 'LOCKED';

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-white px-6">
        <div className="flex h-16 shrink-0 items-center border-b">
          <div>
            <h2 className="text-lg font-bold">{merchant.store_name}</h2>
            <p className="text-xs text-gray-500">{merchant.business_name}</p>
          </div>
        </div>
        {isShowcaseMode && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">⚠️ Showcase Mode<br/><span className="font-medium">Activate payment to enable cart</span></p>
          </div>
        )}
        <nav className="flex flex-1 flex-col">
          <ul className="flex flex-1 flex-col gap-y-2 pt-4">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link href={item.href} className={cn('group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6', pathname === item.href ? 'bg-gray-50 text-gray-900' : 'text-gray-700 hover:bg-gray-50')}>
                  <span>{item.icon}</span> {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}