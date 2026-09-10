import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ShareButtons } from '@/components/storefront/ShareButtons';
import { getStoreUrl } from '@/lib/store-url';
import Link from 'next/link';

export default async function StorePreviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: merchant } = await supabase.from('merchants').select('*').eq('user_id', user.id).single();
  if (!merchant) redirect('/onboarding');

  const storeUrl = getStoreUrl(merchant.store_slug);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Store Preview</h1>
          <p className="text-gray-600 text-sm truncate">Your live link: {storeUrl}</p>
        </div>
        <Link
          href={storeUrl}
          target="_blank"
          rel="noopener"
          className="px-5 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 whitespace-nowrap"
        >
          🔗 Open in New Tab
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 py-2">
        <ShareButtons url={storeUrl} title={merchant.store_name} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden" style={{ height: '68vh' }}>
        <iframe
          src={`/store/${merchant.store_slug}`}
          title={`${merchant.store_name} preview`}
          className="w-full h-full border-0"
        />
      </div>
    </div>
  );
}