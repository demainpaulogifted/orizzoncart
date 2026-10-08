'use client';

import { useState } from 'react';

interface ConfirmWithSellerProps {
  product: {
    id: string;
    name: string;
    price?: number | string;
    slug?: string;
  };
  merchant: {
    store_name?: string;
    store_slug?: string;
    whatsapp_number?: string | null;
    business_state?: string | null;
    business_lga?: string | null;
    business_locations?: Array<{ state?: string; city?: string; address?: string }> | null;
    is_verified?: boolean;
    last_dashboard_at?: string | null;
  };
}

function formatLastSeen(iso: string | null | undefined): string {
  if (!iso) return 'Last seen unknown';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 'Last seen unknown';
  const diffMs = Date.now() - then;
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (mins < 60) return 'Active now';
  if (hours < 24) return 'Active today';
  if (days === 1) return 'Last seen 1 day ago';
  if (days < 7) return 'Last seen ' + days + ' days ago';
  if (days < 14) return 'Inactive for over a week';
  return 'Last seen ' + days + ' days ago';
}

function getPublicLocation(merchant: ConfirmWithSellerProps['merchant']): string | null {
  const loc =
    Array.isArray(merchant.business_locations) && merchant.business_locations.length > 0
      ? merchant.business_locations[0]
      : null;
  const state = (loc && loc.state) || merchant.business_state || '';
  const lga = (loc && loc.city) || merchant.business_lga || '';
  if (state && lga) return state + ' · ' + lga;
  if (state) return state;
  if (lga) return lga;
  return null;
}

function normalizeWhatsApp(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let n = raw.replace(/[^\d+]/g, '');
  if (n.startsWith('+')) n = n.slice(1);
  if (n.startsWith('0') && n.length === 11) n = '234' + n.slice(1);
  if (n.length < 10) return null;
  return n;
}

export default function ConfirmWithSeller({ product, merchant }: ConfirmWithSellerProps) {
  const [open, setOpen] = useState(false);

  const location = getPublicLocation(merchant);
  const lastSeen = formatLastSeen(merchant.last_dashboard_at);
  const wa = normalizeWhatsApp(merchant.whatsapp_number);

  const productUrl =
    typeof window !== 'undefined'
      ? window.location.href
      : 'https://' + (merchant.store_slug || 'store') + '.orizzoncart.name.ng/p/' + (product.slug || product.id);

  const priceText =
    product.price != null ? '₦' + Number(product.price).toLocaleString() : '';
  const pricePart = priceText ? ' (' + priceText + ')' : '';

  const message =
    "Hi, I'm interested in *" +
    product.name +
    '*' +
    pricePart +
    '.\n\nProduct link: ' +
    productUrl +
    '\n\nIs it still available?';

  const waLink = wa
    ? 'https://wa.me/' + wa + '?text=' + encodeURIComponent(message)
    : null;
  const smsLink = wa ? 'sms:+' + wa + '?body=' + encodeURIComponent(message) : null;

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full mt-3 py-3.5 px-6 rounded-xl border-2 border-purple-600 text-purple-700 font-bold hover:bg-purple-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
      >
        <span>💬</span>
        Confirm with Seller
      </button>

      {open && (
        <div className="mt-3 bg-white border border-purple-100 rounded-2xl shadow-lg p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-extrabold text-gray-900">
                {merchant.store_name || 'Seller'}
                {merchant.is_verified && (
                  <span className="ml-2 text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">
                    ✓ Verified
                  </span>
                )}
              </p>
              {location && <p className="text-sm text-gray-600 mt-0.5">📍 {location}</p>}
              <p className="text-sm text-gray-500 mt-0.5">🕒 {lastSeen}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 leading-relaxed whitespace-pre-wrap">
            {message}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {waLink ? (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700"
              >
                WhatsApp
              </a>
            ) : (
              <div className="text-center py-3 rounded-xl bg-gray-100 text-gray-400 text-sm font-medium">
                No WhatsApp set
              </div>
            )}

            {smsLink ? (
              <a
                href={smsLink}
                className="block text-center py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700"
              >
                SMS
              </a>
            ) : (
              <div className="text-center py-3 rounded-xl bg-gray-100 text-gray-400 text-sm font-medium">
                No phone set
              </div>
            )}
          </div>

          <p className="text-[11px] text-gray-400 text-center">
            Message includes the product link so the seller knows exactly which item.
          </p>
        </div>
      )}
    </div>
  );
}
