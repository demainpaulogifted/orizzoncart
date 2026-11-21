'use client';

export async function getClientActiveMerchant(
  supabase: any,
  userId: string
): Promise<any | null> {
  const { data: merchants, error } = await supabase
    .from('merchants')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  const list = merchants || [];
  const cookie = document.cookie
    .split(';')
    .map((item: string) => item.trim())
    .find((item: string) => item.startsWith('active_merchant_id='));

  let activeId: string | null = null;

  if (cookie) {
    try {
      activeId = decodeURIComponent(cookie.slice('active_merchant_id='.length));
    } catch {
      activeId = cookie.slice('active_merchant_id='.length);
    }
  }

  const active =
    list.find((merchant: any) => merchant.id === activeId) ||
    list[0] ||
    null;

  if (active && active.id !== activeId) {
    document.cookie =
      `active_merchant_id=${encodeURIComponent(active.id)}; path=/; max-age=31536000; SameSite=Lax`;
  }

  return active;
}
