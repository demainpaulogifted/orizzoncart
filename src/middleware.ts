import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') || '';
  const ROOT = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'orizzoncart.name.ng')
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '');

  // ============================================
  // 1. REFRESH SUPABASE SESSION (keeps merchants logged in on refresh)
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
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  await supabase.auth.getUser();

  // ============================================
  // 2. SUBDOMAIN ROUTING (x.orizzoncart.name.ng → /store/x)
  // ============================================
  const platformPaths = [
    '/login', '/signup', '/onboarding', '/dashboard', '/admin',
    '/checkout', '/payment', '/track-order', '/store', '/api',
  ];
  const isPlatformPath = platformPaths.some((p) => pathname.startsWith(p));

  if (host.endsWith(ROOT) && host !== ROOT && host !== `www.${ROOT}` && !isPlatformPath) {
    const sub = host.replace(`.${ROOT}`, '');
    if (sub) {
      const url = request.nextUrl.clone();
      url.pathname = `/store/${sub}${pathname === '/' ? '' : pathname}`;
      return NextResponse.rewrite(url, { headers: response.headers });
    }
  }

  return response;
}

export const config = {
  // NOTE: api is excluded again — webhooks & cron must never touch session middleware
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js).*)'],
};