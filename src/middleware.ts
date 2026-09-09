import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') || '';

  const ROOT = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'orizzoncart.name.ng';

  // These paths should NEVER be rewritten from subdomains
  const platformPaths = [
    '/login',
    '/signup', 
    '/onboarding',
    '/dashboard',
    '/admin',
    '/checkout',
    '/payment',
    '/track-order',
    '/store',
  ];

  // If the path is a platform path, don't rewrite it
  const isPlatformPath = platformPaths.some((p) => pathname.startsWith(p));

  // x.orizzoncart.name.ng  →  rewrite to /store/x (but NOT for platform paths)
  if (host.endsWith(ROOT) && host !== ROOT && host !== `www.${ROOT}` && !isPlatformPath) {
    const sub = host.replace(`.${ROOT}`, '');
    if (sub) {
      const url = request.nextUrl.clone();
      url.pathname = `/store/${sub}${pathname === '/' ? '' : pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js).*)'],
};