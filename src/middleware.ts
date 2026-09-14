import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = (request.headers.get('host') || '').split(':')[0];
  const ROOT = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'orizzoncart.name.ng')
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '');

  // ============================================
  // 1. REFRESH SUPABASE SESSION
  // ============================================
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value);
          });
        },
      },
    }
  );

  await supabase.auth.getUser();

  // ============================================
  // 2. SUBDOMAIN ROUTING (x.root → /store/x)
  // ============================================
  const isSubdomain =
    host.endsWith(`.${ROOT}`) && host !== ROOT && host !== `www.${ROOT}` && !host.includes('vercel.app');

  if (isSubdomain) {
    const sub = host.replace(`.${ROOT}`, '');

    // Platform paths always render normally even on subdomains
    const platformPaths = ['/login', '/signup', '/onboarding', '/dashboard', '/admin', '/checkout', '/payment', '/track-order', '/api', '/d/'];
    const isPlatformPath = platformPaths.some((p) => pathname.startsWith(p));

    // Already a /store/... path? Serve directly (no double prefix)
    const alreadyStorePath = pathname === '/store' || pathname.startsWith('/store/');

    if (!isPlatformPath && !alreadyStorePath && sub) {
      const url = request.nextUrl.clone();
      url.pathname = `/store/${sub}${pathname === '/' ? '' : pathname}`;
      return NextResponse.rewrite(url, { headers: response.headers });
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js).*)'],
};