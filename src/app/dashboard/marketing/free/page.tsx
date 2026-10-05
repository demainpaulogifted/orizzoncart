import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { ConnectPanel } from '@/components/marketing/ConnectPanel';

export const dynamic = 'force-dynamic';

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || 'https://orizzoncart.name.ng';

const googleSteps = [
  'Copy your feed link above.',
  "Go to merchants.google.com and sign in with your Google account (create one free if you don't have).",
  'Inside Google Merchant Center, go to "Products" then "Feeds".',
  'Click "Add feed" (or the + button) and choose "Scheduled fetch".',
  'Paste your feed link into the URL box and save.',
  'Google will now download your products automatically every day.',
  'Tick the checkbox below and click "Mark as Connected".',
];

const metaSteps = [
  'Copy your feed link above.',
  'Go to business.facebook.com and log in with your Facebook account.',
  'Open Commerce Manager (business.facebook.com/commerce).',
  'If you do not have a catalog yet, click "Create Catalog" and choose "E-commerce".',
  'Open your catalog, go to "Data Sources" and click "Add Data Source".',
  'Choose "Data feed" (scheduled fetch) and paste your feed link.',
  'Set the fetch schedule to daily and save.',
  'Tick the checkbox below and click "Mark as Connected".',
];

const tiktokSteps = [
  'Copy your feed link above and open it in a new tab - it downloads your product CSV file.',
  'Go to business.tiktok.com and log in (create a free TikTok Business account if you don\'t have one).',
  'Open "Assets" then "Catalogs".',
  'Click "Create Catalog" and choose "Upload product file" (CSV).',
  'Upload the CSV file you downloaded in step 1.',
  'If TikTok shows "Sync by URL / Scheduled fetch" instead, paste your feed link there and set it to daily.',
  'Tick the checkbox below and click "Mark as Connected".',
];

export default async function FreeMarketingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const admin = createAdminClient();

  const { data: merchant } = await admin
    .from('merchants')
    .select('id, store_slug')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!merchant) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <p className="text-gray-600">No store found for this account.</p>
      </div>
    );
  }

  const { data: connections } = await admin
    .from('marketing_connections')
    .select('*')
    .eq('merchant_id', merchant.id);

  const statusFor = (platform: string) =>
    (connections || []).find((c: any) => c.platform === platform);

  const googleFeedUrl = `${BASE_URL}/api/marketing/feed?merchant_id=${merchant.id}&platform=google`;
  const metaFeedUrl = `${BASE_URL}/api/marketing/feed?merchant_id=${merchant.id}&platform=meta`;
  const tiktokFeedUrl = `${BASE_URL}/api/marketing/feed?merchant_id=${merchant.id}&platform=tiktok`;

  const platforms = [
    {
      key: 'google_merchant_center',
      name: 'Google Merchant Center (GMC)',
      icon: '🔍',
      ready: true,
      feedUrl: googleFeedUrl,
      steps: googleSteps,
    },
    {
      key: 'meta_commerce_catalog',
      name: 'Meta Commerce Manager (MCMC)',
      icon: '📘',
      ready: true,
      feedUrl: metaFeedUrl,
      steps: metaSteps,
    },
    {
      key: 'tiktok_catalog',
      name: 'TikTok Business Catalog (TBCC)',
      icon: '🎵',
      ready: true,
      feedUrl: tiktokFeedUrl,
      steps: tiktokSteps,
    },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Link
        href="/dashboard/marketing"
        className="text-purple-600 text-sm hover:underline mb-4 inline-block"
      >
        ← Back to Marketing
      </Link>

      <h1 className="text-2xl font-bold mb-2">Free Marketing Catalogs</h1>
      <p className="text-gray-500 mb-8">
        Connect your platforms. OrizzonCart will automatically push your
        product images, titles, and links.
      </p>

      <div className="space-y-4">
        {platforms.map((p) => {
          const conn = statusFor(p.key);

          return (
            <div
              key={p.key}
              className="p-4 bg-white border border-gray-200 rounded-lg flex flex-col sm:flex-row sm:items-start justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{p.icon}</span>
                <div>
                  <h3 className="font-semibold">{p.name}</h3>
                  <p className="text-xs text-gray-500">
                    {p.ready
                      ? conn
                        ? 'Connected • products sync automatically'
                        : 'Ready to connect • free automatic product sync'
                      : 'One-click connect coming in the next update'}
                  </p>
                </div>
              </div>

              {p.ready ? (
                <ConnectPanel
                  platform={p.key}
                  feedUrl={p.feedUrl}
                  connected={Boolean(conn)}
                  steps={p.steps}
                />
              ) : (
                <button
                  disabled
                  className="px-4 py-2 bg-gray-200 text-gray-400 text-sm rounded-lg cursor-not-allowed"
                >
                  Coming Soon
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}