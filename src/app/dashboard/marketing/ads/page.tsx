import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const admin = createAdminClient();
  const { data: merchant } = await admin.from('merchants').select('id').eq('user_id', user.id).maybeSingle();
  
  let campaigns: any[] = [];
  if (merchant) {
    const { data } = await admin.from('ad_campaigns').select('*').eq('merchant_id', merchant.id).order('created_at', { ascending: false });
    campaigns = data || [];
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Link href="/dashboard/marketing" className="text-purple-600 text-sm hover:underline mb-4 inline-block">← Back to Marketing</Link>
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Paid Ads</h1>
          <p className="text-gray-500">Run bulk ads using your connected catalogs.</p>
        </div>
      </div>

      {/* New Campaign Buttons */}
      <div className="grid md:grid-cols-3 gap-4 mb-10">
        <Link href="/dashboard/marketing/ads/google" className="block p-4 bg-white border-2 border-purple-200 hover:border-purple-500 rounded-xl text-center transition">
          <div className="text-2xl mb-2">🔍</div>
          <h3 className="font-bold">Create Google Ads</h3>
        </Link>
        <div className="block p-4 bg-gray-50 border rounded-xl text-center opacity-50 cursor-not-allowed">
          <div className="text-2xl mb-2">📘</div>
          <h3 className="font-bold text-gray-400">Meta Ads (Coming)</h3>
        </div>
        <div className="block p-4 bg-gray-50 border rounded-xl text-center opacity-50 cursor-not-allowed">
          <div className="text-2xl mb-2">🎵</div>
          <h3 className="font-bold text-gray-400">TikTok Ads (Coming)</h3>
        </div>
      </div>

      {/* List of Saved Campaigns */}
      <h2 className="font-bold text-lg mb-3">Your Campaigns</h2>
      {campaigns.length === 0 ? (
        <div className="text-center p-8 border-2 border-dashed rounded-lg text-gray-400">
          No campaigns created yet. Click "Create Google Ads" above to start.
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((c) => (
            <div key={c.id} className="flex justify-between items-center p-4 bg-white border rounded-lg">
              <div>
                <p className="font-semibold">{c.name}</p>
                <p className="text-xs text-gray-500">
                  {c.daily_budget} {c.currency}/day • {c.product_ids?.length || 0} products
                </p>
              </div>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full uppercase">
                {c.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}