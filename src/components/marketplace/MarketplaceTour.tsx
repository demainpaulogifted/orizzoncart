'use client';

import { useEffect, useState } from 'react';

const STEPS = [
  {
    icon: '🛍️',
    title: 'Welcome to OrizzonCart Marketplace',
    text: 'One app, hundreds of verified Nigerian stores. Flash deals, secure payments and trackable delivery.',
  },
  {
    icon: '🔍',
    title: 'Find anything fast',
    text: 'Use the search bar and category chips at the top to discover products — fashion, tech, beauty, foods and more.',
  },
  {
    icon: '🏪',
    title: 'Shop with confidence',
    text: 'Tap any store to see its ✅ verified badge, physical locations, star ratings and customer reviews before you buy.',
  },
  {
    icon: '📦',
    title: 'Track your orders',
    text: '"My Order" at the bottom tracks any order with your email + tracking number — no account needed.',
  },
  {
    icon: '➕',
    title: 'Want to SELL here?',
    text: 'Merchants: the purple + (Publish) button in the bottom bar is where you create your store and add the products that appear on this marketplace.',
  },
  {
    icon: '📲',
    title: 'Install the app',
    text: 'Tap "Get App" to install OrizzonCart Marketplace on your phone for one-tap shopping and deal alerts. Enjoy! 🎉',
  },
];

export function MarketplaceTour() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      if (!localStorage.getItem('orz_market_tour_done')) {
        const t = setTimeout(() => setOpen(true), 1200);
        return () => clearTimeout(t);
      }
    } catch {}
  }, []);

  function close() {
    try {
      localStorage.setItem('orz_market_tour_done', '1');
    } catch {}
    setOpen(false);
  }

  if (!open) return null;

  const s = STEPS[step];
  const last = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[95] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 space-y-4">
        <div className="text-center space-y-3">
          <span className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-700 to-blue-700 text-white text-3xl items-center justify-center shadow-lg">
            {s.icon}
          </span>
          <h2 className="text-lg font-extrabold text-gray-900">{s.title}</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{s.text}</p>
        </div>

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
            {last ? 'Start Shopping 🛍️' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}