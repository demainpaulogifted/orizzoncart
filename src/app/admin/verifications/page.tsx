import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminVerificationsPage() {
  const admin = createAdminClient();

  // Get all merchants that have at least one location
  const { data: allWithLocations } = await admin
    .from('merchants')
    .select('id, store_name, store_slug, is_verified, business_locations, cac_number, created_at')
    .not('business_locations', 'is', null)
    .order('created_at', { ascending: false });

  const merchants = (allWithLocations || []).filter(
    (m: any) => Array.isArray(m.business_locations) && m.business_locations.length > 0
  );

  const pending = merchants.filter((m: any) => !m.is_verified);
  const verified = merchants.filter((m: any) => m.is_verified);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <Link href="/admin" className="text-purple-600 text-sm hover:underline">
          ← Back to Admin
        </Link>
        <h1 className="text-2xl font-bold mt-2">📍 Location Verifications</h1>
      </div>

      {/* PENDING */}
      <div>
        <h2 className="text-lg font-bold mb-3">
          ⏳ Pending Approval ({pending.length})
        </h2>

        {pending.length === 0 ? (
          <div className="bg-white rounded-xl border p-8 text-center text-gray-500">
            No pending verifications 🎉
          </div>
        ) : (
          <div className="grid gap-4">
            {pending.map((m: any) => (
              <div
                key={m.id}
                className="bg-white rounded-xl border p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{m.store_name}</h3>
                  <p className="text-xs text-gray-500 mb-3">
                    {m.store_slug}.orizzoncart.name.ng
                  </p>

                  <div className="space-y-2">
                    {m.business_locations.map((loc: any, i: number) => (
                      <div key={i} className="text-sm bg-yellow-50 border border-yellow-100 rounded-lg p-3">
                        <p className="font-semibold">{loc.address}</p>
                        <p className="text-gray-600">
                          {loc.city}, {loc.state}
                        </p>
                      </div>
                    ))}
                  </div>

                  {m.cac_number && (
                    <p className="text-xs text-gray-500 mt-3">
                      CAC: <span className="font-mono font-bold">{m.cac_number}</span>
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <form
                    action={async () => {
                      'use server';
                      await admin
                        .from('merchants')
                        .update({ is_verified: true })
                        .eq('id', m.id);
                      redirect('/admin/verifications');
                    }}
                  >
                    <button className="w-full px-5 py-2.5 bg-green-600 text-white font-bold rounded-lg text-sm hover:bg-green-700">
                      ✅ Approve All Locations
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
        <h2 className="text-lg font-bold mb-3">
          ✅ Already Verified ({verified.length})
        </h2>

        {verified.length === 0 ? (
          <div className="bg-white rounded-xl border p-6 text-center text-gray-500 text-sm">
            No verified locations yet
          </div>
        ) : (
          <div className="grid gap-3">
            {verified.map((m: any) => (
              <div
                key={m.id}
                className="bg-white rounded-xl border p-4 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="font-bold">{m.store_name}</p>
                  <p className="text-xs text-gray-500">
                    {m.business_locations?.[0]?.city}, {m.business_locations?.[0]?.state}
                    {m.business_locations?.length > 1 && ` +${m.business_locations.length - 1} more`}
                  </p>
                </div>
                <Link
                  href={`/admin/merchants/${m.id}`}
                  className="text-sm text-purple-600 font-medium"
                >
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