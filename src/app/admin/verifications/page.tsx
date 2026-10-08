import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminVerificationsPage() {
  const admin = createAdminClient();

  // Fetch merchants who are NOT verified but have submitted location data
  const { data: merchants } = await admin
    .from('merchants')
    .select('id, store_name, store_slug, business_state, business_lga, business_address, cac_number, created_at')
    .eq('is_verified', false)
    .not('business_state', 'is', null)
    .order('created_at', { ascending: false });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <Link href="/admin" className="text-purple-600 text-sm hover:underline">← Back to Admin</Link>
        <h1 className="text-2xl font-bold mt-2">⏳ Pending Verifications</h1>
        <p className="text-gray-500 text-sm">Review business locations and approve trusted sellers.</p>
      </div>

      {!merchants || merchants.length === 0 ? (
        <div className="bg-white rounded-xl border p-10 text-center text-gray-500">
          No pending verifications. 🎉
        </div>
      ) : (
        <div className="grid gap-4">
          {merchants.map((m: any) => (
            <div key={m.id} className="bg-white rounded-xl border p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900">{m.store_name}</h3>
                <p className="text-xs text-gray-500 mb-3">{m.store_slug}.orizzoncart.name.ng</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase">State</span>
                    <p className="font-semibold">{m.business_state}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase">LGA</span>
                    <p className="font-semibold">{m.business_lga}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase">Address / Town</span>
                    <p className="font-semibold">{m.business_address}</p>
                  </div>
                </div>
                {m.cac_number && (
                  <p className="text-xs text-gray-500 mt-3">CAC: <span className="font-mono font-bold">{m.cac_number}</span></p>
                )}
              </div>

              <div className="flex flex-col gap-2 shrink-0">
                <form action={async () => {
                  'use server';
                  await admin.from('merchants').update({ is_verified: true }).eq('id', m.id);
                  redirect('/admin/verifications');
                }}>
                  <button className="w-full px-6 py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 text-sm">
                    ✅ Approve & Verify
                  </button>
                </form>
                <Link 
                  href={`/admin/merchants/${m.id}`} 
                  className="w-full text-center px-6 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 text-sm"
                >
                  View Full Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}