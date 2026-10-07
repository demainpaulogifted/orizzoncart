import { createClient as createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminMerchantsPage() {
  const admin = createAdminClient();
  const { data: merchants } = await admin
    .from('merchants')
    .select('id, store_name, store_slug, business_name, is_verified, payment_receiving_status, created_at')
    .order('created_at', { ascending: false });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <Link href="/admin" className="text-purple-600 text-sm hover:underline">← Back to Admin</Link>
        <h1 className="text-2xl font-bold mt-2">🏪 All Merchants ({merchants?.length || 0})</h1>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="divide-y">
          {(merchants || []).map((m) => (
            <div key={m.id} className="p-4 flex items-center justify-between gap-3 hover:bg-gray-50">
              <div>
                <p className="font-bold">{m.store_name}</p>
                <p className="text-xs text-gray-500">{m.store_slug}.orizzoncart.name.ng • {m.business_name}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${
                  m.is_verified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {m.is_verified ? '✅ VERIFIED' : 'UNVERIFIED'}
                </span>
                <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${
                  m.payment_receiving_status === 'ACTIVE' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {m.payment_receiving_status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}