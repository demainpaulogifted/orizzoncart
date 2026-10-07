'use client';

import { useEffect, useState, useCallback } from 'react';

interface TourStep {
  id: string;
  title: string;
  text: string;
  icon: string;
  target?: string; // CSS selector for the element to highlight
  position: 'top' | 'bottom' | 'left' | 'right';
}

const STEPS: TourStep[] = [
  {
    id: 'welcome',
    icon: '👋',
    title: 'Welcome to your dashboard!',
    text: 'Let me show you around. I\'ll highlight each important area as we go.',
    position: 'bottom',
  },
  {
    id: 'menu',
    icon: '☰',
    title: 'Your navigation menu',
    text: 'Tap here anytime to access Products, Orders, Marketing, Settings and more.',
    target: '[aria-label="Open menu"]',
    position: 'right',
  },
  {
    id: 'products',
    icon: '📦',
    title: 'Add your first product',
    text: 'Go to Products → "+ Add Product". A name, price and photo is all you need.',
    target: 'a[href="/dashboard/products"]',
    position: 'right',
  },
  {
    id: 'orders',
    icon: '🛒',
    title: 'Track your orders',
    text: 'When customers buy, orders appear here with payment status and customer details.',
    target: 'a[href="/dashboard/orders"]',
    position: 'right',
  },
  {
    id: 'marketing',
    icon: '📣',
    title: 'Grow your store',
    text: 'Marketing tools help you reach more customers. Find dropship sourcing, SEO, and more.',
    target: 'a[href="/dashboard/marketing"]',
    position: 'right',
  },
  {
    id: 'settings',
    icon: '⚙️',
    title: 'Configure your store',
    text: 'Connect payments, set shipping zones, manage verification — all in Settings.',
    target: 'a[href="/dashboard/settings"]',
    position: 'right',
  },
  {
    id: 'store-link',
    icon: '👀',
    title: 'Your live storefront',
    text: 'Tap here to see your public store. Share this link on WhatsApp & Instagram!',
    target: 'a[href*="/store/"]',
    position: 'left',
  },
  {
    id: 'complete',
    icon: '🎉',
    title: 'You\'re ready!',
    text: 'Start by adding products, then activate payments. Need help? Tap Help anytime.',
    position: 'bottom',
  },
];

export function MerchantTour() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const currentStep = STEPS[step];

  // Find and measure the target element
  const updateTargetRect = useCallback(() => {
    if (!currentStep?.target) {
      setTargetRect(null);
      return;
    }
    const el = document.querySelector(currentStep.target);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  }, [currentStep]);

  useEffect(() => {
    // Only show tour once
    try {
      if (!localStorage.getItem('orz_merchant_tour_done')) {
        const t = setTimeout(() => setOpen(true), 1000);
        return () => clearTimeout(t);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (open) {
      updateTargetRect();
      // Update rect on scroll/resize
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
      localStorage.setItem('orz_merchant_tour_done', '1');
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

  const hasTarget = targetRect !== null;

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

  if (hasTarget) {
    const padding = 16;
    switch (currentStep.position) {
      case 'top':
        tooltipStyle.top = targetRect.top - padding - 180;
        tooltipStyle.left = targetRect.left + targetRect.width / 2 - 160;
        arrowStyle.bottom = '-8px';
        arrowStyle.left = '50%';
        arrowStyle.marginLeft = '-8px';
        arrowStyle.borderWidth = '8px 8px 0 8px';
        arrowStyle.borderColor = '#fff transparent transparent transparent';
        break;
      case 'bottom':
        tooltipStyle.top = targetRect.bottom + padding;
        tooltipStyle.left = targetRect.left + targetRect.width / 2 - 160;
        arrowStyle.top = '-8px';
        arrowStyle.left = '50%';
        arrowStyle.marginLeft = '-8px';
        arrowStyle.borderWidth = '0 8px 8px 8px';
        arrowStyle.borderColor = 'transparent transparent #fff transparent';
        break;
      case 'left':
        tooltipStyle.top = targetRect.top + targetRect.height / 2 - 90;
        tooltipStyle.right = window.innerWidth - targetRect.left + padding;
        arrowStyle.right = '-8px';
        arrowStyle.top = '50%';
        arrowStyle.marginTop = '-8px';
        arrowStyle.borderWidth = '8px 0 8px 8px';
        arrowStyle.borderColor = 'transparent transparent transparent #fff';
        break;
      case 'right':
        tooltipStyle.top = targetRect.top + targetRect.height / 2 - 90;
        tooltipStyle.left = targetRect.right + padding;
        arrowStyle.left = '-8px';
        arrowStyle.top = '50%';
        arrowStyle.marginTop = '-8px';
        arrowStyle.borderWidth = '8px 8px 8px 0';
        arrowStyle.borderColor = 'transparent #fff transparent transparent';
        break;
    }
  } else {
    // Center on screen if no target
    tooltipStyle.top = '50%';
    tooltipStyle.left = '50%';
    tooltipStyle.transform = 'translate(-50%, -50%)';
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
            }px, transparent 0px, transparent ${Math.max(targetRect.width, targetRect.height) / 2 + 10}px, rgba(0,0,0,0.6) ${
              Math.max(targetRect.width, targetRect.height) / 2 + 12
            }px)`,
          }}
        />
      )}

      {/* Highlight ring around target */}
      {hasTarget && (
        <div
          className="fixed z-[9998] pointer-events-none border-4 border-purple-500 rounded-lg animate-pulse"
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
          <span className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 text-white text-2xl items-center justify-center shadow-lg">
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
            {step === STEPS.length - 1 ? 'Finish 🎉' : 'Next →'}
          </button>
        </div>
      </div>
    </>
  );
}