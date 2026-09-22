import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How to Turn Your WhatsApp Business into a Fully Automated Store | OrizzonCart',
  description: 'Transform your WhatsApp from a messaging app into a 24/7 automated sales machine. Learn how Nigerian businesses are automating orders, payments, and customer service.',
};

export default function WhatsAppAutomatedStoreGuide() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 via-white to-emerald-50 py-20 px-4 sm:px-6 lg:px-8 border-b border-green-100">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-green-100 text-green-700 text-sm font-semibold mb-6">
            WhatsApp Commerce Guide
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 mb-6">
            How to Turn Your WhatsApp Business into a Fully Automated Store
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Stop manually responding to "How much?" and "Is this available?" 24/7. 
            Learn how Nigerian businesses are automating orders, payments, and customer service 
            on WhatsApp — while they sleep.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/signup" 
              className="px-8 py-4 bg-[#25D366] hover:bg-green-600 text-white font-bold rounded-lg shadow-lg transition-all transform hover:-translate-y-1"
            >
              Automate My WhatsApp Store
            </Link>
            <a 
              href="#table-of-contents" 
              className="px-8 py-4 bg-white border border-gray-300 hover:border-green-600 text-gray-700 font-bold rounded-lg transition-all"
            >
              Read the Guide
            </a>
          </div>
        </div>
      </section>

      {/* Content Container */}
      <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Introduction */}
        <div className="prose prose-lg max-w-none text-gray-700 space-y-6 mb-12">
          <p className="text-xl leading-relaxed">
            <strong>Picture this:</strong> It's 2 AM. A potential customer in Abuja is browsing your Instagram page. 
            They're interested in your product, but they have questions. They send you a WhatsApp message: 
            <em>"Good evening, how much is this?"</em>
          </p>
          <p className="text-xl leading-relaxed">
            You're fast asleep. By the time you wake up and respond at 7 AM, they've already bought from 
            your competitor who replied instantly.
          </p>
          <p className="text-xl leading-relaxed">
            This scenario plays out <strong>thousands of times daily</strong> across Nigeria. The solution? 
            <strong> WhatsApp automation.</strong>
          </p>
          <p className="text-xl leading-relaxed">
            In this comprehensive guide, you'll discover exactly how to transform your WhatsApp from a 
            simple messaging app into a <strong>24/7 automated sales machine</strong> that:
          </p>
          <ul className="list-disc pl-6 space-y-2 my-4">
            <li>Responds to customer inquiries instantly — even while you sleep</li>
            <li>Shows your products in a beautiful, organized catalog</li>
            <li>Takes orders automatically without your intervention</li>
            <li>Generates receipts and tracks deliveries</li>
            <li>Accepts payments via Paystack and Flutterwave</li>
            <li>Follows up with abandoned carts to recover lost sales</li>
          </ul>
          <p className="text-xl leading-relaxed">
            And the best part? You can set this up in under 30 minutes using <strong>OrizzonCart</strong>, 
            even if you're not tech-savvy.
          </p>
        </div>

        {/* Inline CTA Box 1 */}
        <div className="my-12 p-8 bg-green-50 border-l-4 border-[#25D366] rounded-r-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Skip the Setup Hassle</h3>
          <p className="text-gray-700 mb-4">
            OrizzonCart comes with WhatsApp automation built-in. Get your automated store live in minutes, not hours.
          </p>
          <Link href="/signup" className="inline-block px-6 py-3 bg-[#25D366] text-white font-semibold rounded-lg hover:bg-green-600 transition-colors">
            Start My Automated Store &rarr;
          </Link>
        </div>

        {/* Table of Contents */}
        <div id="table-of-contents" className="my-12 p-8 bg-gray-50 rounded-xl border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Table of Contents</h2>
          <ul className="space-y-2 text-gray-700">
            <li><a href="#why-whatsapp" className="hover:text-[#25D366] transition-colors">Why WhatsApp is Nigeria's #1 Sales Channel</a></li>
            <li><a href="#manual-vs-automated" className="hover:text-[#25D366] transition-colors">Manual vs Automated: The Brutal Truth</a></li>
            <li><a href="#step-1" className="hover:text-[#25D366] transition-colors">Step 1: Set Up WhatsApp Business Properly</a></li>
            <li><a href="#step-2" className="hover:text-[#25D366] transition-colors">Step 2: Create Your Product Catalog</a></li>
            <li><a href="#step-3" className="hover:text-[#25D366] transition-colors">Step 3: Build Your Automated Storefront</a></li>
            <li><a href="#step-4" className="hover:text-[#25D366] transition-colors">Step 4: Set Up Automated Responses</a></li>
            <li><a href="#step-5" className="hover:text-[#25D366] transition-colors">Step 5: Integrate Payments & Order Tracking</a></li>
            <li><a href="#advanced" className="hover:text-[#25D366] transition-colors">Advanced: WhatsApp API & Chatbots</a></li>
            <li><a href="#case-study" className="hover:text-[#25D366] transition-colors">Case Study: From DMs to ₦2M/Month</a></li>
            <li><a href="#faq" className="hover:text-[#25D366] transition-colors">Frequently Asked Questions</a></li>
          </ul>
        </div>

        {/* Section: Why WhatsApp */}
        <section id="why-whatsapp" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Why WhatsApp is Nigeria's #1 Sales Channel</h2>
          
          {/* Image: WhatsApp Usage Stats */}
          <div className="my-8 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
              <h3 className="text-2xl font-bold text-center mb-4">WhatsApp Commerce in Nigeria: By the Numbers</h3>
            </div>
            <div className="p-8 grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-extrabold text-[#25D366] mb-2">40M+</div>
                <p className="text-gray-600">Nigerians use WhatsApp daily</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-extrabold text-[#25D366] mb-2">85%</div>
                <p className="text-gray-600">Prefer buying via WhatsApp over websites</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-extrabold text-[#25D366] mb-2">3x</div>
                <p className="text-gray-600">Higher conversion vs Instagram DMs</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
            <p>
              WhatsApp isn't just a messaging app in Nigeria — it's <strong>the</strong> commerce platform. 
              From fashion vendors in Lagos to electronics sellers in Computer Village, everyone is selling on WhatsApp.
            </p>
            <p>
              But here's the problem: <strong>most businesses are using WhatsApp wrong.</strong>
            </p>
            <p>
              They're manually typing responses, copying product details, calculating totals by hand, 
              and losing sales because they can't respond fast enough.
            </p>
            <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">The WhatsApp Advantage</h3>
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li><strong>Instant Communication:</strong> 98% open rate vs 20% for email</li>
              <li><strong>Trust:</strong> Customers feel safer chatting than filling out web forms</li>
              <li><strong>Convenience:</strong> Nigerians already live on WhatsApp — meet them where they are</li>
              <li><strong>Rich Media:</strong> Send photos, videos, voice notes, and documents</li>
              <li><strong>Low Data Usage:</strong> Works even on slow networks</li>
            </ul>
          </div>
        </section>

        {/* Section: Manual vs Automated */}
        <section id="manual-vs-automated" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Manual vs Automated: The Brutal Truth</h2>
          
          {/* Comparison Image/Table */}
          <div className="my-8 overflow-hidden rounded-xl shadow-lg border border-gray-200">
            <div className="grid md:grid-cols-2">
              <div className="bg-red-50 p-8 border-r border-red-100">
                <h3 className="text-2xl font-bold text-red-700 mb-4 flex items-center gap-2">
                  <span>😓</span> Manual WhatsApp Selling
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span>
                    <span>Respond to "How much?" 50 times a day</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span>
                    <span>Calculate totals manually for each order</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span>
                    <span>Send account numbers one by one</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span>
                    <span>Track orders in messy notebooks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span>
                    <span>Lose sales when you're sleeping or busy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span>
                    <span>Spend 4-6 hours daily on repetitive chats</span>
                  </li>
                </ul>
              </div>
              <div className="bg-green-50 p-8">
                <h3 className="text-2xl font-bold text-green-700 mb-4 flex items-center gap-2">
                  <span>🚀</span> Automated WhatsApp Store
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Instant auto-replies with pricing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Automatic order calculation & receipts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Integrated payment links (Paystack/Flutterwave)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Digital order tracking system</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Sell 24/7 — even while you sleep</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Spend 30 mins daily on high-value tasks</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
            <p className="text-gray-800 font-medium">
              <strong>Real Talk:</strong> One Nigerian fashion vendor told us she was spending 6 hours daily 
              just responding to "How much?" and "Is this available?" After automating with OrizzonCart, 
              she cut that to 30 minutes and <strong>tripled her sales</strong> because she could focus on 
              sourcing new products and marketing.
            </p>
          </div>
        </section>

        {/* Step 1 */}
        <section id="step-1" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Step 1: Set Up WhatsApp Business Properly
          </h2>
          
          {/* Image: WhatsApp Business Setup */}
          <div className="my-8 bg-gray-100 rounded-xl p-8 border-2 border-dashed border-gray-300">
            <div className="text-center mb-4">
              <span className="text-6xl">📱</span>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h4 className="font-bold text-lg mb-4">WhatsApp Business Profile Checklist</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Professional business name (not "Blessing's Boutique 2024 ")</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>High-quality logo or profile photo</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Business description with what you sell</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Business hours (be realistic!)</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Physical address or service area</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Email and website link (your OrizzonCart store!)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
            <p>
              Before you automate, you need a solid foundation. Download <strong>WhatsApp Business</strong> 
              (not regular WhatsApp) and complete your profile 100%.
            </p>
            <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Critical Settings to Configure</h3>
            <ol className="list-decimal pl-6 space-y-4 my-4">
              <li>
                <strong>Business Hours:</strong> Set realistic hours. If you say "9 AM - 6 PM" but reply at 11 PM, 
                customers will expect instant responses 24/7.
              </li>
              <li>
                <strong>Away Message:</strong> This is your first automation! Set it to: 
                <em>"Thanks for messaging [Your Business Name]! We're currently away but will respond within 2 hours. 
                Meanwhile, browse our catalog: [your-store].orizzoncart.com"</em>
              </li>
              <li>
                <strong>Greeting Message:</strong> Auto-send when someone messages you first: 
                <em>"Welcome to [Business Name]! 👋 How can we help you today? Type:</em>
                <br /><code className="bg-gray-100 px-2 py-1 rounded">1</code> <em>to see our catalog</em>
                <br /><code className="bg-gray-100 px-2 py-1 rounded">2</code> <em>for pricing</em>
                <br /><code className="bg-gray-100 px-2 py-1 rounded">3</code> <em>to track an order</em>"
              </li>
            </ol>
          </div>
        </section>

        {/* Step 2 */}
        <section id="step-2" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Step 2: Create Your Product Catalog
          </h2>
          
          {/* Image: Catalog Example */}
          <div className="my-8 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 text-white">
              <h4 className="text-xl font-bold">WhatsApp Catalog Best Practices</h4>
            </div>
            <div className="p-6 grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-bold text-gray-900 mb-3">✅ DO This:</h5>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Use high-resolution photos (minimum 1080x1080)</li>
                  <li>• Write detailed descriptions with sizes, colors, materials</li>
                  <li>• Include prices in Naira (₦)</li>
                  <li>• Organize into collections (e.g., "Men's Shoes," "Accessories")</li>
                  <li>• Add product codes for easy reference</li>
                  <li>• Update stock availability regularly</li>
                </ul>
              </div>
              <div>
                <h5 className="font-bold text-gray-900 mb-3">❌ NOT This:</h5>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Blurry, dark, or watermarked images</li>
                  <li>• Vague descriptions like "Nice shoe"</li>
                  <li>• "DM for price" (you'll lose 70% of buyers)</li>
                  <li>• Mixing all products randomly</li>
                  <li>• No product codes (chaos when ordering)</li>
                  <li>• Showing out-of-stock items as available</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
            <p>
              WhatsApp Business allows you to create a catalog of up to 500 products. This is your 
              <strong> digital showroom</strong> — treat it like one.
            </p>
            <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">How to Add Products to Your Catalog</h3>
            <ol className="list-decimal pl-6 space-y-4 my-4">
              <li>Open WhatsApp Business → Settings → Business Tools → Catalog</li>
              <li>Tap "Add New Item"</li>
              <li>Upload 5-10 high-quality images per product</li>
              <li>Write a compelling title (e.g., "Premium Leather Sneakers - White")</li>
              <li>Add price in Naira</li>
              <li>Write a detailed description (materials, sizing, care instructions)</li>
              <li>Add a product code (e.g., "SHOE-001-WHT")</li>
              <li>Enable "Show on WhatsApp" and save</li>
            </ol>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
              <p className="text-gray-800">
                <strong>Pro Tip:</strong> OrizzonCart automatically syncs your store products to a 
                WhatsApp-compatible format. No manual catalog creation needed — just connect your 
                OrizzonCart store and your products appear instantly!
              </p>
            </div>
          </div>
        </section>

        {/* Step 3 */}
        <section id="step-3" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Step 3: Build Your Automated Storefront
          </h2>
          
          {/* Image: OrizzonCart + WhatsApp Integration */}
          <div className="my-8 bg-gradient-to-br from-purple-50 to-green-50 rounded-xl p-8 border border-gray-200">
            <div className="text-center mb-6">
              <span className="text-5xl">🏪</span>
              <h4 className="text-2xl font-bold text-gray-900 mt-4">The Power Combo: OrizzonCart + WhatsApp</h4>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h5 className="font-bold text-gray-900 mb-3">What You Get:</h5>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>✓ Beautiful online storefront</li>
                  <li>✓ Floating WhatsApp button on every page</li>
                  <li>✓ One-click "Buy via WhatsApp" buttons</li>
                  <li>✓ Automatic order notifications</li>
                  <li>✓ Integrated payment processing</li>
                  <li>✓ Real-time inventory sync</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h5 className="font-bold text-gray-900 mb-3">How It Works:</h5>
                <ol className="space-y-2 text-sm text-gray-700 list-decimal pl-4">
                  <li>Customer browses your OrizzonCart store</li>
                  <li>Clicks WhatsApp button to ask questions</li>
                  <li>You send product link + payment link</li>
                  <li>They pay via Paystack/Flutterwave</li>
                  <li>You get automatic order notification</li>
                  <li>System generates receipt & tracking</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
            <p>
              This is where the magic happens. Instead of manually sending product photos and prices, 
              you give customers a link to your <strong>OrizzonCart store</strong> — a professional, 
              mobile-optimized website that works seamlessly with WhatsApp.
            </p>
            <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Setting Up Your WhatsApp-Integrated Store</h3>
            <ol className="list-decimal pl-6 space-y-4 my-4">
              <li>
                <strong>Create Your OrizzonCart Store:</strong> Sign up at orizzoncart.name.ng and 
                choose your theme (takes 2 minutes).
              </li>
              <li>
                <strong>Add Your Products:</strong> Upload photos, prices, and descriptions. 
                This becomes your master catalog.
              </li>
              <li>
                <strong>Enable WhatsApp Integration:</strong> In your OrizzonCart dashboard, 
                go to Settings → WhatsApp and add your business number.
              </li>
              <li>
                <strong>Customize Your WhatsApp Button:</strong> Choose the text (e.g., "Order via WhatsApp" 
                or "Ask a Question") and position (bottom-right is standard).
              </li>
              <li>
                <strong>Set Up Auto-Messages:</strong> Configure what happens when someone clicks the button:
                <ul className="mt-2 space-y-1 text-gray-600">
                  <li>- Pre-fill message: "Hi! I'm interested in [Product Name]"</li>
                  <li>- Auto-send product link</li>
                  <li>- Auto-send pricing guide</li>
                </ul>
              </li>
            </ol>
          </div>

          {/* Inline CTA */}
          <div className="my-12 p-8 bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl text-white shadow-xl">
            <h3 className="text-2xl font-bold mb-2">Get WhatsApp Integration Free</h3>
            <p className="text-purple-100 mb-6">
              Every OrizzonCart store comes with WhatsApp automation built-in. No coding, no plugins, no hassle.
            </p>
            <Link href="/signup" className="inline-block px-6 py-3 bg-white text-purple-600 font-bold rounded-lg hover:bg-gray-100 transition-colors">
              Create My WhatsApp Store &rarr;
            </Link>
          </div>
        </section>

        {/* Step 4 */}
        <section id="step-4" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Step 4: Set Up Automated Responses
          </h2>
          
          {/* Image: Automated Response Flow */}
          <div className="my-8 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
              <h4 className="text-xl font-bold">Automated Response Flow Example</h4>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Customer sends: "How much?"</p>
                    <p className="text-sm text-gray-600 mt-1">Auto-reply triggers instantly</p>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-gray-400">↓</span>
                </div>
                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Auto-Reply:</p>
                    <p className="text-sm text-gray-600 mt-1">
                      "Thanks for your interest! Our prices range from ₦5,000 - ₦25,000. 
                      Browse our full catalog: [link] or tell me what you're looking for!"
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-gray-400">↓</span>
                </div>
                <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Customer clicks link</p>
                    <p className="text-sm text-gray-600 mt-1">Lands on your OrizzonCart store with full product details</p>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-gray-400">↓</span>
                </div>
                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold">4</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Customer orders & pays</p>
                    <p className="text-sm text-gray-600 mt-1">You receive automatic order notification with payment confirmation</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
            <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Essential Automated Messages to Set Up</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h5 className="font-bold text-gray-900 mb-3">1. Welcome Message</h5>
                <p className="text-sm text-gray-600 mb-2">Triggers when someone messages you first:</p>
                <code className="block bg-white p-3 rounded border text-sm text-gray-800">
                  "Welcome to [Business Name]! 👋<br/><br/>
                  We're here to help! Quick options:<br/>
                  📦 Type CATALOG to see products<br/>
                  💰 Type PRICE for our pricing guide<br/>
                  🚚 Type DELIVERY for shipping info<br/>
                  📞 Or just ask your question!"
                </code>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h5 className="font-bold text-gray-900 mb-3">2. Away Message</h5>
                <p className="text-sm text-gray-600 mb-2">Triggers outside business hours:</p>
                <code className="block bg-white p-3 rounded border text-sm text-gray-800">
                  "Thanks for messaging us! 🌙<br/><br/>
                  We're currently away but will respond by 9 AM tomorrow.<br/><br/>
                  Meanwhile:<br/>
                  • Browse our store: [link]<br/>
                  • Place your order (we'll process it first thing!)<br/><br/>
                  For urgent inquiries, email: support@yourbusiness.com"
                </code>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h5 className="font-bold text-gray-900 mb-3">3. Order Confirmation</h5>
                <p className="text-sm text-gray-600 mb-2">Auto-send after payment:</p>
                <code className="block bg-white p-3 rounded border text-sm text-gray-800">
                  "🎉 Order Confirmed!<br/><br/>
                  Thank you for your order #[ORDER_NUMBER]<br/><br/>
                  Items: [Product Names]<br/>
                  Total: [Amount]<br/>
                  Payment: ✅ Confirmed<br/><br/>
                  We'll ship within 24 hours. Track your order: [tracking link]"
                </code>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h5 className="font-bold text-gray-900 mb-3">4. Abandoned Cart</h5>
                <p className="text-sm text-gray-600 mb-2">Send 2 hours after cart abandonment:</p>
                <code className="block bg-white p-3 rounded border text-sm text-gray-800">
                  "Hey! 👋<br/><br/>
                  We noticed you left items in your cart.<br/><br/>
                  [Product Name] - ₦[Price]<br/><br/>
                  Complete your order now:<br/>
                  [Checkout Link]<br/><br/>
                  Questions? Reply to this message!"
                </code>
              </div>
            </div>
          </div>
        </section>

        {/* Step 5 */}
        <section id="step-5" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Step 5: Integrate Payments & Order Tracking
          </h2>
          
          <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
            <p>
              The biggest mistake Nigerian WhatsApp sellers make? <strong>Sending account numbers manually.</strong>
            </p>
            <p>
              This is 2024. Your customers want to pay with one click — not copy your account number, 
              open their banking app, paste, confirm, send you a screenshot, and wait for you to verify.
            </p>
            <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">The Automated Payment Flow</h3>
            <ol className="list-decimal pl-6 space-y-4 my-4">
              <li>
                <strong>Customer selects products</strong> on your OrizzonCart store or via WhatsApp catalog
              </li>
              <li>
                <strong>System generates total</strong> including delivery fee (auto-calculated by location)
              </li>
              <li>
                <strong>Customer clicks "Pay Now"</strong> → Redirected to Paystack/Flutterwave
              </li>
              <li>
                <strong>Payment processes</strong> (card, transfer, or USSD)
              </li>
              <li>
                <strong>Automatic confirmation</strong> sent to customer's WhatsApp + email
              </li>
              <li>
                <strong>You get notified</strong> in your OrizzonCart dashboard
              </li>
              <li>
                <strong>System generates receipt</strong> with order number and tracking code
              </li>
            </ol>
          </div>

          {/* Image: Payment Integration */}
          <div className="my-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 border border-gray-200">
            <h4 className="text-2xl font-bold text-center mb-6">Payment Gateway Integration</h4>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 text-center shadow-md">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">💳</span>
                </div>
                <h5 className="font-bold text-gray-900 mb-2">Paystack</h5>
                <p className="text-sm text-gray-600">Nigeria's #1 payment gateway. 1.5% transaction fee.</p>
              </div>
              <div className="bg-white rounded-lg p-6 text-center shadow-md">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">🌊</span>
                </div>
                <h5 className="font-bold text-gray-900 mb-2">Flutterwave</h5>
                <p className="text-sm text-gray-600">Accept local & international payments. 1.4% fee.</p>
              </div>
              <div className="bg-white rounded-lg p-6 text-center shadow-md">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">📱</span>
                </div>
                <h5 className="font-bold text-gray-900 mb-2">Cash on Delivery</h5>
                <p className="text-sm text-gray-600">Still offer COD? OrizzonCart tracks it automatically.</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
            <p className="text-gray-800">
              <strong>Real Impact:</strong> A Lagos sneaker vendor switched from manual account transfers 
              to automated Paystack payments via OrizzonCart. Result? <strong>40% more completed orders</strong> 
              because customers could pay instantly without the friction of manual transfers.
            </p>
          </div>
        </section>

        {/* Advanced Section */}
        <section id="advanced" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Advanced: WhatsApp API & Chatbots
          </h2>
          
          <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
            <p>
              Once you're doing 50+ orders daily, you might need <strong>WhatsApp Business API</strong> 
              for advanced automation [[2]][[4]].
            </p>
            <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">What the API Gives You</h3>
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li><strong>Multi-user access:</strong> Your whole team can respond from one number</li>
              <li><strong>Advanced chatbots:</strong> AI-powered responses for common questions</li>
              <li><strong>Bulk messaging:</strong> Send promotional broadcasts to thousands of customers</li>
              <li><strong>CRM integration:</strong> Connect to tools like Salesforce or HubSpot</li>
              <li><strong>Analytics:</strong> Deep insights into response times, conversion rates, etc.</li>
            </ul>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
              <p className="text-gray-800">
                <strong>Warning:</strong> The WhatsApp API costs money (usually ₦50,000+ monthly) and 
                requires technical setup. Most Nigerian businesses don't need it until they're doing 
                ₦5M+ monthly revenue.
              </p>
            </div>
            <p>
              For now, <strong>OrizzonCart's built-in WhatsApp features</strong> are more than enough to 
              automate 90% of your business. Upgrade to the API only when you're drowning in orders!
            </p>
          </div>
        </section>

        {/* Case Study */}
        <section id="case-study" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Case Study: From DMs to ₦2M/Month
          </h2>
          
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 border border-purple-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-purple-200 flex items-center justify-center flex-shrink-0">
                <span className="text-3xl">👩‍💼</span>
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">Blessing's Fashion Hub</h4>
                <p className="text-gray-600">Lagos-based clothing vendor</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h5 className="font-bold text-red-600 mb-3">Before (Manual)</h5>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Spent 6 hours/day on WhatsApp</li>
                  <li>• Lost 30% of sales to slow responses</li>
                  <li>• Made ₦400k monthly</li>
                  <li>• Constantly stressed & overwhelmed</li>
                  <li>• No order tracking system</li>
                  <li>• Manual payment verification</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h5 className="font-bold text-green-600 mb-3">After (Automated)</h5>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Spends 30 mins/day on WhatsApp</li>
                  <li>• 95% auto-response rate</li>
                  <li>• Makes ₦2.1M monthly (5x growth)</li>
                  <li>• Focused on sourcing & marketing</li>
                  <li>• Automated tracking & receipts</li>
                  <li>• Integrated Paystack payments</li>
                </ul>
              </div>
            </div>

            <blockquote className="bg-white rounded-lg p-6 border-l-4 border-purple-500 italic text-gray-700">
              "I used to wake up to 100+ unread messages. Now my OrizzonCart store handles everything 
              automatically. I only check WhatsApp to confirm orders and build relationships with 
              repeat customers. Best decision I made for my business."
              <footer className="text-sm text-gray-600 mt-2">— Blessing O., Lagos</footer>
            </blockquote>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Do I need WhatsApp Business API to automate?</h3>
              <p className="text-gray-700">No! WhatsApp Business app (free) has basic automation like away messages and quick replies. OrizzonCart adds advanced features like order tracking and payment integration without needing the paid API.</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Can customers pay directly in WhatsApp?</h3>
              <p className="text-gray-700">Not natively in Nigeria yet. But with OrizzonCart, you send a payment link via WhatsApp, they click and pay securely via Paystack/Flutterwave. It's seamless and takes 30 seconds.</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">What if I don't have a website?</h3>
              <p className="text-gray-700">OrizzonCart IS your website! You get a professional online store (like yourstore.orizzoncart.name.ng) that integrates perfectly with WhatsApp. No coding needed.</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">How much does WhatsApp automation cost?</h3>
              <p className="text-gray-700">WhatsApp Business app is free. OrizzonCart's free plan includes WhatsApp integration. When you're ready to accept payments, the activated store is ₦5,000 one-time — no monthly fees.</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Can I use this for services, not just products?</h3>
              <p className="text-gray-700">Absolutely! Whether you sell fashion, electronics, consulting, or catering, WhatsApp automation works. Just customize your catalog and messages to fit your service.</p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <div className="my-16 text-center p-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl text-white">
          <h2 className="text-3xl font-bold mb-4">Stop Losing Sales to Slow Responses</h2>
          <p className="text-green-100 mb-8 max-w-2xl mx-auto text-lg">
            Join 500+ Nigerian businesses already automating their WhatsApp sales with OrizzonCart. 
            Set up in 10 minutes. Start selling 24/7.
          </p>
          <Link href="/signup" className="inline-block px-8 py-4 bg-white text-green-700 font-bold rounded-lg shadow-lg hover:bg-gray-100 transition-all transform hover:-translate-y-1 text-lg">
            Automate My WhatsApp Store Now
          </Link>
          <p className="text-green-200 text-sm mt-4">Free to start • No credit card required • Setup in 10 minutes</p>
        </div>

      </article>
    </main>
  );
}