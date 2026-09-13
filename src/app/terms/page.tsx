import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingShell } from '@/components/marketing/MarketingShell';

export const metadata: Metadata = {
  title: 'Terms of Service — OrizzonCart',
  description:
    'Terms of Service for using OrizzonCart: merchant stores, payments, content rules, and platform responsibilities.',
};

export default function TermsPage() {
  return (
    <MarketingShell>
      <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2">Legal</p>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">Terms of Service</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: 13 September 2026</p>

      <div className="space-y-6 text-gray-700 leading-relaxed text-[15px]">
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">1. Agreement</h2>
          <p>
            By accessing or using OrizzonCart (the “Platform”), you agree to these Terms of Service
            (“Terms”). If you do not agree, do not use the Platform. The Platform is operated by
            OrizzonS Inc. (“we”, “us”).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">2. The service</h2>
          <p>
            OrizzonCart provides tools for merchants to create online stores, list products, accept
            payments via third-party processors, and manage orders. We provide software and
            infrastructure; merchants are responsible for their own products, pricing, fulfilment,
            and customer service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">3. Accounts</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>You must provide accurate registration information.</li>
            <li>You are responsible for activity under your account.</li>
            <li>You must be at least 18 years old to create a merchant account.</li>
            <li>We may suspend or terminate accounts that violate these Terms or applicable law.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">4. Merchant responsibilities</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Only list products you are allowed to sell under Nigerian and applicable law.</li>
            <li>Do not sell prohibited, counterfeit, or infringing items.</li>
            <li>Honour valid orders and communicate clearly with buyers.</li>
            <li>Set accurate prices, descriptions, and delivery expectations.</li>
            <li>Comply with payment provider rules (e.g. Paystack, Flutterwave).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">5. Payments & fees</h2>
          <p>
            Payments are processed by third-party providers. Settlement to merchants depends on
            those providers and your configuration (including any platform fees or splits disclosed
            in the product). Activation or theme fees, where applicable, are described on the
            Platform. Payment provider charges may apply separately.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">6. Digital products</h2>
          <p>
            For digital goods, delivery may be automatic after successful payment. Merchants must
            ensure files and licences are lawful and that buyers receive what was advertised.
            Refund rules for digital products should be stated by the merchant where required.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">7. Acceptable use</h2>
          <p className="mb-2">You may not use the Platform to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Break the law or promote illegal activity</li>
            <li>Upload malware, scrape without permission, or attack the service</li>
            <li>Harass others or post abusive content</li>
            <li>Infringe intellectual property or privacy rights</li>
            <li>Manipulate payments, reviews, or tracking systems fraudulently</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">8. Content & IP</h2>
          <p>
            Merchants retain rights to content they upload, and grant us a licence to host and
            display it to operate the Platform. OrizzonCart branding, software, and design remain
            our property. Do not copy our software or trademarks without permission.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">9. Disclaimers</h2>
          <p>
            The Platform is provided “as is”. We do not guarantee uninterrupted service or that
            every merchant store will meet a buyer’s expectations. Transactions are primarily
            between buyer and merchant. To the extent allowed by law, we are not liable for
            indirect or consequential losses arising from use of the Platform.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">10. Termination</h2>
          <p>
            You may stop using the Platform at any time. We may suspend or terminate access for
            policy violations, legal risk, non-payment of applicable fees, or to protect the
            Platform and its users.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">11. Changes</h2>
          <p>
            We may update these Terms. Material changes will be reflected by the “Last updated”
            date. Continued use after changes constitutes acceptance.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">12. Contact</h2>
          <p>
            Questions about these Terms:{' '}
            <a
              href="mailto:support@orizzoncart.name.ng"
              className="text-purple-600 font-semibold hover:underline"
            >
              support@orizzoncart.name.ng
            </a>
            . See also{' '}
            <Link href="/privacy" className="text-purple-600 font-semibold hover:underline">
              Privacy Policy
            </Link>{' '}
            and{' '}
            <Link href="/contact" className="text-purple-600 font-semibold hover:underline">
              Contact
            </Link>
            .
          </p>
        </section>
      </div>
    </MarketingShell>
  );
}