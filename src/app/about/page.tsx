import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About OrizzonCart — The Platform Powering Thousands of Online Stores',
  description: 'OrizzonCart is the leading e-commerce platform helping businesses worldwide launch beautiful online stores, accept payments, and sell via WhatsApp. Learn about our mission to empower entrepreneurs.',
  keywords: ['OrizzonCart', 'about OrizzonCart', 'e-commerce platform', 'online store builder', 'sell online'],
  openGraph: {
    title: 'About OrizzonCart',
    description: 'Learn about OrizzonCart — the platform empowering thousands of businesses to sell online.',
    type: 'website',
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-6">About OrizzonCart</h1>
        <p className="text-lg text-gray-700 mb-8">
          OrizzonCart is the leading e-commerce platform helping businesses worldwide launch beautiful online stores...
        </p>
        {/* Rest of your about page content */}
      </div>
    </div>
  );
}
