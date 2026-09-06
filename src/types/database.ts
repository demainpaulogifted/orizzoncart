export type UserRole = "platform_admin" | "staff" | "merchant";
export type MerchantType = "physical" | "digital";
export type PaymentReceivingStatus = "NOT_CONFIGURED" | "PENDING_PAYMENT" | "PAYMENT_RECEIVED" | "UNDER_REVIEW" | "ACTIVE" | "HELD" | "SUSPENDED" | "EXPIRED" | "CANCELLED";
export type CartStatus = "LOCKED" | "ENABLED" | "DISABLED";
export type CheckoutStatus = "LOCKED" | "ENABLED" | "DISABLED";
export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface Merchant {
  id: string;
  merchant_id: string;
  user_id: string;
  business_name: string;
  store_name: string;
  store_slug: string;
  store_description: string | null;
  merchant_type: MerchantType;
  theme_id: string | null;
  logo_url: string | null;
  banner_url: string | null;
  payment_receiving_status: PaymentReceivingStatus;
  cart_status: CartStatus;
  checkout_status: CheckoutStatus;
  is_published: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  merchant_id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  sku: string | null;
  inventory_quantity: number;
  track_inventory: boolean;
  is_active: boolean;
  is_featured: boolean;
  category: string | null;
  images: { url: string; alt_text: string | null; display_order: number }[];
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  merchant_id: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  created_at: string;
}

export interface MerchantStats {
  total_visitors: number;
  total_orders: number;
  total_sales: number;
  conversion_rate: number;
  today_visitors: number;
  today_orders: number;
  today_sales: number;
}