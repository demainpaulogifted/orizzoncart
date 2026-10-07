'use client';

import { useEffect, useState } from 'react';

const STEPS = [
  {
    icon: '👋',
    title: 'Welcome to your store dashboard!',
    text: 'This 30-second tour shows you everything you need to launch and start selling today.',
  },
  {
    icon: '☰',
    title: 'Your menu',
    text: 'Tap the hamburger (top-left) to open navigation: Products, Orders, Marketing, Settings and more.',
  },
  {
    icon: '📦',
    title: 'Add your products',
    text: 'Open Products → "+ Add Product". A name, a price and a photo is all you need. Want instant inventory? Use Marketing → Other Tools → Source Products to import from CJ or Alibaba.',
  },
  {
    icon: '🛍️',
    title: 'Sync to the Marketplace',
    text: 'Go to Settings → Marketplace, complete verification and switch ON "List on Marketplace". Your products instantly sync to thousands of shoppers on the OrizzonCart Marketplace app.',
  },
  {
    icon: '👀',
    title: 'Your storefront',
    text: 'Open the menu → "View My Store" to see your live store (yourstore.orizzoncart.name.ng). Share that link on WhatsApp & Instagram!',
  },
  {
    icon: '💳',
    title: 'Get paid',
    text: 'Settings → connect Paystack/Flutterwave or your bank account (OrizzonPay) to unlock checkout and receive payments directly into your account.',
  },
  {
    icon: '🚀',
    title: 'You are ready!',
    text: 'Add products → activate payments → share your link. Questions? Tap Help anytime. Now go own your sales! 💪',
  },
];

export function MerchantTour() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      if (!localStorage.getItem('orz_merchant_tour_done')) {
        const t = setTimeout(() => setOpen(true), 800);
        return () => clearTimeout(t);
      }
    } catch {}
  }, []);

  function close() {
    try {
      localStorage.setItem('orz_merchant_tour_done', '1');
    } catch {}
    setOpen(false);
  }

  if (!open) return null;

  const s = STEPS[step];
  const last = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 space-y-4">
        <div className="text-center space-y-3">
          <span className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 text-white text-3xl items-center justify-center shadow-lg">
            {s.icon}
          </span>
          <h2 className="text-lg font-extrabold text-gray-900">{s.title}</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{s.text}</p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? 'w-6 bg-purple-600' : 'w-1.5 bg-gray-200'
              }`}
            />
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={close}
            className="px-4 py-2.5 text-xs font-bold text-gray-400 hover:text-gray-600"
          >
            Skip
          </button>
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-200"
            >
              Back
            </button>
          )}
          <button
            onClick={() => (last ? close() : setStep(step + 1))}
            className="flex-1 py-2.5 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700"
          >
            {last ? 'Finish 🎉' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}