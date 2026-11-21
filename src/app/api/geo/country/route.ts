import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { COUNTRIES } from '@/lib/geo/country-currency';
import { MARKETPLACE_COUNTRY_COOKIE } from '@/lib/geo/marketplace-country';

export const dynamic = 'force-dynamic';

export async function GET() {
  const requestHeaders = await headers();
  const detected = (
    requestHeaders.get('x-vercel-ip-country') ||
    requestHeaders.get('cf-ipcountry') ||
    'NG'
  ).toUpperCase();

  const valid = COUNTRIES.some((country) => country.code === detected);
  return NextResponse.json({ country_code: valid ? detected : 'NG' });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const countryCode = String(body.country_code || '').toUpperCase();

    if (!COUNTRIES.some((country) => country.code === countryCode)) {
      return NextResponse.json({ error: 'Please select a supported country.' }, { status: 400 });
    }

    const response = NextResponse.json({ country_code: countryCode });
    response.cookies.set(MARKETPLACE_COUNTRY_COOKIE, countryCode, {
      httpOnly: true,
      secure: request.nextUrl.protocol === 'https:',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });
    return response;
  } catch {
    return NextResponse.json({ error: 'Could not save your country.' }, { status: 400 });
  }
}
