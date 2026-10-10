import Link from 'next/link';
import { cookies } from 'next/headers';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { THEMES } from '@/lib/themes';
import { MarketplaceBottomNav } from '@/components/marketplace/MarketplaceBottomNav';
import { parseAffinityCookie, rankActiveStores } from '@/lib/active-stores-feed';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Active Stores — OrizzonCart Marketplace',
  description:
    'Browse verified Nigerian stores ranked by how recently the merchant was active. Shop from live sellers, not abandoned shops.',
  alternates: { canonical: 'https://orizzoncart.name.ng/marketplace/stores' },
};

const themeList: any[] = Object.values(THEMES);
function themeFor(themeId: string | null | undefined) {
  return (THEMES as any)[themeId as any] || themeList[0];
}

function activityLabel(iso: string | null | undefined): string {
  if (!iso) return 'Quiet lately';
  const age = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(age)) return 'Quiet lately';
  const mins = Math.floor(age / 60000);
  if (mins < 5) return 'Active now';
  if (mins < 60) return `Active ${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Active ${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Active ${days}d ago`;
  return 'Quiet lately';
}

export default async function ActiveStoresPage() {
  const admin = createAdminClient();
  const cookieStore = await cookies();
  const sessionSeed = cookieStore.get('mkt_seed')?.value || 'guest';
  const affinityIds = parseAffinityCookie(cookieStore.get('mkt_affinity')?.value);

  const { data: merchants } = await admin
    .from('merchants')
    .select('id, store_slug, store_name, logo_url, theme_id, last_dashboard_at')
    .eq('is_on_marketplace', true)
    .eq('payment_receiving_status', 'ACTIVE')
    .eq('is_verified', true)
    .eq('is_active', true);

  const ranked = rankActiveStores(merchants || [], affinityIds, sessionSeed);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <Link
            href="/marketplace"
            className="-ml-2 rounded-full p-2 text-gray-600 hover:bg-gray-100 text-sm font-bold"
          >
            ← Back
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl font-extrabold text-gray-900">🟢 Active Stores</h1>
            <p className="text-xs text-gray-500">
              Ranked by how recently the merchant used their dashboard
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 space-y-3">
        {ranked.length === 0 ? (
          <div className="rounded-2xl border bg-white p-10 text-center text-sm text-gray-500">
            No active verified stores yet. Merchants are onboarding!
          </div>
        ) : (
          ranked.map((m, index) => {
            const t = themeFor(m.theme_id);
            const label = activityLabel(m.last_dashboard_at);
            const isHot = label === 'Active now' || label.includes('m ago');
            return (
              <Link
                key={m.id}
                href={`/marketplace/store/${m.store_slug}`}
                className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition"
              >
                <span className="w-7 text-center text-xs font-extrabold text-gray-400">
                  #{index + 1}
                </span>
                {m.logo_url ? (
                  <img
                    src={m.logo_url}
                    alt=""
                    className="h-12 w-12 rounded-full object-cover border border-gray-100"
                  />
                ) : (
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-extrabold text-white"
                    style={{ backgroundColor: t.variables['--color-primary'] }}
                  >
                    {m.store_name?.[0]?.toUpperCase() || 'S'}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-extrabold text-gray-900">{m.store_name}</p>
                  <p
                    className={`text-xs font-bold ${
                      isHot ? 'text-green-600' : 'text-gray-400'
                    }`}
                  >
                    {label}
                  </p>
                </div>
                <span
                  className="shrink-0 rounded-full px-3 py-1.5 text-[10px] font-extrabold text-white"
                  style={{ backgroundColor: t.variables['--color-primary'] }}
                >
                  View Profile →
                </span>
              </Link>
            );
          })
        )}
      </main>

      <MarketplaceBottomNav active="home" />
    </div>
  );
}