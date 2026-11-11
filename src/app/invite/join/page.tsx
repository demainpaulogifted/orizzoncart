'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const BANKS = [
  { name: 'Access Bank', code: '044' },
  { name: 'Citibank Nigeria', code: '023' },
  { name: 'Ecobank Nigeria', code: '050' },
  { name: 'Fidelity Bank', code: '070' },
  { name: 'First Bank of Nigeria', code: '011' },
  { name: 'First City Monument Bank (FCMB)', code: '214' },
  { name: 'Globus Bank', code: '00103' },
  { name: 'Guaranty Trust Bank (GTBank)', code: '058' },
  { name: 'Heritage Bank', code: '030' },
  { name: 'Keystone Bank', code: '082' },
  { name: 'Polaris Bank', code: '076' },
  { name: 'Providus Bank', code: '101' },
  { name: 'Stanbic IBTC Bank', code: '221' },
  { name: 'Standard Chartered Bank', code: '068' },
  { name: 'Sterling Bank', code: '232' },
  { name: 'Union Bank of Nigeria', code: '032' },
  { name: 'United Bank for Africa (UBA)', code: '033' },
  { name: 'Unity Bank', code: '215' },
  { name: 'Wema Bank (ALAT)', code: '035' },
  { name: 'Zenith Bank', code: '057' },
  { name: 'Moniepoint MFB', code: '50515' },
  { name: 'Kuda Bank', code: '50211' },
  { name: 'OPay', code: '999992' },
  { name: 'PalmPay', code: '999991' },
  { name: 'FairMoney MFB', code: '51318' },
];

const steps = [
  {
    number: '01',
    title: 'Become a partner',
    description:
      'Register with your email and verified bank account. You do not need to own a business or have an existing online store.',
  },
  {
    number: '02',
    title: 'Get your personal referral link',
    description:
      'Your unique invitation link identifies the merchants who register through your recommendation.',
  },
  {
    number: '03',
    title: 'Introduce business owners',
    description:
      'Share your link with friends, family, relatives, colleagues, business owners and your social-media audience.',
  },
  {
    number: '04',
    title: 'Earn ₦500 per activated store',
    description:
      'When a merchant referred through your link completes the required payment activation, ₦500 is credited to your pending referral earnings.',
  },
];

const audiences = [
  'Fashion boutiques and clothing sellers',
  'Beauty salons and cosmetics businesses',
  'Restaurants and food vendors',
  'Home bakers and caterers',
  'Supermarkets and provision stores',
  'Market traders and shop owners',
  'Social-media and online sellers',
  'Electronics and gadget dealers',
  'Phone and computer accessory sellers',
  'Handmade and craft businesses',
  'Home and furniture businesses',
  'Entrepreneurs with growing businesses',
];

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-7">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-purple-700">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-black tracking-tight text-gray-950 sm:text-3xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base">
          {description}
        </p>
      )}
    </div>
  );
}

