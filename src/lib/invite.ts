import { createClient as createAdminClient } from '@/lib/supabase/admin';

export const INVITE_REWARD_KOBO = 50000;
export const INVITE_COOKIE = 'invite_ref';
export const INVITE_EARN_ENABLED = process.env.NEXT_PUBLIC_INVITE_EARN_ENABLED !== 'false';

export const SHARE_MESSAGES = {
  short:
    'Business owners — sell on OrizzonCart Marketplace. Free store, WhatsApp selling, verified buyers. Open your store today: ',
  long:
    'Attention Nigerian business owners, market traders, fashion sellers, bakers, and digital creators.\n\nOrizzonCart gives you a free online store, WhatsApp selling, secure payments, and a place on OrizzonCart Marketplace so more customers find you.\n\nNo coding. Launch in minutes. Pay only when you activate selling.\n\nStart here: ',
};

export function generateInviteCode(length = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function inviteLink(code: string) {
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'orizzoncart.com.ng';
  return `https://${root}/invite/${code}`;
}

export async function attributeStoreRegistration(
  merchantId: string,
  referralCode: string | null | undefined
) {
  if (!referralCode) return;
  const admin = createAdminClient();
  const code = referralCode.trim().toLowerCase();

  const { data: partner } = await admin
    .from('invite_partners')
    .select('id, stores_registered')
    .eq('invite_code', code)
    .eq('is_active', true)
    .maybeSingle();

  if (!partner) return;

  const { error } = await admin.from('invite_attributions').insert({
    partner_id: partner.id,
    merchant_id: merchantId,
    status: 'registered',
    reward_status: 'none',
    reward_amount_kobo: INVITE_REWARD_KOBO,
  });
  if (error) return;

  await admin
    .from('invite_partners')
    .update({
      stores_registered: (partner.stores_registered || 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', partner.id);

  await admin.from('merchants').update({ referral_code: code }).eq('id', merchantId);
}

export async function attributeStoreActivation(merchantId: string) {
  const admin = createAdminClient();
  const { data: row } = await admin
    .from('invite_attributions')
    .select('id, partner_id, status')
    .eq('merchant_id', merchantId)
    .maybeSingle();

  if (!row || row.status === 'activated') return;

  await admin
    .from('invite_attributions')
    .update({
      status: 'activated',
      reward_status: 'pending',
      activated_at: new Date().toISOString(),
    })
    .eq('id', row.id);

  const { data: partner } = await admin
    .from('invite_partners')
    .select('stores_activated, earnings_pending_kobo')
    .eq('id', row.partner_id)
    .single();

  if (!partner) return;

  await admin
    .from('invite_partners')
    .update({
      stores_activated: (partner.stores_activated || 0) + 1,
      earnings_pending_kobo: (partner.earnings_pending_kobo || 0) + INVITE_REWARD_KOBO,
      updated_at: new Date().toISOString(),
    })
    .eq('id', row.partner_id);
}
