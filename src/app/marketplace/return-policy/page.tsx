
import type { Metadata } from 'next';
import Link from 'next/link';

const POLICY_URL =
  'https://marketplace.orizzoncart.com.ng/return-policy';

export const metadata: Metadata = {
  title: 'Returns, Refunds & Exchanges | OrizzonCart Marketplace',
  description:
    'Learn how returns, refunds, replacements and exchanges work on OrizzonCart Marketplace. Your OrizzonCart order number identifies the merchant responsible for each product.',
  alternates: { canonical: POLICY_URL },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Returns, Refunds & Exchanges | OrizzonCart Marketplace',
    description:
      'Understand the return process and each verified merchant’s responsibility for products sold through OrizzonCart Marketplace.',
    url: POLICY_URL,
    siteName: 'OrizzonCart Marketplace',
    type: 'article',
  },
};

const sections = [
  {
    title: '1. Who is responsible for a product?',
    content: (
      <>
        Each verified merchant selling through OrizzonCart Marketplace is responsible for the products they sell. This includes product quality, accurate descriptions, packaging, fulfilment, returns, replacements, exchanges and refunds relating to their products.

        <p className="mt-3">
          OrizzonCart provides the marketplace where customers discover stores
          and place orders. We help identify the responsible merchant and may
          review complaints or take action where a merchant fails to meet
          marketplace standards. The merchant remains responsible for resolving
          product-related issues, subject to applicable law and the payment
          arrangement used.
        </p>
      </>
    ),
  },
  {
    title: '2. Your OrizzonCart order number identifies the merchant',
    content: (
      <>
        To request a return, refund, replacement or exchange, provide the
        <strong> OrizzonCart order number</strong> shown in your order
        confirmation or order history.

        <p className="mt-3">
          The order number allows OrizzonCart to identify the order and the
          merchant responsible for each product. If an order contains products
          from different merchants, each product complaint will be directed to
          the merchant that supplied that product.
        </p>

        <p className="mt-3">
          Your OrizzonCart order number is not necessarily the same as a
          courier’s shipment tracking number or waybill number. Keep both
          numbers where they are provided.
        </p>
      </>
    ),
  },
  {
    title: '3. When can you request a return?',
    content: (
      <>
        For eligible products, you may request a change-of-mind return within
        <strong> 7 calendar days after delivery</strong>. The product must be
        unused, in its original condition, and returned with its original
        packaging, accessories, tags and proof of purchase.

        <p className="mt-3">
          This period does not reduce any rights you may have under applicable
          Nigerian consumer-protection law.
        </p>
      </>
    ),
  },
  {
    title: '4. Wrong, damaged, defective or misdescribed products',
    content: (
      <>
        Contact us promptly if an item arrives damaged, is defective, is the
        wrong product, is missing essential parts, or is materially different
        from its listing description. Include your OrizzonCart order number
        and clear photographs or video where helpful.

        <p className="mt-3">
          The responsible merchant must assess the complaint and, where valid,
          arrange an appropriate remedy such as repair, replacement, exchange
          or refund in line with applicable law. Where the merchant is
          responsible for the problem, the merchant is responsible for
          reasonable return or collection costs.
        </p>
      </>
    ),
  },
  {
    title: '5. Return delivery costs',
    content: (
      <>
        For an approved change-of-mind return, the customer may be responsible
        for reasonable return delivery costs, provided this is disclosed before
        the return is arranged and permitted by applicable law.

        <p className="mt-3">
          Where the return is due to a merchant sending a wrong, damaged,
          defective or materially misdescribed item, the responsible merchant
          must cover reasonable return or collection costs.
        </p>
      </>
    ),
  },
  {
    title: '6. Products that may not qualify for change-of-mind returns',
    content: (
      <>
        Unless the law requires otherwise, change-of-mind returns may be
        unavailable for personalised or custom-made products, perishable goods,
        unsealed hygiene or personal-care products, digital products or
        downloads once access or delivery has begun, and products damaged
        through misuse after delivery.

        <p className="mt-3">
          These exclusions do not remove your rights where an item is defective,
          faulty, unsafe, incorrect or not as described.
        </p>
      </>
    ),
  },
  {
    title: '7. How to request a return',
    content: (
      <ol className="list-decimal pl-5 space-y-2">
        <li>Open your OrizzonCart order history or confirmation and copy your order number.</li>
        <li>Contact OrizzonCart through the marketplace support channel and identify the product and reason for your request.</li>
        <li>OrizzonCart uses the order record to identify and notify the merchant responsible for that product.</li>
        <li>The merchant reviews the request and provides return instructions. Do not send an item anywhere until the return destination is confirmed.</li>
        <li>Keep proof of dispatch and courier tracking details until the matter is resolved.</li>
      </ol>
    ),
  },
  {
    title: '8. Merchant response and resolution',
    content: (
      <>
        Merchants are expected to acknowledge a return or complaint within
        2 business days and work towards resolving an approved request within
        7 business days after receiving the returned item or sufficient
        evidence, where reasonably possible.

        <p className="mt-3">
          Courier, bank and payment-provider processing times may affect the
          final completion date. The merchant must communicate the proposed
          resolution and any applicable steps or timing.
        </p>
      </>
    ),
  },
  {
    title: '9. Refunds',
    content: (
      <>
        Where a refund is approved, the responsible merchant must arrange it
        through the applicable payment or refund process and communicate the
        expected timeline.

        <p className="mt-3">
          The time for funds to appear may depend on the bank, card issuer or
          payment provider. OrizzonCart may request evidence of the merchant’s
          resolution when reviewing a complaint.
        </p>
      </>
    ),
  },
  {
    title: '10. OrizzonCart marketplace support',
    content: (
      <>
        If a merchant does not respond or refuses to address a valid complaint,
        you may report the matter to OrizzonCart with your order number and
        supporting evidence.

        <p className="mt-3">
          We may contact the merchant, review relevant order information, issue
          warnings, restrict marketplace access or suspend a merchant account
          where appropriate.
        </p>
      </>
    ),
  },
  {
    title: '11. Your legal rights',
    content: (
      <>
        Nothing in this policy is intended to exclude, restrict or replace
        consumer rights that cannot lawfully be excluded under Nigerian law.
        Where this policy conflicts with a mandatory legal requirement, that
        legal requirement takes priority.
      </>
    ),
  },
  {
    title: '12. Policy updates',
    content: (
      <>
        We may update this policy when marketplace processes or legal
        requirements change. The date displayed on this page indicates the
        latest revision.
      </>
    ),
  },
];