export default function InviteJoinPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [bankName, setBankName] = useState(BANKS[0].name);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [loading, setLoading] = useState(false);

  const bankCode = useMemo(
    () => BANKS.find((bank) => bank.name === bankName)?.code || '',
    [bankName]
  );

  async function verifyAccount() {
    if (!/^\d{10}$/.test(accountNumber)) {
      toast.error('Enter a valid 10-digit account number');
      return;
    }

    setVerifying(true);
    setAccountName('');

    try {
      const res = await fetch('/api/invite/resolve-bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_number: accountNumber,
          bank_code: bankCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Account verification failed');
      }

      setAccountName(data.account_name);
      toast.success('Bank account successfully verified');
    } catch (error: any) {
      toast.error(error.message || 'Could not verify account');
    } finally {
      setVerifying(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!accountName) {
      toast.error('Please verify your bank account first');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/invite/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          bank_name: bankName,
          bank_code: bankCode,
          account_number: accountNumber,
          account_name: accountName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      toast.success(
        data.returning
          ? 'Welcome back to the partner programme!'
          : 'Your partner registration was successful!'
      );

      router.push(
        `/invite/dashboard?email=${encodeURIComponent(email.trim().toLowerCase())}`
      );
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#FAF8FF] text-gray-900">

      {/* Navigation */}
      <nav className="sticky top-0 z-30 border-b border-purple-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 rounded-full border border-purple-100 px-3 py-2 text-sm font-bold text-purple-800 transition hover:bg-purple-50"
          >
            <span>←</span>
            Marketplace
          </Link>

          <span className="text-sm font-black tracking-tight text-purple-800 sm:text-base">
            OrizzonCart
          </span>

          <Link
            href="/marketplace"
            className="rounded-full bg-purple-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-purple-800 sm:text-sm"
          >
            Explore Marketplace
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#32105F] via-[#5421A0] to-[#702BC1] text-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-purple-300/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-amber-300/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-purple-100">
              <span className="h-2 w-2 rounded-full bg-amber-300" />
              OrizzonCart Partner Programme
            </div>

            <h1 className="mt-7 text-4xl font-black leading-[1.12] tracking-tight sm:text-6xl">
              Your connections
              <span className="block text-amber-300">
                can earn you money.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-purple-100 sm:text-lg">
              You probably know people who own businesses. Friends, relatives,
              neighbours, colleagues and entrepreneurs. Introduce them to
              OrizzonCart and earn a referral reward when their stores activate
              payments.
            </p>

            <div className="mt-8 inline-flex flex-wrap items-center gap-4 rounded-2xl border border-amber-200/30 bg-white/10 p-4 sm:p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-purple-200">
                  Your reward
                </p>
                <p className="mt-1 text-4xl font-black text-amber-300 sm:text-5xl">
                  ₦500
                </p>
              </div>
              <div className="h-12 w-px bg-white/20" />
              <div>
                <p className="font-extrabold text-white">
                  Per activated referred store
                </p>
                <p className="mt-1 text-xs leading-5 text-purple-200">
                  No need to own a business yourself.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#register"
                className="rounded-xl bg-amber-400 px-7 py-4 text-center font-black text-purple-950 shadow-lg transition hover:bg-amber-300"
              >
                Become a Partner →
              </a>
              <Link
                href="/marketplace"
                className="rounded-xl border border-white/30 bg-white/10 px-7 py-4 text-center font-bold text-white transition hover:bg-white/20"
              >
                Explore Marketplace
              </Link>
            </div>

            <p className="mt-5 text-xs text-purple-200">
              Your role is to introduce businesses. OrizzonCart provides the
              selling platform.
            </p>
          </div>
        </div>
      </section>

      {/* What is OrizzonCart */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <SectionHeading
          eyebrow="Know what you are introducing"
          title="First, understand the OrizzonCart ecosystem."
          description="When you recommend something, you should be able to explain what it does. Here is what business owners get when they join."
        />

        <div className="grid gap-5 md:grid-cols-2">
          <article className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-2xl">
              🏪
            </div>
            <p className="mt-5 text-xs font-black uppercase tracking-widest text-purple-700">
              The e-commerce platform
            </p>
            <h3 className="mt-2 text-2xl font-black text-gray-950">
              What is OrizzonCart?
            </h3>
            <p className="mt-4 text-sm leading-7 text-gray-600">
              OrizzonCart is an e-commerce platform built to help entrepreneurs
              and business owners take their businesses online. Merchants can
              create their own professional online stores, display products,
              manage orders, connect with customers and set up payment
              collection.
            </p>
            <ul className="mt-5 space-y-3 text-sm font-medium text-gray-700">
              <li>✓ Individual online storefronts</li>
              <li>✓ Product and business presentation</li>
              <li>✓ Payment and order management tools</li>
              <li>✓ Store links that merchants can share</li>
              <li>✓ Tools to support online selling</li>
            </ul>
            <Link
              href="/about"
              className="mt-7 inline-flex font-bold text-purple-700 hover:underline"
            >
              Learn about OrizzonCart →
            </Link>
          </article>

          <article className="rounded-3xl border border-amber-200 bg-[#FFF9ED] p-6 shadow-sm sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-2xl">
              🛍️
            </div>
            <p className="mt-5 text-xs font-black uppercase tracking-widest text-amber-700">
              The shopping destination
            </p>
            <h3 className="mt-2 text-2xl font-black text-gray-950">
              What is OrizzonCart Marketplace?
            </h3>
            <p className="mt-4 text-sm leading-7 text-gray-600">
              OrizzonCart Marketplace is the customer-facing shopping
              destination where shoppers can discover products and browse
              participating merchant stores in one place. It gives eligible
              merchants another opportunity to become visible to potential
              customers.
            </p>
            <ul className="mt-5 space-y-3 text-sm font-medium text-gray-700">
              <li>✓ Discover products from different businesses</li>
              <li>✓ Browse participating merchant stores</li>
              <li>✓ Find fashion, food, beauty and more</li>
              <li>✓ Explore different sellers in one destination</li>
              <li>✓ Visit individual merchant storefronts</li>
            </ul>
            <Link
              href="/marketplace"
              className="mt-7 inline-flex font-bold text-amber-800 hover:underline"
            >
              Visit OrizzonCart Marketplace →
            </Link>
          </article>
        </div>

        <div className="mt-6 rounded-2xl bg-purple-900 p-6 text-white sm:p-8">
          <h3 className="text-xl font-black">The difference is simple.</h3>
          <p className="mt-3 text-sm leading-7 text-purple-100">
            OrizzonCart gives a merchant the tools to build and manage their
            own online store. OrizzonCart Marketplace brings participating
            stores together so customers can discover and shop from them.
            They work together to support businesses selling online.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <SectionHeading
            eyebrow="The earning process"
            title="How the partner programme works."
            description="Four straightforward steps. You introduce business owners, they join through your link, and qualifying store activations earn you a reward."
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <article
                key={step.number}
                className="rounded-2xl border border-gray-100 bg-[#FAF8FF] p-5 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <span className="text-3xl font-black text-purple-200">
                  {step.number}
                </span>
                <h3 className="mt-5 text-lg font-extrabold text-gray-950">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-gray-600">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Who to invite */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <SectionHeading
          eyebrow="Your everyday connections"
          title="Who should you invite?"
          description="Look around you. Many people already have businesses but need better ways to present their products and reach customers online."
        />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {audiences.map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-xl border border-purple-100 bg-white p-4"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-black text-purple-700">
                ✓
              </span>
              <span className="text-sm font-semibold leading-6 text-gray-700">
                {item}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-7">
          <h3 className="text-lg font-black text-gray-950">
            Your first referrals might be closer than you think.
          </h3>
          <p className="mt-2 text-sm leading-7 text-gray-700">
            Start with your family members, friends, relatives, neighbours,
            church or community contacts, colleagues and people you already
            know who run businesses. You can also share your invitation on
            Facebook, TikTok, WhatsApp and other social platforms.
          </p>
        </div>
      </section>

      {/* Earning illustration */}
      <section className="bg-purple-900 py-16 text-white sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-widest text-amber-300">
              Your earning potential
            </p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Every qualifying store adds another ₦500.
            </h2>
            <p className="mt-4 text-sm leading-7 text-purple-200">
              Here are simple examples of how referral rewards add up when
              different numbers of referred stores complete activation.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { stores: '5 stores', amount: '₦2,500' },
              { stores: '10 stores', amount: '₦5,000' },
              { stores: '50 stores', amount: '₦25,000' },
            ].map((item) => (
              <div
                key={item.stores}
                className="rounded-2xl border border-white/10 bg-white/10 p-6"
              >
                <p className="text-sm font-bold text-purple-200">
                  {item.stores} activated
                </p>
                <p className="mt-2 text-3xl font-black text-amber-300">
                  {item.amount}
                </p>
                <p className="mt-2 text-xs text-purple-200">
                  Illustrative referral reward total
                </p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-xs leading-6 text-purple-300">
            These are calculation examples, not guaranteed earnings. Actual
            rewards depend on the number of eligible referred stores that
            successfully activate payments.
          </p>
        </div>
      </section>

      {/* Important conditions */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <SectionHeading
          eyebrow="Transparency matters"
          title="When exactly do you earn?"
          description="We want every partner to understand the reward conditions before joining."
        />

        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
            <h3 className="font-black text-green-900">
              What qualifies for a reward?
            </h3>
            <p className="mt-3 text-sm leading-7 text-green-900">
              A merchant must register through your referral link and
              successfully complete the required payment activation process.
              When the activation is recorded, ₦500 is added to your pending
              earnings.
            </p>
          </div>

          <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
            <h3 className="font-black text-red-900">
              What does not qualify by itself?
            </h3>
            <p className="mt-3 text-sm leading-7 text-red-900">
              A link click, social-media share, incomplete registration or
              merchant registration without successful payment activation
              does not generate a referral reward.
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-6">
          <h3 className="font-black text-gray-950">
            How are partners paid?
          </h3>
          <p className="mt-3 text-sm leading-7 text-gray-600">
            Your partner dashboard displays registered stores, activated
            stores, pending earnings and amounts recorded as paid. Referral
            rewards are currently paid manually to the verified bank account
            supplied during registration.
          </p>
        </div>
      </section>

      {/* Registration */}
      <section id="register" className="scroll-mt-24 bg-[#F1EAFE] px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">

          <div className="pt-3">
            <p className="text-xs font-black uppercase tracking-widest text-purple-700">
              Your next step starts here
            </p>
            <h2 className="mt-3 text-3xl font-black leading-tight text-gray-950 sm:text-4xl">
              Become an OrizzonCart referral partner.
            </h2>
            <p className="mt-5 text-sm leading-7 text-gray-600">
              Create your partner registration, verify your bank account and
              get your personal invitation link. Start introducing business
              owners to OrizzonCart.
            </p>

            <div className="mt-7 space-y-4">
              {[
                'Register with your email',
                'Choose your bank and enter your account number',
                'Verify your account name',
                'Receive your personal referral link',
                'Start sharing with business owners',
              ].map((item, index) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-700 text-xs font-black text-white">
                    {index + 1}
                  </span>
                  <span className="text-sm font-semibold text-gray-700">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <Link
              href="/marketplace"
              className="mt-8 inline-flex rounded-xl border-2 border-purple-700 px-6 py-3 font-bold text-purple-800 transition hover:bg-purple-700 hover:text-white"
            >
              ← Return to Marketplace
            </Link>
          </div>

          <div className="rounded-3xl border border-purple-100 bg-white p-5 shadow-xl shadow-purple-900/5 sm:p-8">
            <div className="mb-7">
              <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-amber-800">
                Partner registration
              </span>
              <h3 className="mt-4 text-2xl font-black text-gray-950">
                Get your personal invite link.
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                Complete your details below to get started.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-800">
                  Email address
                </label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 outline-none transition focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100"
                  placeholder="you@example.com"
                />
                <p className="mt-1.5 text-xs text-gray-400">
                  Use an email address you can access.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-800">
                  Select your bank
                </label>
                <select
                  value={bankName}
                  onChange={(e) => {
                    setBankName(e.target.value);
                    setAccountName('');
                  }}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 outline-none transition focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100"
                >
                  {BANKS.map((bank) => (
                    <option key={bank.code + bank.name} value={bank.name}>
                      {bank.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-800">
                  Account number
                </label>
                <input
                  required
                  inputMode="numeric"
                  maxLength={10}
                  value={accountNumber}
                  onChange={(e) => {
                    setAccountNumber(
                      e.target.value.replace(/\D/g, '').slice(0, 10)
                    );
                    setAccountName('');
                  }}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 outline-none transition focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100"
                  placeholder="Enter 10-digit account number"
                />

                <button
                  type="button"
                  onClick={() => void verifyAccount()}
                  disabled={verifying}
                  className="mt-3 w-full rounded-xl border-2 border-purple-700 px-4 py-3 font-bold text-purple-800 transition hover:bg-purple-50 disabled:opacity-50"
                >
                  {verifying ? 'Verifying account...' : 'Verify bank account'}
                </button>

                {accountName && (
                  <div className="mt-3 rounded-xl border border-green-200 bg-green-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-green-700">
                      Verified account name
                    </p>
                    <p className="mt-1 font-extrabold text-green-900">
                      ✓ {accountName}
                    </p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !accountName}
                className="w-full rounded-xl bg-gradient-to-r from-purple-700 to-purple-600 px-5 py-4 font-black text-white shadow-lg shadow-purple-200 transition hover:from-purple-800 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? 'Creating your partner account...'
                  : 'Create my account and get my invite link →'}
              </button>

              <p className="text-center text-xs leading-6 text-gray-400">
                Your bank details are used for referral payout purposes.
                Rewards are subject to successful referral attribution and
                payment activation.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-white px-5 py-14 text-center sm:py-16">
        <h2 className="text-2xl font-black text-gray-950 sm:text-3xl">
          Know a business owner? Introduce them today.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-gray-600">
          Help Nigerian businesses discover better opportunities to sell
          online while building your own referral earnings.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href="#register"
            className="rounded-xl bg-purple-700 px-7 py-4 font-black text-white transition hover:bg-purple-800"
          >
            Join the Partner Programme
          </a>
          <Link
            href="/marketplace"
            className="rounded-xl border-2 border-purple-200 px-7 py-4 font-bold text-purple-800 transition hover:bg-purple-50"
          >
            Explore Marketplace
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-100 bg-[#FAF8FF] px-5 py-7 text-center">
        <p className="font-black text-purple-800">OrizzonCart</p>
        <p className="mt-2 text-xs text-gray-500">
          Empowering businesses to sell online. Connecting customers with
          businesses through OrizzonCart Marketplace.
        </p>
        <Link
          href="/marketplace"
          className="mt-4 inline-block text-sm font-bold text-purple-700 hover:underline"
        >
          Visit Marketplace
        </Link>
      </footer>
    </main>
  );
}
