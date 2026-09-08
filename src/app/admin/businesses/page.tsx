import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export default async function AdminBusinessesPage() {
  const supabase = await createClient();
  const { data: merchants } = await supabase
    .from('merchants')
    .select('id, store_name, business_name, store_slug, payment_receiving_status, merchant_type, created_at')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">All Businesses</h1>
        <p className="text-gray-600 text-sm">{merchants?.length || 0} registered businesses on OrizzonCart.</p>
      </div>

      {(!merchants || merchants.length === 0) ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-16 text-center">
          <p className="text-5xl mb-4">🏪</p>
          <p className="text-gray-600">No businesses yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden divide-y">
          {merchants.map((m: any) => (
            <Link key={m.id} href={`/admin/merchants/${m.id}`} className="flex items-center justify-between p-4 sm:p-5 hover:bg-gray-50 gap-3">
              <div className="min-w-0">
                <p className="font-bold text-gray-900 truncate">{m.store_name}</p>
                <p className="text-xs text-gray-500 truncate">{m.business_name} • {m.store_slug} • {m.merchant_type}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Joined {formatDate(m.created_at)}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                m.payment_receiving_status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                m.payment_receiving_status === 'HELD' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {m.payment_receiving_status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}