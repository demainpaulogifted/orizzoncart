import Link from 'next/link';

export function DashboardSidebar({ merchant, isAdmin }: { merchant: any; isAdmin?: boolean }) {
  const items = [
    { href: '/dashboard', icon: '📊', label: 'Home' },
    { href: '/dashboard/products', icon: '📦', label: 'Products' },
    { href: '/dashboard/orders', icon: '🛒', label: 'Orders' },
    { href: '/dashboard/analytics', icon: '📈', label: 'Stats' },
    { href: '/dashboard/support', icon: '💬', label: 'Help' },
    { href: '/dashboard/settings', icon: '⚙️', label: 'Settings' },
  ];
  if (isAdmin) items.push({ href: '/admin', icon: '👑', label: 'Admin' });

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-14 bg-white border-r border-gray-200 flex flex-col items-center py-3 gap-0.5">
      <Link href="/dashboard" className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 text-white flex items-center justify-center text-sm font-extrabold mb-2 shrink-0">O</Link>
      {items.map((it) => (
        <Link key={it.href} href={it.href} className="w-12 flex flex-col items-center py-1.5 rounded-lg hover:bg-purple-50 text-gray-500 hover:text-purple-700 transition-colors">
          <span className="text-base leading-none">{it.icon}</span>
          <span className="text-[9px] font-semibold mt-1 leading-none">{it.label}</span>
        </Link>
      ))}
      <div className="mt-auto" />
      <Link href={`/store/${merchant?.store_slug}`} target="_blank" className="w-12 flex flex-col items-center py-1.5 rounded-lg hover:bg-purple-50 text-gray-500 hover:text-purple-700 transition-colors">
        <span className="text-base leading-none">👀</span>
        <span className="text-[9px] font-semibold mt-1 leading-none">Store</span>
      </Link>
    </aside>
  );
}
