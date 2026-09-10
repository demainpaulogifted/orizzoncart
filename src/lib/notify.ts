import webpush from 'web-push';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export async function sendOrderAlert(merchantId: string, order: any, itemsSummary: string) {
  const admin = createAdminClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://orizzoncart.vercel.app';

  // 1) PUSH NOTIFICATION
  try {
    const { data: settings } = await admin.from('platform_settings').select('vapid_public, vapid_private').limit(1).maybeSingle();
    const { data: subs } = await admin.from('push_subscriptions').select('*').eq('merchant_id', merchantId);
    if (settings?.vapid_public && settings?.vapid_private && subs?.length) {
      webpush.setVapidDetails('mailto:support@orizzoncart.name.ng', settings.vapid_public, settings.vapid_private);
      const payload = JSON.stringify({
        title: '💰 New Order!',
        body: `${order.customer_name} paid ₦${Number(order.total_amount).toLocaleString()} — ${order.order_number}`,
        url: `/dashboard/orders/${order.id}`,
      });
      for (const s of subs) {
        try {
          await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload);
        } catch {
          await admin.from('push_subscriptions').delete().eq('id', s.id);
        }
      }
    }
  } catch (e) { console.error('push failed', e); }

  // 2) WHATSAPP AUTO-ALERT (UltraMsg when configured)
  try {
    const instance = process.env.ULTRAMSG_INSTANCE;
    const token = process.env.ULTRAMSG_TOKEN;
    if (instance && token) {
      const { data: merchant } = await admin.from('merchants').select('whatsapp_number, store_name').eq('id', merchantId).single();
      if (merchant?.whatsapp_number) {
        const to = merchant.whatsapp_number.replace(/[^0-9]/g, '');
        const text =
          `*🛒 NEW ORDER — ${order.order_number}*\n` +
          `Store: ${merchant.store_name}\n` +
          `Customer: ${order.customer_name}\n` +
          `Phone: ${order.customer_phone}\n` +
          `Items: ${itemsSummary}\n` +
          `Total: ₦${Number(order.total_amount).toLocaleString()} (PAID)\n` +
          (order.shipping_address ? `Address: ${order.shipping_address.address_line1}, ${order.shipping_address.city}, ${order.shipping_address.state}\n` : '') +
          `Tracking: ${order.tracking_number}\n` +
          `Process now: ${appUrl}/dashboard/orders/${order.id}`;
        await fetch(`https://api.ultramsg.com/${instance}/messages/chat?token=${token}&to=${to}&body=${encodeURIComponent(text)}`);
      }
    }
  } catch (e) { console.error('whatsapp failed', e); }
}