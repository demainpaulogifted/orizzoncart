import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingShell } from '@/components/marketing/MarketingShell';

export const metadata: Metadata = {
  title: 'Privacy Policy — OrizzonCart',
  description:
    'Privacy Policy for OrizzonCart: how we collect, use, and protect personal data for merchants and buyers.',
};

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2">Legal</p>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: 13 September 2026</p>

      <div className="space-y-6 text-gray-700 leading-relaxed text-[15px]">
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">1. Who we are</h2>
          <p>
            OrizzonCart (“we”, “us”) is operated by OrizzonS Inc. This policy explains how we handle
            information when you use{' '}
            <strong>orizzoncart.name.ng</strong>, merchant subdomains, and related services.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">2. Information we collect</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Account data:</strong> name, email, store name, and login details when you
              register as a merchant.
            </li>
            <li>
              <strong>Store & product data:</strong> products, prices, images, and descriptions you
              publish.
            </li>
            <li>
              <strong>Order data:</strong> customer name, contact details, delivery info, and order
              history needed to complete purchases.
            </li>
            <li>
              <strong>Payment data:</strong> payments are processed by providers such as Paystack or
              Flutterwave. We do not store full card numbers on our servers.
            </li>
            <li>
              <strong>Usage data:</strong> basic device, browser, and analytics data to improve the
              platform and security.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">3. How we use information</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Provide and operate storefronts, checkout, and order tracking</li>
            <li>Process payments and send receipts</li>
            <li>Support merchants and resolve disputes</li>
            <li>Improve performance, security, and features</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">4. Sharing of information</h2>
          <p className="mb-2">We may share data with:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Payment processors (e.g. Paystack, Flutterwave) to complete transactions</li>
            <li>Infrastructure providers that host our application and database</li>
            <li>Merchants, for orders placed on their stores (buyer details needed to fulfil)</li>
            <li>Authorities when required by law</li>
          </ul>
          <p className="mt-2">We do not sell your personal information.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">5. Cookies and similar technologies</h2>
          <p>
            We use cookies and similar technologies for login sessions, preferences, security, and
            analytics. You can control cookies through your browser settings. Blocking some cookies
            may limit platform features.
          </p>
          <p className="mt-2">
            If we enable third-party advertising (such as Google AdSense) in the future, those
            partners may use cookies or similar technologies to serve relevant ads. You can learn
            more in Google’s advertising settings and policies.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">6. Data retention & security</h2>
          <p>
            We keep information only as long as needed for the purposes above, including legal and
            accounting requirements. We use reasonable technical and organisational measures to
            protect data, but no online system is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">7. Your choices</h2>
          <p>
            Merchants can update store and account details from the dashboard. To request access,
            correction, or deletion of personal data we hold, contact us at{' '}
            <a
              href="mailto:support@orizzoncart.name.ng"
              className="text-purple-600 font-semibold hover:underline"
            >
              support@orizzoncart.name.ng
            </a>
            . We may need to verify your identity before acting on a request.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">8. Children’s privacy</h2>
          <p>
            OrizzonCart is not directed at children under 18. We do not knowingly collect personal
            information from children.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">9. Changes</h2>
          <p>
            We may update this policy from time to time. The “Last updated” date at the top will
            change when we do. Continued use of the platform after changes means you accept the
            updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">10. Contact</h2>
          <p>
            Privacy questions:{' '}
            <a
              href="mailto:support@orizzoncart.name.ng"
              className="text-purple-600 font-semibold hover:underline"
            >
              support@orizzoncart.name.ng
            </a>
            . See also our{' '}
            <Link href="/contact" className="text-purple-600 font-semibold hover:underline">
              Contact
            </Link>{' '}
            page and{' '}
            <Link href="/terms" className="text-purple-600 font-semibold hover:underline">
              Terms of Service
            </Link>
            .
          </p>
        </section>
      </div>
    </MarketingShell>
  );
}