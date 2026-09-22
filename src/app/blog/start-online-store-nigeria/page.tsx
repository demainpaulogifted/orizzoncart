import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How to Start an Online Store in Nigeria in 2024 | OrizzonCart',
  description: 'The ultimate step-by-step guide to launching a profitable e-commerce business in Nigeria. Learn how to build your store, accept payments, and scale with OrizzonCart.',
};

export default function StartOnlineStoreGuide() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-50 via-white to-purple-50 py-20 px-4 sm:px-6 lg:px-8 border-b border-purple-100">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-purple-100 text-[#8B5CF6] text-sm font-semibold mb-6">
            The Ultimate E-commerce Guide
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 mb-6">
            How to Start an Online Store in Nigeria in 2024
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Stop losing sales to "How much?" DMs. Here is the complete, step-by-step blueprint to building a professional, automated online store that accepts payments and scales your business.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/signup" 
              className="px-8 py-4 bg-[#8B5CF6] hover:bg-purple-700 text-white font-bold rounded-lg shadow-lg transition-all transform hover:-translate-y-1"
            >
              Start My Free Store
            </Link>
            <a 
              href="#table-of-contents" 
              className="px-8 py-4 bg-white border border-gray-300 hover:border-[#8B5CF6] text-gray-700 font-bold rounded-lg transition-all"
            >
              Read the Guide
            </a>
          </div>
        </div>
      </section>

      {/* Content Container */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Introduction */}
        <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
          <p className="text-xl leading-relaxed">
            The Nigerian e-commerce space is booming. From Instagram vendors in Lagos to tech gadget sellers in Abuja, everyone is selling online. But here is the hard truth: <strong>having a great product is no longer enough.</strong>
          </p>
          <p className="text-xl leading-relaxed">
            If you are still managing orders via WhatsApp DMs, manually calculating totals, and begging customers to send proof of payment, you are leaving money on the table. You are losing sales to friction.
          </p>
          <p className="text-xl leading-relaxed">
            This guide is your escape plan. By the end of this article, you will know exactly how to transition from a chaotic DM-based business to a professional, automated online store using <strong>OrizzonCart</strong>.
          </p>
        </div>

        {/* Inline CTA Box 1 */}
        <div className="my-12 p-8 bg-purple-50 border-l-4 border-[#8B5CF6] rounded-r-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Skip the Learning Curve</h3>
          <p className="text-gray-700 mb-4">
            You don't need to read the whole guide to get started. OrizzonCart lets you build a fully functional store in under 5 minutes. No coding required.
          </p>
          <Link href="/signup" className="inline-block px-6 py-3 bg-[#8B5CF6] text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors">
            Create My Free Store Now &rarr;
          </Link>
        </div>

        {/* Table of Contents */}
        <div id="table-of-contents" className="my-12 p-8 bg-gray-50 rounded-xl border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Table of Contents</h2>
          <ul className="space-y-2 text-gray-700">
            <li><a href="#phase-1" className="hover:text-[#8B5CF6] transition-colors">Phase 1: Finding Your Niche & Validating Your Idea</a></li>
            <li><a href="#phase-2" className="hover:text-[#8B5CF6] transition-colors">Phase 2: Naming Your Business & Legal Setup</a></li>
            <li><a href="#phase-3" className="hover:text-[#8B5CF6] transition-colors">Phase 3: Building Your Store (The OrizzonCart Way)</a></li>
            <li><a href="#phase-4" className="hover:text-[#8B5CF6] transition-colors">Phase 4: Setting Up Payments & Logistics</a></li>
            <li><a href="#phase-5" className="hover:text-[#8B5CF6] transition-colors">Phase 5: Marketing & Getting Your First 100 Sales</a></li>
            <li><a href="#faq" className="hover:text-[#8B5CF6] transition-colors">Frequently Asked Questions</a></li>
          </ul>
        </div>

        {/* Phase 1 */}
        <section id="phase-1" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Phase 1: Finding Your Niche & Validating Your Idea</h2>
          <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
            <p>
              Before you spend a single Naira on inventory or website setup, you need to know what to sell. The most successful Nigerian e-commerce brands don't sell "everything." They dominate a specific niche.
            </p>
            <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">How to Research Profitable Niches in Nigeria</h3>
            <p>
              Look at what is already selling on Jumia, Konga, and Instagram. Are people buying thrift (Okrika) clothes? Customized phone cases? Organic skincare? Natural hair products? 
            </p>
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li><strong>Passion + Profit:</strong> Choose something you understand, but verify there is demand.</li>
              <li><strong>Solve a Problem:</strong> The best products solve a specific pain point (e.g., anti-acne soap for humid weather).</li>
              <li><strong>Check Margins:</strong> Ensure you can sell the product for at least 3x your cost to cover ads and logistics.</li>
            </ul>
          </div>
        </section>

        {/* Phase 2 */}
        <section id="phase-2" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Phase 2: Naming Your Business & Legal Setup</h2>
          <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
            <p>
              Your brand name is your first impression. It should be short, memorable, and easy to spell. Avoid complex spellings that will confuse customers when they try to find your website.
            </p>
            <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Do You Need to Register with CAC?</h3>
            <p>
              To start selling, no. You can begin as a sole proprietor. However, if you want to build trust, open a corporate bank account, and run Facebook/Instagram ads without getting banned, registering your business name with the Corporate Affairs Commission (CAC) is highly recommended. It costs around ₦10,000 - ₦20,000 and can be done online.
            </p>
          </div>
        </section>

        {/* Inline CTA Box 2 */}
        <div className="my-12 p-8 bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl text-white shadow-xl">
          <h3 className="text-2xl font-bold mb-2">Ready to Make It Official?</h3>
          <p className="text-purple-100 mb-6">
            Your brand name is waiting. Claim your unique OrizzonCart subdomain and start building your brand identity today.
          </p>
          <Link href="/signup" className="inline-block px-6 py-3 bg-white text-[#8B5CF6] font-bold rounded-lg hover:bg-gray-100 transition-colors">
            Claim My Store Name &rarr;
          </Link>
        </div>

        {/* Phase 3 */}
        <section id="phase-3" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Phase 3: Building Your Store (The OrizzonCart Way)</h2>
          <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
            <p>
              This is where most entrepreneurs get stuck. They spend months trying to code a website, or they pay a developer ₦500,000 for a WordPress site that crashes when 10 people visit it. 
            </p>
            <p>
              <strong>There is a better way.</strong> OrizzonCart is built specifically for Nigerian businesses. It is a multi-tenant platform, meaning you get your own fully hosted, lightning-fast store without touching a single line of code.
            </p>
            <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Step-by-Step Setup</h3>
            <ol className="list-decimal pl-6 space-y-4 my-4">
              <li><strong>Sign Up:</strong> Create your free account on OrizzonCart.</li>
              <li><strong>Add Products:</strong> Upload high-quality images, write compelling descriptions, and set your prices in Naira.</li>
              <li><strong>Customize:</strong> Choose a clean, mobile-responsive theme. 80% of Nigerian shoppers buy on their phones; your site MUST look good on mobile.</li>
              <li><strong>Connect WhatsApp:</strong> OrizzonCart integrates directly with WhatsApp. When an order comes in, you get a notification instantly.</li>
            </ol>
          </div>
        </section>

        {/* Phase 4 */}
        <section id="phase-4" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Phase 4: Setting Up Payments & Logistics</h2>
          <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
            <p>
              If customers can't pay easily, they won't buy. If they can't get their product, they won't trust you.
            </p>
            <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Accepting Payments</h3>
            <p>
              OrizzonCart seamlessly integrates with Nigeria's top payment gateways like <strong>Paystack</strong> and <strong>Flutterwave</strong>. This allows your customers to pay via Card, Bank Transfer, or USSD. 
            </p>
            <p>
              <em>Pro Tip:</em> Always offer a "Pay on Delivery" (POD) option if you are selling within your city, but use OrizzonCart's automated order confirmation to filter out fake buyers.
            </p>
            <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Handling Logistics</h3>
            <p>
              Partner with reliable logistics companies like GIG Logistics, Red Star, or trusted local bike men. OrizzonCart allows you to set flat-rate shipping fees or free shipping thresholds (e.g., "Free delivery in Lagos for orders over ₦20,000") to encourage larger cart sizes.
            </p>
          </div>
        </section>

        {/* Phase 5 */}
        <section id="phase-5" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Phase 5: Marketing & Getting Your First 100 Sales</h2>
          <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
            <p>
              Your store is live. Now, let's get traffic. You don't need a million Naira ad budget.
            </p>
            <ul className="list-disc pl-6 space-y-4 my-4">
              <li><strong>WhatsApp Status & Broadcasts:</strong> Your first 10 sales will come from people you know. Share your new store link on your status.</li>
              <li><strong>Instagram Reels & TikTok:</strong> Create short videos showing your product in use. Tag your location (e.g., "Lagos Small Chops").</li>
              <li><strong>Micro-Influencers:</strong> Find Instagram pages with 5k-10k followers in your niche. Offer them a free product in exchange for a review.</li>
              <li><strong>Run Meta Ads:</strong> Once you have a winning product, run Instagram ads targeting your specific city. Send them directly to your OrizzonCart product page, not your DMs.</li>
            </ul>
          </div>
        </section>

        {/* Final CTA */}
        <div className="my-16 text-center p-12 bg-gray-900 rounded-2xl text-white">
          <h2 className="text-3xl font-bold mb-4">Stop Managing DMs. Start Scaling Your Business.</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto text-lg">
            Join hundreds of Nigerian entrepreneurs who have automated their sales, payments, and logistics with OrizzonCart.
          </p>
          <Link href="/signup" className="inline-block px-8 py-4 bg-[#8B5CF6] hover:bg-purple-600 text-white font-bold rounded-lg shadow-lg transition-all transform hover:-translate-y-1 text-lg">
            Start Your Free Store Today
          </Link>
          <p className="text-gray-500 text-sm mt-4">No credit card required. Setup takes 2 minutes.</p>
        </div>

        {/* FAQ Section */}
        <section id="faq" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">How much does it cost to start an online store in Nigeria?</h3>
              <p className="text-gray-700">With OrizzonCart, you can start for free. You only pay when you choose to upgrade to a premium plan for advanced features. Your main costs will be your initial inventory and marketing budget.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Do I need to know how to code?</h3>
              <p className="text-gray-700">Absolutely not. OrizzonCart is a drag-and-drop, user-friendly platform designed for non-technical business owners.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Can I accept payments in Dollars if I want to sell abroad?</h3>
              <p className="text-gray-700">Yes! OrizzonCart supports multi-currency setups, allowing you to sell to the Nigerian diaspora and international customers seamlessly.</p>
            </div>
          </div>
        </section>

      </article>
    </main>
  );
}