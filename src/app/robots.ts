import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

const MAIN_URL = 'https://orizzoncart.com.ng';
const MARKETPLACE_URL = 'https://marketplace.orizzoncart.com.ng';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const requestHeaders = await headers();
  const host = (
    requestHeaders.get('x-forwarded-host') ||
    requestHeaders.get('host') ||
    ''
  ).split(':')[0].toLowerCase();

  const isMarketplace = host === 'marketplace.orizzoncart.com.ng';
  const siteUrl = isMarketplace ? MARKETPLACE_URL : MAIN_URL;

  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        '/api/marketing/feed',
        '/api/marketing/google-merchant',
      ],
      disallow: [
        '/admin/',
        '/dashboard/',
        '/api/',
        '/onboarding/',
        '/checkout/',
        '/login/',
        '/signup/',
        '/forgot-password/',
        '/reset-password/',
        '/payment/',
        '/*?add=',
        '/*?cart=',
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