export default function ReturnPolicyPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-purple-700 to-blue-700 text-white">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <Link
            href="/marketplace"
            className="text-sm text-purple-100 hover:text-white hover:underline"
          >
            ← Back to OrizzonCart Marketplace
          </Link>

          <p className="mt-6 text-xs font-bold uppercase tracking-widest text-purple-100">
            Marketplace customer policy
          </p>

          <h1 className="mt-2 text-3xl font-extrabold leading-tight">
            Returns, Refunds & Exchanges
          </h1>

          <p className="mt-3 text-sm leading-6 text-purple-50">
            A clear guide to returns on OrizzonCart Marketplace and how your
            order number identifies the merchant responsible for each product.
          </p>

          <p className="mt-4 text-xs text-purple-100">
            Last updated: 7 November 2026
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6 pb-16">
        <section className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-gray-900">
            The key thing to know
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Each verified merchant is responsible for the products they sell.
            Always provide your OrizzonCart order number so we can identify
            the correct merchant, including when your order contains products
            from more than one store.
          </p>
        </section>

        <div className="mt-5 space-y-4">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <h2 className="text-base font-extrabold text-gray-900">
                {section.title}
              </h2>
              <div className="mt-3 text-sm leading-7 text-gray-600">
                {section.content}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-6 rounded-2xl bg-gray-900 p-5 text-white">
          <h2 className="font-bold">Need help with an order?</h2>
          <p className="mt-2 text-sm leading-6 text-gray-300">
            Keep your OrizzonCart order number ready so the marketplace team
            can identify the merchant responsible for the product.
          </p>
          <Link
            href="/marketplace/orders"
            className="mt-4 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-bold text-purple-800 hover:bg-purple-50"
          >
            View my orders
          </Link>
        </div>

        <p className="mt-6 text-center text-xs leading-5 text-gray-500">
          This policy applies to purchases made through OrizzonCart Marketplace.
          It does not replace applicable consumer-protection laws or mandatory
          rights you may have.
        </p>
      </div>
    </main>
  );
}
