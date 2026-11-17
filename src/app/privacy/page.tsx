import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingShell } from '@/components/marketing/MarketingShell';

export const metadata: Metadata = {
  title: 'Privacy Policy — OrizzonCart',
  description:
    'How OrizzonCart collects, uses, shares and protects personal information belonging to buyers and merchants.',
};

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-purple-600">
        Legal
      </p>
      <h1 className="mb-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
        Privacy Policy
      </h1>
      <p className="mb-8 text-sm text-gray-500">
        Last updated: 17 November 2026
      </p>

      <div className="space-y-6 text-[15px] leading-relaxed text-gray-700">
        <section>
          <h2 className="mb-2 text-lg font-bold text-gray-900">1. Who we are</h2>
          <p>
            OrizzonCart (“we”, “us” or “our”) is operated under the
            OrizzonS name. This policy explains how information is
            handled when you use orizzoncart.com.ng,
            marketplace.orizzoncart.com.ng, merchant storefronts on
            our domain and related services. It applies to buyers,
            merchants and visitors.
          </p>
          <p className="mt-2">
            For privacy questions or requests, contact{' '}
            <a className="font-semibold text-purple-700 underline" href="mailto:support@orizzoncart.com.ng">
              support@orizzoncart.com.ng
            </a>.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-gray-900">2. Information we collect</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li><strong>Account information:</strong> names, email addresses, authentication and account settings.</li>
            <li><strong>Merchant and store information:</strong> store details, products, descriptions, prices, images and inventory.</li>
            <li><strong>Order information:</strong> buyer and recipient details, contact information, delivery details, items ordered and order status.</li>
            <li><strong>Payment information:</strong> payment status, transaction references and records needed to support transactions. Third-party payment providers process payment details; we do not intend to store full payment-card numbers on our application servers.</li>
            <li><strong>Communications:</strong> enquiries, messages, complaints and support requests.</li>
            <li><strong>Technical information:</strong> IP address, browser and device details, log data, pages visited, referral information, cookie identifiers and interactions with the platform.</li>
            <li><strong>Security information:</strong> authentication events and signals used to protect accounts and the service.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-gray-900">3. How we use information</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Create and secure accounts and provide marketplace and storefront services.</li>
            <li>Process orders and route relevant order information to merchants.</li>
            <li>Support payment processing, fulfilment, receipts and customer support.</li>
            <li>Maintain, troubleshoot and improve the platform.</li>
            <li>Prevent fraud, abuse and unauthorised access.</li>
            <li>Measure site usage and, where permitted and selected, provide and measure advertising.</li>
            <li>Meet legal, tax, accounting and regulatory obligations.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-gray-900">4. Legal grounds for processing</h2>
          <p>
            Where applicable data-protection law requires a legal
            basis, processing may be based on performing a contract
            or taking steps you request, complying with a legal
            obligation, legitimate interests such as platform
            security and fraud prevention, or your consent where
            consent is required. You can withdraw optional cookie
            consent using Cookie settings. Withdrawal does not make
            earlier processing unlawful.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-gray-900">5. When we share information</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>The merchant responsible for an order, to confirm and fulfil the purchase.</li>
            <li>Payment providers such as Paystack or Flutterwave when their services are used.</li>
            <li>Hosting, database, email, security, analytics and advertising providers supporting the platform.</li>
            <li>Professional advisers and public authorities where disclosure is legally required or reasonably necessary to protect rights and safety.</li>
          </ul>
          <p className="mt-2">We do not sell personal information for money.</p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-gray-900">6. Cookies, analytics and advertising</h2>
          <p>
            Essential cookies and similar technologies support
            functions such as authentication, security, shopping
            carts and platform operation. These are needed for
            services you request.
          </p>
          <p className="mt-2">
            If you allow analytics, Google Tag Manager may load
            tags configured in our tag container to measure site
            usage and performance. The actual analytics services
            depend on the tags configured in that container.
          </p>
          <p className="mt-2">
            If you allow advertising, Google AdSense may use
            cookies or similar technologies to deliver, personalise
            where permitted, measure and report advertising.
            Google and its partners may process browser identifiers,
            IP address, device information and advertising
            interactions under their own policies.
          </p>
          <p className="mt-2">
            Read{' '}
            <a className="font-semibold text-purple-700 underline" href="https://policies.google.com/technologies/ads" target="_blank" rel="noreferrer">
              Google’s advertising technologies policy
            </a>{' '}
            and manage preferences through{' '}
            <a className="font-semibold text-purple-700 underline" href="https://adssettings.google.com/" target="_blank" rel="noreferrer">
              Google Ads Settings
            </a>.
          </p>
          <p className="mt-2">
            You can accept or reject optional analytics and
            advertising categories through our Cookie settings
            control. You can also manage cookies in your browser.
            Blocking essential cookies may prevent some features
            from working.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-gray-900">7. International transfers</h2>
          <p>
            Our service providers may process information in
            countries other than your own. Where applicable law
            requires safeguards for international transfers, we
            will use an appropriate legally recognised safeguard.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-gray-900">8. Data retention</h2>
          <p>
            We retain information for as long as reasonably
            necessary to provide the service, maintain transaction
            records, resolve disputes, prevent fraud and meet legal,
            tax and accounting obligations. When information is no
            longer needed, we take reasonable steps to delete it
            or securely de-identify it, subject to lawful retention
            requirements and backups.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-gray-900">9. Security</h2>
          <p>
            We use reasonable technical and organisational
            safeguards designed to protect information against
            unauthorised access, loss, alteration and disclosure.
            No online system can be guaranteed completely secure.
            Keep your login details confidential and use a strong,
            unique password.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-gray-900">10. Your privacy rights</h2>
          <p>
            Depending on applicable law, you may have rights to
            request access to personal information, correction,
            deletion, restriction or objection to certain
            processing, data portability, and withdrawal of
            consent. Some rights are subject to legal exceptions
            and identity verification.
          </p>
          <p className="mt-2">
            To make a request, email{' '}
            <a className="font-semibold text-purple-700 underline" href="mailto:support@orizzoncart.com.ng">
              support@orizzoncart.com.ng
            </a>{' '}
            with “Privacy request” in the subject. Do not send
            passwords or full payment-card details. You may also
            have the right to complain to the Nigeria Data
            Protection Commission or another competent authority.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-gray-900">11. Children</h2>
          <p>
            Merchant accounts are intended for people aged 18 or
            older. The platform is not directed at children, and
            we do not knowingly seek to collect children’s personal
            information.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-gray-900">12. Changes and contact</h2>
          <p>
            We may update this policy when our services, practices
            or legal obligations change. The date at the top shows
            when it was last revised. Contact{' '}
            <a className="font-semibold text-purple-700 underline" href="mailto:support@orizzoncart.com.ng">
              support@orizzoncart.com.ng
            </a>{' '}
            with privacy questions. See also our{' '}
            <Link href="/terms" className="font-semibold text-purple-700 underline">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/contact" className="font-semibold text-purple-700 underline">Contact</Link>
            {' '}page.
          </p>
        </section>
      </div>
    </MarketingShell>
  );
}
