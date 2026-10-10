/**
 * Intelligent Active Stores feed ranking.
 * - Primary: merchant dashboard activity (last_dashboard_at)
 * - Secondary: visitor affinity (stores / products they browsed)
 * - Tertiary: seeded shuffle so visitor A ≠ visitor B
 */

export type FeedMerchant = {
  id: string;
  store_slug: string;
  store_name: string | null;
  logo_url?: string | null;
  theme_id?: string | null;
  last_dashboard_at?: string | null;
};

function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed >>> 0;
  const rnd = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Parse affinity cookie: "id1,id2,..." → string[] */
export function parseAffinityCookie(raw: string | undefined | null): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 30);
}

/**
 * Rank merchants for the Active Stores rail / See all page.
 * Most recently active first. Affinity merchants bubble up within the same activity band.
 * Seed keeps each visitor's feed distinct without ignoring activeness.
 */
export function rankActiveStores(
  merchants: FeedMerchant[],
  affinityIds: string[],
  sessionSeed: string,
  options?: { limit?: number }
): FeedMerchant[] {
  const now = Date.now();
  const HOUR = 60 * 60 * 1000;
  const DAY = 24 * HOUR;
  const WEEK = 7 * DAY;

  const affinitySet = new Set(affinityIds);

  type Band = 0 | 1 | 2 | 3; // 0 = last hour, 1 = last day, 2 = last week, 3 = older / never
  const bandOf = (iso: string | null | undefined): Band => {
    if (!iso) return 3;
    const t = new Date(iso).getTime();
    if (Number.isNaN(t)) return 3;
    const age = now - t;
    if (age <= HOUR) return 0;
    if (age <= DAY) return 1;
    if (age <= WEEK) return 2;
    return 3;
  };

  const bands: FeedMerchant[][] = [[], [], [], []];
  for (const m of merchants) {
    bands[bandOf(m.last_dashboard_at)].push(m);
  }

  const ranked: FeedMerchant[] = [];

  for (let b = 0; b < 4; b++) {
    const group = bands[b];
    if (group.length === 0) continue;

    group.sort((a, c) => {
      const ta = a.last_dashboard_at ? new Date(a.last_dashboard_at).getTime() : 0;
      const tc = c.last_dashboard_at ? new Date(c.last_dashboard_at).getTime() : 0;
      if (tc !== ta) return tc - ta;
      const aa = affinitySet.has(a.id) ? 1 : 0;
      const ac = affinitySet.has(c.id) ? 1 : 0;
      return ac - aa;
    });

    const liked = group.filter((m) => affinitySet.has(m.id));
    const rest = group.filter((m) => !affinitySet.has(m.id));
    const seed = hashString(`\( {sessionSeed}:band \){b}:${Math.floor(now / (30 * 60 * 1000))}`);
    const shuffledRest = seededShuffle(rest, seed);

    ranked.push(...liked, ...shuffledRest);
  }

  const limit = options?.limit;
  return typeof limit === 'number' ? ranked.slice(0, limit) : ranked;
}