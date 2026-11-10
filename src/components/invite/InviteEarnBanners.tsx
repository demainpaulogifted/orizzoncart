'use client';
import Link from 'next/link';
import { INVITE_EARN_ENABLED } from '@/lib/invite';

export function MarketplaceInviteBanner() {
  if (!INVITE_EARN_ENABLED) return null;
  return (
    <section className="space-y-3">
      <div className="bg-white border border-purple-100 rounded-2xl p-4 shadow-sm">
        <p className="text-[11px] font-extrabold uppercase tracking-wide text-purple-600 mb-1">For business owners</p>
        <h2 className="font-extrabold text-gray-900 text-base leading-snug">Sell on OrizzonCart Marketplace</h2>
        <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
          Fashion, food, beauty, tech, digital — list your products, get verified, and reach shoppers across Nigeria. Your own store link + WhatsApp selling + Marketplace exposure. Free to launch.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/signup" className="px-4 py-2 bg-purple-600 text-white text-xs font-extrabold rounded-full hover:bg-purple-700">Open a free store →</Link>
          <Link href="/orizzoncart-journey" className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-full">How it works</Link>
        </div>
      </div>
      <Link href="/invite/join" className="block bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 rounded-2xl p-4 text-white shadow-md">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-extrabold text-sm">💰 Invite & Earn ₦500</p>
            <p className="text-[11px] text-white/90 mt-0.5">Recruit merchants. Get paid when they activate.</p>
          </div>
          <span className="text-xs font-extrabold bg-white/20 rounded-full px-3 py-1.5 shrink-0">Join →</span>
        </div>
      </Link>
    </section>
  );
}

export function DashboardInviteBanner() {
  if (!INVITE_EARN_ENABLED) return null;
  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-extrabold text-amber-900 text-sm">💰 Invite & Earn ₦500</p>
          <p className="text-xs text-amber-800/80 mt-1 leading-relaxed">
            Invite business owners to open a store on OrizzonCart. Earn ₦500 when they complete activation payment. Share your link + flyers.
          </p>
        </div>
        <Link href="/invite/join" className="shrink-0 px-3 py-2 bg-amber-500 text-white text-xs font-extrabold rounded-xl hover:bg-amber-600">Get link →</Link>
      </div>
    </div>
  );
}
