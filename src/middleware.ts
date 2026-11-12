import { NextRequest, NextResponse } from 'next/server';

const PLATFORM_PATHS = [
  '/dashboard', '/admin', '/api', '/login', '/signup', '/onboarding',
  '/forgot-password', '/reset-password', '/checkout', '/payment',
  '/track-order', '/about', '/contact', '/privacy', '/terms', '/d/',
  '/invite',
  '/icon.png', '/apple-icon.png', '/manifest.webmanifest', '/manifest.json',
  '/sw.js', '/robots.txt', '/sitemap.xml',
];

const MARKETPLACE_HOSTS = new Set([
  'marketplace.orizzoncart.com.ng',
  'www.marketplace.orizzoncart.com.ng',
]);

export function middleware(req: NextRequest) {
  const requestHeaders = new Headers(req.headers);
  const host = (req.headers.get('host') || '').toLowerCase();
  const { pathname } = req.nextUrl;

  const isMarketplaceHost = MARKETPLACE_HOSTS.has(host);

  // Invite deep link: /invite/{code} → cookie + signup (except join/dashboard)
  {
    const inviteMatch = pathname.match(/^\/invite\/([a-z0-9]+)$/i);
    if (inviteMatch) {
      const code = inviteMatch[1].toLowerCase();
      if (code !== 'join' && code !== 'dashboard') {
        const url = req.nextUrl.clone();
        url.pathname = '/signup';
        url.searchParams.set('ref', code);
        const res = NextResponse.redirect(url);
        res.cookies.set('invite_ref', code, {
          path: '/',
          maxAge: 60 * 60 * 24 * 30,
          sameSite: 'lax',
        });
        return res;
      }
    }
  }

  const isMarketplacePath = pathname.startsWith('/marketplace') || isMarketplaceHost;

  requestHeaders.set(
    'x-app-manifest',
    isMarketplacePath ? '/manifest-marketplace.json' : '/manifest.json'
  );

  if (isMarketplaceHost) {
    const url = req.nextUrl.clone();

    if (pathname === '/' || pathname === '') {
      url.pathname = '/marketplace';
      return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
    }

    if (pathname.startsWith('/merchantprofile/')) {
      const slug = pathname.replace('/merchantprofile/', '');
      url.pathname = `/marketplace/store/${slug}`;
      return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
    }

    const isPlatformPath = PLATFORM_PATHS.some(
      (p) => pathname === p || pathname.startsWith(p.endsWith('/') ? p : `${p}/`)
    );

    if (!isPlatformPath && pathname !== '/ads.txt' && !pathname.startsWith('/marketplace') && !pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
      url.pathname = `/marketplace${pathname === '/' ? '' : pathname}`;
      return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
    }

    const res = NextResponse.next({ request: { headers: requestHeaders } });
    if (!req.cookies.get('mkt_seed')) {
      res.cookies.set('mkt_seed', Math.random().toString(36).slice(2, 10), {
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
        sameSite: 'lax',
      });
    }
    return res;
  }

  const res = NextResponse.next({ request: { headers: requestHeaders } });

  if (!req.cookies.get('mkt_seed')) {
    res.cookies.set('mkt_seed', Math.random().toString(36).slice(2, 10), {
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
      sameSite: 'lax',
    });
  }

  const isWildcard =
    host.endsWith('.orizzoncart.com.ng') &&
    !host.startsWith('www.') &&
    !MARKETPLACE_HOSTS.has(host);

  if (isWildcard) {
    const sub = host.replace('.orizzoncart.com.ng', '');
    if (sub && sub !== '*' && sub !== 'marketplace') {
      const isPlatformPath = PLATFORM_PATHS.some(
        (p) => pathname === p || pathname.startsWith(p.endsWith('/') ? p : `${p}/`)
      );
      const alreadyStorePath = pathname.startsWith('/store/');

      if (!isPlatformPath && !alreadyStorePath) {
        const url = req.nextUrl.clone();
        url.pathname = '/store/' + sub + (pathname === '/' ? '' : pathname);
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
