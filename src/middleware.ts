import { NextRequest, NextResponse } from 'next/server';

const PLATFORM_PATHS = [
  '/dashboard', '/admin', '/api', '/login', '/signup', '/onboarding',
  '/forgot-password', '/reset-password', '/checkout', '/payment',
  '/track-order', '/about', '/contact', '/privacy', '/terms', '/d/',
  '/icon.png', '/apple-icon.png', '/manifest.webmanifest', '/manifest.json',
  '/sw.js', '/robots.txt', '/sitemap.xml',
];

export function middleware(req: NextRequest) {
  // Tell the layout which PWA manifest to serve for this route
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set(
    'x-app-manifest',
    req.nextUrl.pathname.startsWith('/marketplace')
      ? '/manifest-marketplace.json'
      : '/manifest.json'
  );

  const res = NextResponse.next({ request: { headers: requestHeaders } });

  // Session cookie for marketplace feed shuffling
  if (!req.cookies.get('mkt_seed')) {
    res.cookies.set('mkt_seed', Math.random().toString(36).slice(2, 10), {
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
      sameSite: 'lax',
    });
  }

  const host = (req.headers.get('host') || '').toLowerCase();
  const { pathname } = req.nextUrl;

  const isWildcard = host.endsWith('.orizzoncart.name.ng') && !host.startsWith('www.');

  if (isWildcard) {
    const sub = host.replace('.orizzoncart.name.ng', '');
    if (sub && sub !== '*') {
      const isPlatformPath = PLATFORM_PATHS.some(
        (p) => pathname === p || pathname.startsWith(p.endsWith('/') ? p : `${p}/`)
      );
      const alreadyStorePath = pathname.startsWith('/store/');

      if (!isPlatformPath && !alreadyStorePath) {
        const url = req.nextUrl.clone();
        url.pathname = `/store/${sub}${pathname === '/' ? '' : pathname}`;
        return NextResponse.rewrite(url);
      }
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};