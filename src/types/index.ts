export type UserRole = "platform_admin" | "staff" | "merchant";

export type MerchantType = "physical" | "digital";

export type PaymentReceivingStatus =
  | "NOT_CONFIGURED"
  | "PENDING_PAYMENT"
  | "PAYMENT_RECEIVED"
  | "UNDER_REVIEW"
  | "ACTIVE"
  | "HELD"
  | "SUSPENDED"
  | "EXPIRED"
  | "CANCELLED";

export type CartStatus = "LOCKED" | "ENABLED" | "DISABLED";
export type CheckoutStatus = "LOCKED" | "ENABLED" | "DISABLED";

export interface Merchant {
  id: string;
  merchant_id: string; // e.g. admin0000001
  user_id: string;
  business_name: string;
  store_name: string;
  store_slug: string;
  merchant_type: MerchantType;
  theme_id: string | null;
  payment_receiving_status: PaymentReceivingStatus;
  cart_status: CartStatus;
  checkout_status: CheckoutStatus;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}