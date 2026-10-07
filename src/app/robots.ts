import type { MetadataRoute } from 'next';

const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL || 'https://www.orizzoncart.name.ng'
).replace(/\/$/, '');

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/api/marketing/feed'],
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
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}