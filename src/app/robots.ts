import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://orizzoncart.name.ng').replace(
    /\/$/,
    ''
  );

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/admin',
          '/api',
          '/onboarding',
          '/checkout',
          '/login',
          '/signup',
          '/forgot-password',
          '/reset-password',
          '/payment',
        ],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
    host: appUrl,
  };
}