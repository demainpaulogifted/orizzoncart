'use client';

import Link from 'next/link';
import { INVITE_EARN_ENABLED } from '@/lib/invite';

/** Marketplace: minimal text link only — full pitch lives on /invite/join */
export function MarketplaceInviteBanner() {
  if (!INVITE_EARN_ENABLED) return null;
  return (
    <p className="text-center text-xs text-gray-500">
      <Link
        href="/invite/join"
        className="font-semibold text-amber-700 underline underline-offset-2 hover:text-amber-900"
      >
        Invite &amp; Earn ₦500
      </Link>
      <span className="text-gray-400"> · recruit merchants</span>
    </p>
  );
}

/** Dashboard: compact one-line row */
export function DashboardInviteBanner() {
  if (!INVITE_EARN_ENABLED) return null;
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-amber-100 bg-amber-50/80 px-3 py-2">
      <p className="text-xs text-amber-900">
        <span className="font-bold">Invite &amp; Earn</span>
        <span className="text-amber-800/80"> — ₦500 when a store activates</span>
      </p>
      <Link
        href="/invite/join"
        className="shrink-0 text-xs font-extrabold text-amber-700 hover:underline"
      >
        Join →
      </Link>
    </div>
  );
}
