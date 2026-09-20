import { NextRequest, NextResponse } from 'next/server';

const PLATFORM_PATHS = [
  '/dashboard', '/admin', '/api', '/login', '/signup', '/onboarding',
  '/forgot-password', '/reset-password', '/checkout', '/payment',
  '/track-order', '/about', '/contact', '/privacy', '/terms', '/d/',
  '/icon.png', '/apple-icon.png', '/manifest.webmanifest', '/manifest.json',
  '/sw.js', '/robots.txt', '/sitemap.xml',
];

export function middleware(req: NextRequest) {
  const host = (req.headers.get('host') || '').toLowerCase();
  const { pathname } = req.nextUrl;

  const isWildcard = host.endsWith('.orizzoncart.name.ng') && !host.startsWith('www.');

  if (isWildcard) {
    const sub = host.replace('.orizzoncart.name.ng', '');
    if (sub && sub !== '*') {
      const isPlatformPath = PLATFORM_PATHS.some(
        (p) => pathname === p || pathname.startsWith(p.endsWith('/') ? p : `${p}/`)
      );
      const alreadyStorePath = pathname === '/store' || pathname.startsWith('/store/');

      if (!isPlatformPath && !alreadyStorePath) {
        const url = req.nextUrl.clone();
        url.pathname = `/store/${sub}${pathname === '/' ? '' : pathname}`;
        return NextResponse.rewrite(url);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|woff2?)$).*)'],
};