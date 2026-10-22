import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminVerificationsPage() {
  const admin = createAdminClient();

  // Pending (submitted location but not verified)
  const { data: pending } = await admin
    .from('merchants')
    .select('id, store_name, store_slug, business_state, business_lga, business_address, cac_number, created_at')
    .eq('is_verified', false)
    .not('business_state', 'is', null)
    .order('created_at', { ascending: false });

  // Already verified
  const { data: verified } = await admin
    .from('merchants')
    .select('id, store_name, store_slug, business_state, business_lga, business_address, cac_number, created_at')
    .eq('is_verified', true)
    .not('business_state', 'is', null)
    .order('created_at', { ascending: false })
    .limit(30);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <Link href="/admin" className="text-purple-600 text-sm hover:underline">← Back to Admin</Link>
        <h1 className="text-2xl font-bold mt-2">📍 Location Verifications</h1>
      </div>

      {/* PENDING */}
      <div>
        <h2 className="text-lg font-bold mb-3">⏳ Pending Approval ({pending?.length || 0})</h2>
        {!pending || pending.length === 0 ? (
          <div className="bg-white rounded-xl border p-8 text-center text-gray-500">
            No pending verifications 🎉
          </div>
        ) : (
          <div className="grid gap-4">
            {pending.map((m: any) => (
              <div key={m.id} className="bg-white rounded-xl border p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{m.store_name}</h3>
                  <p className="text-xs text-gray-500 mb-2">{m.store_slug}.orizzoncart.name.ng</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                    <div><span className="text-xs text-gray-400">State</span><p className="font-semibold">{m.business_state}</p></div>
                    <div><span className="text-xs text-gray-400">LGA</span><p className="font-semibold">{m.business_lga}</p></div>
                    <div><span className="text-xs text-gray-400">Address</span><p className="font-semibold">{m.business_address}</p></div>
                  </div>
                  {m.cac_number && <p className="text-xs text-gray-500 mt-2">CAC: <span className="font-mono font-bold">{m.cac_number}</span></p>}
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <form action={async () => {
                    'use server';
                    await admin.from('merchants').update({ is_verified: true }).eq('id', m.id);
                    redirect('/admin/verifications');
                  }}>
                    <button className="w-full px-5 py-2.5 bg-green-600 text-white font-bold rounded-lg text-sm">
                      ✅ Approve
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ALREADY VERIFIED */}
      <div>
        <h2 className="text-lg font-bold mb-3">✅ Already Verified ({verified?.length || 0})</h2>
        {!verified || verified.length === 0 ? (
          <div className="bg-white rounded-xl border p-6 text-center text-gray-500 text-sm">
            No verified locations yet
          </div>
        ) : (
          <div className="grid gap-3">
            {verified.map((m: any) => (
              <div key={m.id} className="bg-white rounded-xl border p-4 flex items-center justify-between">
                <div>
                  <p className="font-bold">{m.store_name}</p>
                  <p className="text-xs text-gray-500">{m.business_state} • {m.business_lga}</p>
                </div>
                <Link href={`/admin/merchants/${m.id}`} className="text-sm text-purple-600 font-medium">
                  View
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}