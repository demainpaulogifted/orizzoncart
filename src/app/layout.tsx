import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import './globals.css';
import { Toaster } from 'sonner';

const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL || 'https://www.orizzoncart.name.ng'
).replace(/\/$/, '');

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'OrizzonCart — Own Your Sales | Build Your Online Store in Nigeria',
    template: '%s | OrizzonCart',
  },
  description:
    'OrizzonCart empowers businesses worldwide to launch beautiful, high-converting online stores in minutes. From local neighborhood shops to global digital brands, seamlessly accept payments, sell directly via WhatsApp, and manage orders with zero coding. Your store, your rules, your world.',
  keywords: [
    'OrizzonCart', 'online store builder', 'e-commerce platform', 'create online store',
    'sell on WhatsApp', 'multi-vendor marketplace', 'no-code website builder',
    'accept payments Nigeria', 'Paystack integration', 'Flutterwave integration',
    'sell online Africa', 'Naira payment gateway', 'local business growth',
    'digital products store', 'dropshipping Nigeria', 'boutique website builder',
    'fashion store online', 'electronics e-commerce', 'food delivery website',
    'service booking platform', 'online course platform', 'sell ebooks online'
  ],
  applicationName: 'OrizzonCart',
  alternates: { canonical: '/' },
  icons: { icon: '/icon-192.png', apple: '/icon-192.png' },
  openGraph: {
    title: 'OrizzonCart — Build Your Global Online Store in Minutes',
    description: 'Empowering businesses worldwide to launch beautiful, high-converting online stores. Accept payments, sell via WhatsApp, and manage orders with zero coding.',
    siteName: 'OrizzonCart',
    url: SITE_URL,
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OrizzonCart — Build Your Global Online Store in Minutes',
    description: 'Empowering businesses worldwide to launch beautiful, high-converting online stores with zero coding.',
  },
  robots: { index: true, follow: true },
  other: {
    monetag: "383b1b3cac9bec94eba8e7baaca0cf22",
  },
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
      description: 'OrizzonCart is a global, multi-tenant e-commerce platform empowering businesses of all sizes to create beautiful online stores, accept secure payments, and manage orders effortlessly.',
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
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const appManifest = (await headers()).get('x-app-manifest') || '/manifest.json';

  return (
    <html lang="en">
      <head>
        <link rel="manifest" href={appManifest} />
      </head>
      <body className="antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(brandSchema) }} />
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}