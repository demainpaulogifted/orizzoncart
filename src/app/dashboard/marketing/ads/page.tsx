import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { AdsControlPanel } from '@/components/marketing/AdsControlPanel';

export const dynamic = 'force-dynamic';

export default async function AdsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const admin = createAdminClient();
  const { data: merchant } = await admin
    .from('merchants')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  let campaigns: any[] = [];
  if (merchant) {
    const { data } = await admin
      .from('ad_campaigns')
      .select('*')
      .eq('merchant_id', merchant.id)
      .order('created_at', { ascending: false });
    campaigns = data || [];
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Link
        href="/dashboard/marketing"
        className="text-purple-600 text-sm hover:underline mb-4 inline-block"
      >
        ← Back to Marketing
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold">Paid Ads</h1>
        <p className="text-gray-500">
          Run bulk ads using your connected catalogs. Billing happens inside
          your own ad account — no approvals, no waiting.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-10">
        <Link
          href="/dashboard/marketing/ads/google"
          className="block p-4 bg-white border-2 border-purple-200 hover:border-purple-500 rounded-xl text-center transition"
        >
          <div className="text-2xl mb-2">🔍</div>
          <h3 className="font-bold">Create Google Ads</h3>
        </Link>
        <div className="p-4 bg-gray-50 border rounded-xl text-center opacity-50">
          <div className="text-2xl mb-2">📘</div>
          <h3 className="font-bold text-gray-400">Meta Ads (Coming)</h3>
        </div>
        <div className="p-4 bg-gray-50 border rounded-xl text-center opacity-50">
          <div className="text-2xl mb-2">🎵</div>
          <h3 className="font-bold text-gray-400">TikTok Ads (Coming)</h3>
        </div>
      </div>

      <AdsControlPanel campaigns={campaigns} />
    </div>
  );
}