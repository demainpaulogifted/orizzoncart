/**
 * Shared types for all dropshipping suppliers (CJ, Spocket, etc.)
 */

export type SupplierId = 'cj' | 'spocket' | 'zendrop' | string;

export interface SupplierCredentials {
  apiKey?: string;
  apiSecret?: string;
  email?: string;
  accessToken?: string;
  refreshToken?: string;
  [key: string]: unknown;
}

export interface SupplierProduct {
  supplierProductId: string;
  title: string;
  description?: string;
  images: { url: string }[];
  cost: number;
  shippingCost?: number;
  category?: string;
  variants?: unknown[];
  inStock?: boolean;
  raw?: unknown;
}

export interface ConnectionResult {
  success: boolean;
  shopId?: string;
  shopName?: string;
  countryCode?: string;
  currencyCode?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: string | null;
  error?: string;
  meta?: Record<string, unknown>;
}

export interface MerchantForConnect {
  id: string;
  store_name?: string | null;
  store_slug?: string | null;
  business_name?: string | null;
  [key: string]: unknown;
}

export interface DropshipSupplier {
  id: SupplierId;
  name: string;
  supportsSearch: boolean;
  supportsUrlImport: boolean;
  supportsFulfillment: boolean;

  connect(
    creds: SupplierCredentials,
    merchant: MerchantForConnect
  ): Promise<ConnectionResult>;

  search?(
    query: string,
    creds: SupplierCredentials
  ): Promise<SupplierProduct[]>;

  getProduct?(
    id: string,
    creds: SupplierCredentials
  ): Promise<SupplierProduct | null>;

  importFromUrl?(
    url: string,
    creds: SupplierCredentials
  ): Promise<SupplierProduct | null>;

  createOrder?(
    order: unknown,
    items: unknown[],
    creds: SupplierCredentials
  ): Promise<{ supplierOrderId: string }>;

  getTracking?(
    supplierOrderId: string,
    creds: SupplierCredentials
  ): Promise<unknown>;

  syncProduct?(
    product: unknown,
    creds: SupplierCredentials
  ): Promise<{ cost?: number; inStock?: boolean }>;
}
