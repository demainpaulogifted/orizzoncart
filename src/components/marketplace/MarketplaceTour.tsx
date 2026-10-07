'use client';

import { useEffect, useState, useCallback } from 'react';

interface TourStep {
  id: string;
  title: string;
  text: string;
  icon: string;
  findTarget?: () => HTMLElement | null;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

function findSectionByHeading(text: string): HTMLElement | null {
  const headings = Array.from(document.querySelectorAll('h1, h2, h3'));
  const match = headings.find((h) => h.textContent?.includes(text));
  if (!match) return null;
  // Walk up to find the <section> ancestor
  let el: HTMLElement | null = match as HTMLElement;
  while (el && el.tagName !== 'SECTION' && el.tagName !== 'BODY') {
    el = el.parentElement;
  }
  return el?.tagName === 'SECTION' ? el : match as HTMLElement;
}

const STEPS: TourStep[] = [
  {
    id: 'welcome',
    icon: '🛍️',
    title: 'Welcome to OrizzonCart Marketplace',
    text: 'One app, hundreds of verified Nigerian stores. Let me show you around.',
    position: 'center',
  },
  {
    id: 'search',
    icon: '🔍',
    title: 'Find anything fast',
    text: 'Search for products, stores, or categories — everything you need in one place.',
    findTarget: () => document.querySelector('header input[name="q"]') as HTMLElement | null,
    position: 'bottom',
  },
  {
    id: 'categories',
    icon: '🏷️',
    title: 'Browse by category',
    text: 'Tap any category chip to filter — Fashion, Tech, Beauty, Foods and more.',
    findTarget: () => {
      const container = document.querySelector('main .flex.gap-2.overflow-x-auto');
      return container as HTMLElement | null;
    },
    position: 'bottom',
  },
  {
    id: 'stores',
    icon: '🏪',
    title: 'Shop trusted sellers',
    text: 'Every store here is ✅ verified. Tap a store to see its locations, ratings and reviews.',
    findTarget: () => findSectionByHeading('Featured Stores'),
    position: 'top',
  },
  {
    id: 'deals',
    icon: '⚡',
    title: 'Catch Flash Deals',
    text: 'Daily discounts up to 70% off. These move fast — grab them before they\'re gone.',
    findTarget: () => findSectionByHeading('Flash Deals'),
    position: 'top',
  },
  {
    id: 'fresh',
    icon: '✨',
    title: 'Fresh arrivals',
    text: 'New products added every day. Tap any product to view details and buy securely.',
    findTarget: () => findSectionByHeading('Fresh For You'),
    position: 'top',
  },
  {
    id: 'trust',
    icon: '🛡️',
    title: 'Shop with confidence',
    text: 'Verified sellers, secure payments, and trackable delivery on every order.',
    findTarget: () => {
      const grids = Array.from(document.querySelectorAll('main .grid.grid-cols-3'));
      return (grids[grids.length - 1] || null) as HTMLElement | null;
    },
    position: 'top',
  },
  {
    id: 'track',
    icon: '📦',
    title: 'Track any order',
    text: 'Use "Track Order" in the bottom bar — just enter your email + tracking number, no account needed.',
    findTarget: () => {
      // Target the bottom nav track button
      const btns = Array.from(document.querySelectorAll('nav a, nav button'));
      return (btns.find((b) => /track/i.test(b.textContent || '')) || null) as HTMLElement | null;
    },
    position: 'top',
  },
  {
    id: 'sell',
    icon: '➕',
    title: 'Want to SELL here?',
    text: 'Merchants: the purple + button is where you create your store and add the products that appear on this marketplace.',
    findTarget: () => {
      const btns = Array.from(document.querySelectorAll('nav a, nav button'));
      return (btns.find((b) => {
        const txt = b.textContent || '';
        return /publish|add|\+|create/i.test(txt) && /store|sell|marketplace/i.test(txt);
      }) || null) as HTMLElement | null;
    },
    position: 'top',
  },
  {
    id: 'complete',
    icon: '📲',
    title: 'You\'re all set!',
    text: 'Install the app for one-tap shopping and deal alerts. Enjoy your marketplace! 🎉',
    position: 'center',
  },
];

export function MarketplaceTour() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const currentStep = STEPS[step];

