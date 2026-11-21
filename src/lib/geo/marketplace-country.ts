import { cookies, headers } from 'next/headers';
import { COUNTRIES } from '@/lib/geo/country-currency';

export const MARKETPLACE_COUNTRY_COOKIE = 'marketplace_country';

export async function getMarketplaceCountryCode(): Promise<string> {
  const cookieStore = await cookies();
  const saved = cookieStore.get(MARKETPLACE_COUNTRY_COOKIE)?.value?.toUpperCase();

  if (saved && COUNTRIES.some((country) => country.code === saved)) {
    return saved;
  }

  const requestHeaders = await headers();
  const detected = (
    requestHeaders.get('x-vercel-ip-country') ||
    requestHeaders.get('cf-ipcountry') ||
    'NG'
  ).toUpperCase();

  return COUNTRIES.some((country) => country.code === detected) ? detected : 'NG';
}
