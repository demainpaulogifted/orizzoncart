import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingShell } from '@/components/marketing/MarketingShell';

export const metadata: Metadata = {
  title: 'Contact — OrizzonCart',
  description: 'Contact OrizzonCart support for merchant help, platform questions, or partnership enquiries.',
};

export default function ContactPage() {
  return (
    <MarketingShell>
      <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2">Contact</p>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6">Get in touch</h1>

      <p className="text-gray-600 mb-8">
        We’re here to help merchants and buyers on OrizzonCart. Choose the option that fits your
        request.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 p-5 bg-gray-50">
          <p className="text-2xl mb-2">💬</p>
          <h2 className="font-bold text-gray-900 mb-1">Merchant support</h2>
          <p className="text-sm text-gray-600 mb-3">
            Store setup, payments, products, or account issues.
          </p>
          <a
            href="mailto:support@orizzoncart.name.ng"
            className="text-sm font-bold text-purple-600 hover:underline"
          >
            support@orizzoncart.name.ng
          </a>
        </div>

        <div className="rounded-2xl border border-gray-200 p-5 bg-gray-50">
          <p className="text-2xl mb-2">📦</p>
          <h2 className="font-bold text-gray-900 mb-1">Order tracking</h2>
          <p className="text-sm text-gray-600 mb-3">
            Buyers can track orders with their order or tracking number.
          </p>
          <Link href="/track-order" className="text-sm font-bold text-purple-600 hover:underline">
            Track an order →
          </Link>
        </div>

        <div className="rounded-2xl border border-gray-200 p-5 bg-gray-50">
          <p className="text-2xl mb-2">🤝</p>
          <h2 className="font-bold text-gray-900 mb-1">Partnerships</h2>
          <p className="text-sm text-gray-600 mb-3">Business, media, or integration enquiries.</p>
          <a
            href="mailto:hello@orizzoncart.name.ng"
            className="text-sm font-bold text-purple-600 hover:underline"
          >
            hello@orizzoncart.name.ng
          </a>
        </div>

        <div className="rounded-2xl border border-gray-200 p-5 bg-gray-50">
          <p className="text-2xl mb-2">🏢</p>
          <h2 className="font-bold text-gray-900 mb-1">Operator</h2>
          <p className="text-sm text-gray-600">
            OrizzonCart is operated by <strong>OrizzonS Inc.</strong>
            <br />
            Nigeria
          </p>
        </div>
      </div>

      <p className="text-sm text-gray-500 mt-8">
        We aim to respond within 1–2 business days. For urgent payment issues, include your store
        name and order ID in the email.
      </p>
    </MarketingShell>
  );
}