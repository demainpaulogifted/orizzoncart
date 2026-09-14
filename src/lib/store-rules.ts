/**
 * Store A = merchant_type 'physical'  → own products; payment_mode platform|own_keys
 * Store B = merchant_type 'digital'   → catalog + own digital; always platform keys + 40%
 */

export type MerchantType = 'physical' | 'digital';
export type PaymentMode = 'platform' | 'own_keys';

export function isDigitalStore(merchant: { merchant_type?: string | null }) {
  return merchant.merchant_type === 'digital';
}

export function isPhysicalStore(merchant: { merchant_type?: string | null }) {
  return merchant.merchant_type !== 'digital';
}

/** Catalog sourcing only on digital stores */
export function canSourceCatalog(merchant: { merchant_type?: string | null }) {
  return isDigitalStore(merchant);
}

/** Physical products only on physical stores */
export function canAddPhysicalProduct(merchant: { merchant_type?: string | null }) {
  return isPhysicalStore(merchant);
}

/**
 * Checkout key + split selection
 * - Digital store → platform + source split (40%)
 * - Physical + own_keys → merchant secret, no split
 * - Physical + platform → platform + token split (5%)
 */
export function resolveCheckoutPayment(merchant: {
  merchant_type?: string | null;
  payment_mode?: string | null;
  paystack_secret_key?: string | null;
  flutterwave_secret_key?: string | null;
  preferred_gateway?: string | null;
  split_code_token?: string | null;
  split_code_source?: string | null;
}) {
  const platformKey = process.env.PLATFORM_PAYSTACK_SECRET_KEY || null;

  if (isDigitalStore(merchant)) {
    return {
      secretKey: platformKey,
      splitCode: merchant.split_code_source || null,
      mode: 'digital_40' as const,
    };
  }

  if (merchant.payment_mode === 'own_keys') {
    const secretKey =
      merchant.preferred_gateway === 'flutterwave'
        ? merchant.flutterwave_secret_key
        : merchant.paystack_secret_key;
    return {
      secretKey: secretKey || null,
      splitCode: null,
      mode: 'own_keys' as const,
    };
  }

  // Default: platform 5%
  return {
    secretKey: platformKey,
    splitCode: merchant.split_code_token || null,
    mode: 'platform_5' as const,
  };
}