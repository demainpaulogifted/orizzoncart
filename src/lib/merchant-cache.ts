let cached: any = null;
let cachedAt = 0;
const TTL = 60_000; // 1 minute

export async function getCachedMerchant(supabase: any, userId: string) {
  if (cached && Date.now() - cachedAt < TTL) return cached;

  const { data: merchants } = await supabase
    .from('merchants')
    .select('*')
    .eq('user_id', userId);

  if (!merchants || merchants.length === 0) return null;

  const id = document.cookie.split(';').find(c => c.trim().startsWith('active_merchant_id='))?.split('=')[1];
  cached = merchants.find((m: any) => m.id === id) || merchants[0];
  cachedAt = Date.now();
  return cached;
}

export function invalidateMerchantCache() {
  cached = null;
  cachedAt = 0;
}