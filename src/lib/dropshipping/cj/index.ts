/**
 * CJ Dropshipping adapter
 * - Exchanges API key for access token
 * - Loads shops from CJ so OrizzonCart can link store metadata
 */

import type {
  ConnectionResult,
  DropshipSupplier,
  MerchantForConnect,
  SupplierCredentials,
} from '../types';

const CJ_AUTH_URL =
  'https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken';
const CJ_SHOPS_URL =
  'https://developers.cjdropshipping.com/api2.0/v1/shop/getShops';

interface CjTokenData {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpiryDate?: string;
  refreshTokenExpiryDate?: string;
  openId?: number | string;
}

interface CjShop {
  id?: string;
  name?: string;
  status?: number;
  type?: string;
  countryCode?: string;
  storeCountry?: string;
  currencyCode?: string;
  aliasName?: string;
}

async function getAccessToken(apiKey: string): Promise<{
  ok: boolean;
  data?: CjTokenData;
  message?: string;
}> {
  try {
    const res = await fetch(CJ_AUTH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey }),
      cache: 'no-store',
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok || json.code !== 200 || !json.data?.accessToken) {
      return {
        ok: false,
        message:
          json.message ||
          json.error ||
          `CJ auth failed (HTTP ${res.status}). Check your API key on CJ → Authorization → API.`,
      };
    }

    return { ok: true, data: json.data as CjTokenData };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, message: `CJ auth network error: ${msg}` };
  }
}

async function getShops(accessToken: string): Promise<CjShop[]> {
  try {
    const res = await fetch(CJ_SHOPS_URL, {
      method: 'GET',
      headers: {
        'CJ-Access-Token': accessToken,
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.code !== 200) return [];

    const list = Array.isArray(json.data) ? json.data : [];
    return list as CjShop[];
  } catch {
    return [];
  }
}

function pickBestShop(shops: CjShop[]): CjShop | null {
  if (!shops.length) return null;
  const active = shops.find((s) => s.status === 1);
  return active || shops[0];
}

export const cjSupplier: DropshipSupplier = {
  id: 'cj',
  name: 'CJ Dropshipping',
  supportsSearch: true,
  supportsUrlImport: true,
  supportsFulfillment: true,

  async connect(
    creds: SupplierCredentials,
    merchant: MerchantForConnect
  ): Promise<ConnectionResult> {
    const apiKey = (creds.apiKey || '').trim();
    if (!apiKey || apiKey === 'estimation-mode') {
      return {
        success: false,
        error: 'A real CJ API Key is required (not estimation-mode).',
      };
    }

    const tokenResult = await getAccessToken(apiKey);
    if (!tokenResult.ok || !tokenResult.data?.accessToken) {
      return {
        success: false,
        error: tokenResult.message || 'Could not get CJ access token.',
      };
    }

    const { accessToken, refreshToken, accessTokenExpiryDate } =
      tokenResult.data;

    const shops = await getShops(accessToken);
    const shop = pickBestShop(shops);

    const storeName =
      shop?.name ||
      shop?.aliasName ||
      merchant.store_name ||
      merchant.business_name ||
      'OrizzonCart Store';

    const countryCode = shop?.countryCode || 'NG';
    const currencyCode = shop?.currencyCode || 'NGN';

    return {
      success: true,
      shopId: shop?.id,
      shopName: storeName,
      countryCode,
      currencyCode,
      accessToken,
      refreshToken,
      tokenExpiresAt: accessTokenExpiryDate || null,
      meta: {
        openId: tokenResult.data.openId,
        shopCount: shops.length,
        shopType: shop?.type || 'api',
        storeUrl: merchant.store_slug
          ? `https://${merchant.store_slug}.orizzoncart.com.ng`
          : undefined,
        shopsPreview: shops.slice(0, 5).map((s) => ({
          id: s.id,
          name: s.name,
          status: s.status,
          type: s.type,
        })),
      },
    };
  },
};
