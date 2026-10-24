import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About OrizzonCart — Built by Small Business People for Merchants Who Want to Sell Without Limits',
  description:
    'OrizzonCart was created by a small team of small-business people who understand the daily struggles of selling online. We help merchants launch beautiful stores, accept payments, and grow without limits.',
  keywords: [
    'OrizzonCart',
    'about OrizzonCart',
    'OrizzonCart Marketplace',
    'online store builder Nigeria',
    'sell online Nigeria',
    'e-commerce platform for small business',
    'create online store Nigeria',
    'WhatsApp selling platform',
    'Paystack store builder',
    'Flutterwave online store',
  ],
  openGraph: {
    title: 'About OrizzonCart — Built for Merchants Who Want to Sell Without Limits',
    description:
      'Created by small-business people for small-business people. Launch your online store in minutes, accept payments, and sell without limits.',
    type: 'website',
    url: 'https://orizzoncart.com.ng/about',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About OrizzonCart',
    description: 'Built by small-business people to help merchants sell online without limits.',
  },
  alternates: {
    canonical: 'https://orizzoncart.com.ng/about',
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-700 via-purple-700 to-indigo-800 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="relative max-w-4xl mx-auto px-4 py-24 md:py-32 text-center">
          <p className="text-violet-200 font-medium mb-4 tracking-wide uppercase text-sm">
            Our Story
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Built by small-business people<br className="hidden md:block" /> for merchants who refuse to stay small
          </h1>
          <p className="text-lg md:text-xl text-violet-100 max-w-2xl mx-auto leading-relaxed">
            OrizzonCart exists because we lived the same problems you face every day — lost orders in WhatsApp, customers who don’t trust bank transfers, and the high cost of looking professional online.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-16 md:py-24 space-y-20">

        {/* The Real Problem */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            We started OrizzonCart because selling online was harder than it should be
          </h2>
          <div className="space-y-5 text-gray-700 text-lg leading-relaxed">
            <p>
              We are a small team of people who have run real small businesses. We sold products. We answered “How much?” messages at 11pm. We lost sales because customers disappeared after promising to pay.
            </p>
            <p>
              We saw talented merchants with great products struggle simply because they did not have a proper store. Instagram and WhatsApp are excellent for discovery, but they were never designed to handle payments, order tracking, and professional branding at the same time.
            </p>
            <p>
              So we built the tool we wished we had.
            </p>
          </div>
        </section>

        {/* What We Built */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
            What we built for you
          </h2>

          <div className="space-y-6">
            <div className="flex gap-5">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-lg">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">Your own professional storefront</h3>
                <p className="text-gray-600">
                  Get a clean, mobile-first store at <span className="font-medium text-violet-700">yourname.orizzoncart.com.ng</span>. Choose a designer theme, add your products, and start selling the same day.
                </p>
              </div>
            </div>

            <div className="flex gap-5">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-lg">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">Payments that customers actually complete</h3>
                <p className="text-gray-600">
                  Accept payments through Paystack and Flutterwave — card, bank transfer, and USSD. Customers pay with confidence and you receive the money directly.
                </p>
              </div>
            </div>

            <div className="flex gap-5">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-lg">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">Automatic receipts and order tracking</h3>
                <p className="text-gray-600">
                  Every successful payment generates a professional receipt and a tracking number. Your customers can follow their order without creating an account.
                </p>
              </div>
            </div>

            <div className="flex gap-5">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-lg">
                4
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">OrizzonCart Marketplace</h3>
                <p className="text-gray-600">
                  A growing collection of verified stores. Merchants keep full control of their brand while gaining extra visibility. Shoppers discover trusted sellers in one place.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Clear Distinction */}
        <section className="bg-gray-50 rounded-2xl p-8 md:p-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            OrizzonCart vs OrizzonCart Marketplace
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              <strong className="text-gray-900">OrizzonCart</strong> is the platform. It is the engine that lets any merchant create, customize, and manage their own online store.
            </p>
            <p>
              <strong className="text-gray-900">OrizzonCart Marketplace</strong> is the discovery layer. It brings verified stores together so customers can browse and buy from many trusted merchants easily.
            </p>
            <p>
              You own your customers. You own your brand. The Marketplace simply helps more people find you.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            Our mission is simple
          </h2>
          <p className="text-xl text-gray-700 leading-relaxed">
            To give every small business and merchant the power to sell online <span className="font-semibold text-violet-700">without limits</span> — with professional tools, honest pricing, and technology that works for people who are busy running real businesses.
          </p>
        </section>

        {/* Closing CTA */}
        <section className="text-center border-t border-gray-200 pt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Ready to stop losing sales in DMs?
          </h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            Join merchants who have already moved from chaotic chats to professional stores that accept payments and track every order.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-violet-600 text-white font-semibold text-lg hover:bg-violet-700 transition shadow-lg shadow-violet-200"
            >
              Create Your Free Store
            </Link>
            <Link
              href="/marketplace"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl border-2 border-gray-200 text-gray-800 font-semibold text-lg hover:border-violet-300 hover:bg-violet-50 transition"
            >
              Explore Marketplace
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}