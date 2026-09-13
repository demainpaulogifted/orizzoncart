import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingShell } from '@/components/marketing/MarketingShell';

export const metadata: Metadata = {
  title: 'About Us — OrizzonCart',
  description:
    'OrizzonCart is a multi-tenant e-commerce platform by OrizzonS Inc., built for Nigerian businesses to sell online with secure payments and order tracking.',
};

export default function AboutPage() {
  return (
    <MarketingShell>
      <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2">About</p>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6">About OrizzonCart</h1>

      <div className="prose prose-gray max-w-none space-y-5 text-gray-700 leading-relaxed">
        <p>
          <strong>OrizzonCart</strong> is a multi-tenant online store platform built for Nigerian
          businesses. We help sellers launch a professional storefront, accept secure payments, and
          manage orders — without needing to code.
        </p>
        <p>
          The platform is operated by <strong>OrizzonS Inc.</strong> Our goal is simple: make it
          easy for local businesses to own their sales online, with tools that work on mobile and
          fit how people already buy in Nigeria (including WhatsApp-friendly selling).
        </p>

        <h2 className="text-xl font-bold text-gray-900 pt-2">What we offer</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Custom store links and premium themes</li>
          <li>Secure checkout with Paystack and Flutterwave</li>
          <li>Physical and digital product selling</li>
          <li>Automatic receipts and order tracking</li>
          <li>Store analytics for merchants</li>
        </ul>

        <h2 className="text-xl font-bold text-gray-900 pt-2">Who it’s for</h2>
        <p>
          Fashion sellers, digital creators, service providers, and growing brands who want a real
          storefront instead of only posting prices in social media captions.
        </p>

        <h2 className="text-xl font-bold text-gray-900 pt-2">Contact</h2>
        <p>
          Questions about the platform? Visit our{' '}
          <Link href="/contact" className="text-purple-600 font-semibold hover:underline">
            Contact
          </Link>{' '}
          page or email{' '}
          <a
            href="mailto:support@orizzoncart.name.ng"
            className="text-purple-600 font-semibold hover:underline"
          >
            support@orizzoncart.name.ng
          </a>
          .
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/signup"
          className="px-6 py-3 bg-purple-600 text-white rounded-full font-bold hover:bg-purple-700"
        >
          Create your store
        </Link>
        <Link
          href="/contact"
          className="px-6 py-3 border-2 border-gray-900 rounded-full font-bold hover:bg-gray-50"
        >
          Contact us
        </Link>
      </div>
    </MarketingShell>
  );
}