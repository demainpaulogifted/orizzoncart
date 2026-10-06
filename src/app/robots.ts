import type { MetadataRoute } from 'next';

const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL || 'https://www.orizzoncart.name.ng'
).replace(/\/$/, '');

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/marketplace', '/marketplace/', '/api/marketing/feed'],
        disallow: [
          '/admin/',
          '/dashboard/',
          '/api/', // Blocks all APIs except the feed we allowed above
          '/onboarding/',
          '/checkout/',
          '/login/',
          '/signup/',
          '/forgot-password/',
          '/reset-password/',
          '/payment/',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}