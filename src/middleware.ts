import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') || '';

  const ROOT = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'orizzoncart.name.ng';

  // x.orizzoncart.name.ng  →  rewrite to /store/x
  if (host.endsWith(ROOT) && host !== ROOT && host !== `www.${ROOT}`) {
    const sub = host.replace(`.${ROOT}`, '');
    if (sub && !pathname.startsWith('/store') && !pathname.startsWith('/dashboard') && !pathname.startsWith('/admin')) {
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