import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from 'sonner';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://orizzoncart.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: 'OrizzonCart — Own Your Sales',
    template: '%s | OrizzonCart',
  },
  description: 'Premium multi-tenant e-commerce platform for Nigerian businesses.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'OrizzonCart',
  },
};

export const viewport: Viewport = {
  themeColor: '#8B5CF6',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <Toaster position="top-center" richColors />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "if ('serviceWorker' in navigator) { window.addEventListener('load', function () { navigator.serviceWorker.register('/sw.js'); }); }",
          }}
        />
      </body>
    </html>
  );
}