  const updateTargetRect = useCallback(() => {
    if (!currentStep?.findTarget) {
      setTargetRect(null);
      return;
    }
    const el = currentStep.findTarget();
    if (el) {
      // Scroll element into view if it's off-screen
      const rect = el.getBoundingClientRect();
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Re-measure after scroll
        setTimeout(() => {
          const newRect = el.getBoundingClientRect();
          setTargetRect(newRect);
        }, 400);
      } else {
        setTargetRect(rect);
      }
    } else {
      setTargetRect(null);
    }
  }, [currentStep]);

  useEffect(() => {
    try {
      if (!localStorage.getItem('orz_market_tour_done')) {
        const t = setTimeout(() => setOpen(true), 1500);
        return () => clearTimeout(t);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (open) {
      updateTargetRect();
      window.addEventListener('scroll', updateTargetRect, true);
      window.addEventListener('resize', updateTargetRect);
      return () => {
        window.removeEventListener('scroll', updateTargetRect, true);
        window.removeEventListener('resize', updateTargetRect);
      };
    }
  }, [open, step, updateTargetRect]);

  function close() {
    try {
      localStorage.setItem('orz_market_tour_done', '1');
    } catch {}
    setOpen(false);
  }

  function next() {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      close();
    }
  }

  function prev() {
    if (step > 0) {
      setStep(step - 1);
    }
  }

  if (!open) return null;

  const hasTarget = targetRect !== null && currentStep.position !== 'center';

  // Calculate tooltip position
  let tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9999,
    maxWidth: '320px',
  };

  let arrowStyle: React.CSSProperties = {
    position: 'absolute',
    width: '0',
    height: '0',
    borderStyle: 'solid',
  };

  if (!hasTarget || currentStep.position === 'center') {
    // Center on screen
    tooltipStyle.top = '50%';
    tooltipStyle.left = '50%';
    tooltipStyle.transform = 'translate(-50%, -50%)';
  } else {
    const padding = 16;
    const tooltipHeight = 220;
    const tooltipWidth = 320;

    switch (currentStep.position) {
      case 'top': {
        const top = targetRect.top - padding - tooltipHeight;
        tooltipStyle.top = Math.max(10, top);
        tooltipStyle.left = Math.min(
          Math.max(10, targetRect.left + targetRect.width / 2 - tooltipWidth / 2),
          window.innerWidth - tooltipWidth - 10
        );
        arrowStyle.bottom = '-8px';
        arrowStyle.left = '50%';
        arrowStyle.marginLeft = '-8px';
        arrowStyle.borderWidth = '8px 8px 0 8px';
        arrowStyle.borderColor = '#fff transparent transparent transparent';
        break;
      }
      case 'bottom': {
        const top = targetRect.bottom + padding;
        tooltipStyle.top = Math.min(top, window.innerHeight - tooltipHeight - 10);
        tooltipStyle.left = Math.min(
          Math.max(10, targetRect.left + targetRect.width / 2 - tooltipWidth / 2),
          window.innerWidth - tooltipWidth - 10
        );
        arrowStyle.top = '-8px';
        arrowStyle.left = '50%';
        arrowStyle.marginLeft = '-8px';
        arrowStyle.borderWidth = '0 8px 8px 8px';
        arrowStyle.borderColor = 'transparent transparent #fff transparent';
        break;
      }
      case 'left': {
        tooltipStyle.top = Math.max(10, targetRect.top + targetRect.height / 2 - tooltipHeight / 2);
        tooltipStyle.right = window.innerWidth - targetRect.left + padding;
        arrowStyle.right = '-8px';
        arrowStyle.top = '50%';
        arrowStyle.marginTop = '-8px';
        arrowStyle.borderWidth = '8px 0 8px 8px';
        arrowStyle.borderColor = 'transparent transparent transparent #fff';
        break;
      }
      case 'right': {
        tooltipStyle.top = Math.max(10, targetRect.top + targetRect.height / 2 - tooltipHeight / 2);
        tooltipStyle.left = Math.min(targetRect.right + padding, window.innerWidth - tooltipWidth - 10);
        arrowStyle.left = '-8px';
        arrowStyle.top = '50%';
        arrowStyle.marginTop = '-8px';
        arrowStyle.borderWidth = '8px 8px 8px 0';
        arrowStyle.borderColor = 'transparent #fff transparent transparent';
        break;
      }
    }
  }

  return (
    <>
      {/* Dark overlay with spotlight cutout */}
      {hasTarget && (
        <div
          className="fixed inset-0 z-[9998] pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${targetRect.left + targetRect.width / 2}px ${
              targetRect.top + targetRect.height / 2
            }px, transparent 0px, transparent ${Math.max(targetRect.width, targetRect.height) / 2 + 10}px, rgba(0,0,0,0.65) ${
              Math.max(targetRect.width, targetRect.height) / 2 + 12
            }px)`,
          }}
        />
      )}
      {!hasTarget && (
        <div className="fixed inset-0 z-[9998] bg-black/60 pointer-events-none" />
      )}

      {/* Highlight ring around target */}
      {hasTarget && (
        <div
          className="fixed z-[9998] pointer-events-none border-4 border-purple-500 rounded-2xl animate-pulse"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
          }}
        />
      )}

      {/* Tooltip card */}
      <div style={tooltipStyle} className="bg-white rounded-2xl shadow-2xl p-6 space-y-4">
        <div style={arrowStyle} />
        <div className="text-center space-y-3">
          <span className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-700 to-blue-700 text-white text-2xl items-center justify-center shadow-lg">
            {currentStep.icon}
          </span>
          <h2 className="text-lg font-extrabold text-gray-900">{currentStep.title}</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{currentStep.text}</p>
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
              onClick={prev}
              className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-200"
            >
              Back
            </button>
          )}
          <button
            onClick={next}
            className="flex-1 py-2.5 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700"
          >
            {step === STEPS.length - 1 ? 'Start Shopping 🛍️' : 'Next →'}
          </button>
        </div>
      </div>
    </>
  );
}