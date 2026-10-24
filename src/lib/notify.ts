import webpush from 'web-push';
import { Resend } from 'resend';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://orizzoncart.com.ng').replace(/\/$/, '');
const FROM_EMAIL = 'OrizzonCart <noreply@orizzoncart.com.ng>';

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error('RESEND_API_KEY is missing');
  }
  return new Resend(key);
}

function formatNaira(amount: number) {
  return `₦${Number(amount).toLocaleString('en-NG')}`;
}

function formatAddress(address: any): string {
  if (!address) return 'Not provided';
  if (typeof address === 'string') return address;
  const parts = [
    address.address_line1,
    address.city,
    address.state,
    address.country || 'Nigeria',
  ].filter(Boolean);
  return parts.join(', ');
}

// ====================== CUSTOMER EMAIL ======================
function buildCustomerEmailHTML(params: {
  customerName: string;
  orderNumber: string;
  trackingNumber: string;
  items: { name: string; quantity: number; price: number }[];
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingAddress: string;
  storeName: string;
  storeSlug: string;
  suggestedProducts: { name: string; price: number; image?: string; url: string }[];
}) {
  const {
    customerName,
    orderNumber,
    trackingNumber,
    items,
    subtotal,
    shippingCost,
    total,
    shippingAddress,
    storeName,
    storeSlug,
    suggestedProducts,
  } = params;

  const itemsRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #eee;font-size:14px;color:#333;">
          ${item.name} <span style="color:#888;">× ${item.quantity}</span>
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #eee;text-align:right;font-size:14px;font-weight:600;color:#333;">
          ${formatNaira(item.price * item.quantity)}
        </td>
      </tr>`
    )
    .join('');

  const suggestedHTML =
    suggestedProducts.length > 0
      ? `
      <div style="margin-top:40px;padding-top:30px;border-top:1px solid #eee;">
        <h3 style="margin:0 0 16px;font-size:16px;color:#111;">You may also like from ${storeName}</h3>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${suggestedProducts
            .map(
              (p) => `
            <tr>
              <td style="padding:10px 0;font-size:14px;">
                <a href="\( {p.url}" style="color:#7c3aed;text-decoration:none;font-weight:500;"> \){p.name}</a>
              </td>
              <td style="padding:10px 0;text-align:right;font-size:14px;font-weight:600;">
                ${formatNaira(p.price)}
              </td>
            </tr>`
            )
            .join('')}
        </table>
      </div>`
      : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#7c3aed,#5b21b6);padding:32px 32px 28px;text-align:center;">
              <div style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">OrizzonCart</div>
              <div style="margin-top:8px;font-size:14px;color:rgba(255,255,255,0.85);">Order Confirmation</div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px;">
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111;line-height:1.3;">
                Thank you, ${customerName}!
              </h1>
              <p style="margin:0 0 28px;font-size:15px;color:#555;line-height:1.5;">
                Your order from <strong>${storeName}</strong> has been confirmed and is being processed.
              </p>

              <!-- Order meta -->
              <table width="100%" style="background:#f9fafb;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <div style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.5px;">Order Number</div>
                    <div style="font-size:16px;font-weight:700;color:#111;margin-top:2px;">${orderNumber}</div>
                  </td>
                  <td style="padding:16px 20px;text-align:right;">
                    <div style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.5px;">Tracking</div>
                    <div style="font-size:16px;font-weight:700;color:#7c3aed;margin-top:2px;">${trackingNumber}</div>
                  </td>
                </tr>
              </table>

              <!-- Items -->
              <h3 style="margin:0 0 12px;font-size:15px;font-weight:600;color:#111;">Items Ordered</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                ${itemsRows}
              </table>

              <!-- Totals -->
              <table width="100%" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:6px 0;font-size:14px;color:#666;">Subtotal</td>
                  <td style="padding:6px 0;text-align:right;font-size:14px;color:#333;">${formatNaira(subtotal)}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:14px;color:#666;">Shipping</td>
                  <td style="padding:6px 0;text-align:right;font-size:14px;color:#333;">${formatNaira(shippingCost)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 0 0;font-size:16px;font-weight:700;color:#111;border-top:1px solid #eee;">Total Paid</td>
                  <td style="padding:12px 0 0;text-align:right;font-size:16px;font-weight:700;color:#111;border-top:1px solid #eee;">${formatNaira(total)}</td>
                </tr>
              </table>

              <!-- Shipping -->
              <div style="background:#f9fafb;border-radius:12px;padding:16px 20px;margin-bottom:28px;">
                <div style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Delivery Address</div>
                <div style="font-size:14px;color:#333;line-height:1.5;">${shippingAddress}</div>
              </div>

              <!-- CTA -->
              <div style="text-align:center;margin:32px 0;">
                <a href="\( {APP_URL}/track-order?tracking= \){trackingNumber}" 
                   style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 32px;border-radius:10px;">
                  Track Your Order
                </a>
              </div>

              ${suggestedHTML}

              <!-- Marketplace promo -->
              <div style="margin-top:40px;padding:24px;background:linear-gradient(135deg,#f5f3ff,#ede9fe);border-radius:12px;text-align:center;">
                <div style="font-size:15px;font-weight:600;color:#5b21b6;margin-bottom:6px;">Discover more Nigerian stores</div>
                <div style="font-size:13px;color:#6b7280;margin-bottom:16px;">Shop verified sellers on OrizzonCart Marketplace</div>
                <a href="${APP_URL}/marketplace" 
                   style="display:inline-block;background:#ffffff;color:#7c3aed;text-decoration:none;font-weight:600;font-size:13px;padding:10px 20px;border-radius:8px;border:1px solid #ddd6fe;">
                  Explore Marketplace →
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#fafafa;padding:24px 32px;text-align:center;border-top:1px solid #eee;">
              <div style="font-size:12px;color:#999;line-height:1.6;">
                This email was sent by OrizzonCart on behalf of ${storeName}.<br>
                Need help? Reply to this email or visit <a href="${APP_URL}" style="color:#7c3aed;text-decoration:none;">orizzoncart.com.ng</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ====================== MERCHANT EMAIL ======================
function buildMerchantEmailHTML(params: {
  storeName: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  itemsSummary: string;
  total: number;
  shippingAddress: string;
  deliveryZone: string;
  orderSource: string;
  orderId: string;
  trackingNumber: string;
}) {
  const {
    storeName,
    orderNumber,
    customerName,
    customerPhone,
    customerEmail,
    itemsSummary,
    total,
    shippingAddress,
    deliveryZone,
    orderSource,
    orderId,
    trackingNumber,
  } = params;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Order Received</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#059669,#047857);padding:32px 32px 28px;text-align:center;">
              <div style="font-size:22px;font-weight:700;color:#ffffff;">🎉 New Order Received</div>
              <div style="margin-top:8px;font-size:14px;color:rgba(255,255,255,0.9);">${storeName}</div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px;">
              <table width="100%" style="background:#ecfdf5;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px;">
                    <div style="font-size:13px;color:#047857;font-weight:600;margin-bottom:4px;">ORDER TOTAL</div>
                    <div style="font-size:28px;font-weight:800;color:#065f46;">${formatNaira(total)}</div>
                    <div style="font-size:13px;color:#059669;margin-top:4px;">Order #${orderNumber} • ${trackingNumber}</div>
                  </td>
                </tr>
              </table>

              <h3 style="margin:0 0 16px;font-size:15px;font-weight:600;color:#111;">Customer Details</h3>
              <table width="100%" style="margin-bottom:28px;font-size:14px;">
                <tr>
                  <td style="padding:8px 0;color:#666;width:120px;">Name</td>
                  <td style="padding:8px 0;color:#111;font-weight:500;">${customerName}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#666;">Phone</td>
                  <td style="padding:8px 0;color:#111;font-weight:500;">${customerPhone || '—'}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#666;">Email</td>
                  <td style="padding:8px 0;color:#111;font-weight:500;">${customerEmail || '—'}</td>
                </tr>
              </table>

              <h3 style="margin:0 0 16px;font-size:15px;font-weight:600;color:#111;">Order Information</h3>
              <table width="100%" style="margin-bottom:28px;font-size:14px;">
                <tr>
                  <td style="padding:8px 0;color:#666;width:140px;">Source</td>
                  <td style="padding:8px 0;color:#111;font-weight:500;">${orderSource}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#666;">Delivery Zone</td>
                  <td style="padding:8px 0;color:#111;font-weight:500;">${deliveryZone}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#666;vertical-align:top;">Items</td>
                  <td style="padding:8px 0;color:#111;font-weight:500;line-height:1.5;">${itemsSummary}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#666;vertical-align:top;">Ship to</td>
                  <td style="padding:8px 0;color:#111;font-weight:500;line-height:1.5;">${shippingAddress}</td>
                </tr>
              </table>

              <!-- CTA -->
              <div style="text-align:center;margin:32px 0 8px;">
                <a href="\( {APP_URL}/dashboard/orders/ \){orderId}" 
                   style="display:inline-block;background:#059669;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 32px;border-radius:10px;">
                  Process This Order →
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#fafafa;padding:20px 32px;text-align:center;border-top:1px solid #eee;">
              <div style="font-size:12px;color:#999;">
                OrizzonCart • You received this because a customer placed an order on your store.
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ====================== MAIN FUNCTION ======================
export async function sendOrderAlert(
  merchantId: string,
  order: any,
  itemsSummary: string
) {
  const admin = createAdminClient();

  // ---------- 1. WEB PUSH (keep) ----------
  try {
    const { data: settings } = await admin
      .from('platform_settings')
      .select('vapid_public, vapid_private')
      .limit(1)
      .maybeSingle();

    const { data: subs } = await admin
      .from('push_subscriptions')
      .select('*')
      .eq('merchant_id', merchantId);

    if (settings?.vapid_public && settings?.vapid_private && subs?.length) {
      webpush.setVapidDetails(
        'mailto:support@orizzoncart.com.ng',
        settings.vapid_public,
        settings.vapid_private
      );

      const payload = JSON.stringify({
        title: '💰 New Order!',
        body: `${order.customer_name} paid ${formatNaira(order.total_amount)} — ${order.order_number}`,
        url: `/dashboard/orders/${order.id}`,
      });

      for (const s of subs) {
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            payload
          );
        } catch {
          await admin.from('push_subscriptions').delete().eq('id', s.id);
        }
      }
    }
  } catch (e) {
    console.error('Push notification failed', e);
  }

  // ---------- 2. FETCH EXTRA DATA ----------
  const { data: merchant } = await admin
    .from('merchants')
    .select('store_name, store_slug, user_id, contact_email')
    .eq('id', merchantId)
    .single();

  if (!merchant) return;

  // Get merchant's login email if contact_email is empty
  let merchantEmail = merchant.contact_email;
  if (!merchantEmail && merchant.user_id) {
    const { data: userData } = await admin.auth.admin.getUserById(merchant.user_id);
    merchantEmail = userData?.user?.email || null;
  }

  const { data: orderItems } = await admin
    .from('order_items')
    .select('product_name, quantity, unit_price, product_id')
    .eq('order_id', order.id);

  const items = (orderItems || []).map((i: any) => ({
    name: i.product_name,
    quantity: i.quantity,
    price: Number(i.unit_price),
  }));

  // Suggested products (simple: 3 other active products from same merchant)
  const { data: otherProducts } = await admin
    .from('products')
    .select('id, name, price, slug, images')
    .eq('merchant_id', merchantId)
    .eq('is_active', true)
    .neq('id', orderItems?.[0]?.product_id || '')
    .limit(3);

  const suggestedProducts = (otherProducts || []).map((p: any) => ({
    name: p.name,
    price: Number(p.price),
    url: `https://\( {merchant.store_slug}.orizzoncart.com.ng/p/ \){p.slug || p.id}`,
  }));

  const shippingAddress = formatAddress(order.shipping_address);
  const deliveryZone =
    order.shipping_address?.state ||
    order.shipping_mode ||
    'Standard Delivery';

  const orderSource = order.source === 'marketplace' ? 'Marketplace' : 'Merchant Storefront';

  // ---------- 3. SEND CUSTOMER EMAIL ----------
  if (order.customer_email) {
    try {
      await getResend().emails.send({
        from: FROM_EMAIL,
        to: order.customer_email,
        subject: `Order Confirmed #${order.order_number} – ${merchant.store_name}`,
        html: buildCustomerEmailHTML({
          customerName: order.customer_name || 'Customer',
          orderNumber: order.order_number,
          trackingNumber: order.tracking_number,
          items,
          subtotal: Number(order.subtotal || order.total_amount),
          shippingCost: Number(order.shipping_cost || 0),
          total: Number(order.total_amount),
          shippingAddress,
          storeName: merchant.store_name,
          storeSlug: merchant.store_slug,
          suggestedProducts,
        }),
      });
    } catch (e) {
      console.error('Customer email failed', e);
    }
  }

  // ---------- 4. SEND MERCHANT EMAIL ----------
  if (merchantEmail) {
    try {
      await getResend().emails.send({
        from: FROM_EMAIL,
        to: merchantEmail,
        subject: `🎉 New Order #${order.order_number} – ${formatNaira(order.total_amount)}`,
        html: buildMerchantEmailHTML({
          storeName: merchant.store_name,
          orderNumber: order.order_number,
          customerName: order.customer_name || 'Customer',
          customerPhone: order.customer_phone || '',
          customerEmail: order.customer_email || '',
          itemsSummary,
          total: Number(order.total_amount),
          shippingAddress,
          deliveryZone,
          orderSource,
          orderId: order.id,
          trackingNumber: order.tracking_number,
        }),
      });
    } catch (e) {
      console.error('Merchant email failed', e);
    }
  }
}