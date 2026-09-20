import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from 'sonner';

const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL || 'https://www.orizzoncart.name.ng'
).replace(/\/$/, '');

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'OrizzonCart — Own Your Sales',
    template: '%s | OrizzonCart',
  },
  description:
    'OrizzonCart helps Nigerian businesses create beautiful online stores, accept payments, sell through WhatsApp, and manage orders.',
  applicationName: 'OrizzonCart',
  alternates: { canonical: '/' },
  manifest: '/manifest.json',
  icons: { icon: '/icon-192.png', apple: '/icon-192.png' },
  openGraph: {
    title: 'OrizzonCart — Own Your Sales',
    description:
      'Create your online store, accept payments, sell through WhatsApp, and manage orders with OrizzonCart.',
    siteName: 'OrizzonCart',
    url: SITE_URL,
    type: 'website',
    locale: 'en_NG',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OrizzonCart — Own Your Sales',
    description: 'Create your online store and start selling online with OrizzonCart.',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#8B5CF6',
  width: 'device-width',
  initialScale: 1,
};

const brandSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'OrizzonCart',
      url: SITE_URL,
      logo: `${SITE_URL}/icon-192.png`,
      description:
        'OrizzonCart is a multi-tenant online store platform built for Nigerian businesses. Add your store name and how you receive payment — your online store is live in minutes.',
      sameAs: [
        'https://www.facebook.com/OrizzonCart',
        'https://www.instagram.com/orizzoncart',
        'https://x.com/orizzoncart',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'OrizzonCart',
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NG">
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(brandSchema) }}
        />
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}