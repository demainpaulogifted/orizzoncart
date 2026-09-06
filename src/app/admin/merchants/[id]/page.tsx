import { createClient } from '@/lib/supabase/server';
import { formatCurrency, formatDate } from '@/lib/utils';
import { redirect } from 'next/navigation';

export default async function MerchantDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  
  // Verify admin
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single();
  if (profile?.role !== 'platform_admin') redirect('/dashboard');

  // Fetch Merchant Data
  const { data: merchant } = await supabase.from('merchants').select('*').eq('id', params.id).single();
  
  // Fetch Activity History (Transactions)
  const { data: transactions } = await supabase
    .from('platform_transactions')
    .select('*')
    .eq('merchant_id', params.id)
    .order('created_at', { ascending: false });

  // Fetch Store Stats
  const { data: orders } = await supabase.from('orders').select('id, total_amount, status').eq('merchant_id', params.id);
  const totalSales = orders?.reduce((acc, curr) => acc + curr.total_amount, 0) || 0;

  // Server Action to Hold/Release
  async function updateMerchantStatus(formData: FormData) {
    'use server';
    const status = formData.get('status') as string;
    const supabaseAdmin = await createClient(); // In real app, use service role key here
    
    const updateData: any = {};
    if (status === 'RELEASE') {
      updateData.payment_receiving_status = 'ACTIVE';
      updateData.cart_status = 'ENABLED';
      updateData.checkout_status = 'ENABLED';
    } else if (status === 'HOLD') {
      updateData.payment_receiving_status = 'HELD';
      updateData.cart_status = 'DISABLED';
      updateData.checkout_status = 'DISABLED';
    }

    await supabaseAdmin.from('merchants').update(updateData).eq('id', params.id);
    redirect(`/admin/merchants/${params.id}`);
  }

  if (!merchant) return <div>Merchant not found</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-8">
      {/* Header & Actions */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold font-display">{merchant.store_name}</h1>
          <p className="text-gray-500">{merchant.business_name} • {merchant.store_slug}.orizzoncart.name.ng</p>
          <div className="flex gap-2 mt-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              merchant.payment_receiving_status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
              merchant.payment_receiving_status === 'HELD' ? 'bg-red-100 text-red-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {merchant.payment_receiving_status}
            </span>
          </div>
        </div>

        <form action={updateMerchantStatus} className="flex gap-3">
          <button name="status" value="HOLD" className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">
            🚫 Hold Payments
          </button>
          <button name="status" value="RELEASE" className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
            ✅ Release Payments
          </button>
        </form>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-500">Total Store Sales</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSales)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900">{orders?.length || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-500">Store Theme</p>
          <p className="text-2xl font-bold text-gray-900 capitalize">{merchant.theme_id || 'Default'}</p>
        </div>
      </div>

      {/* Billing & Activity History */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Platform Payment & Activity History</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase">
            <tr>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Reference</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {transactions?.map((tx: any) => (
              <tr key={tx.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{formatDate(tx.created_at)}</td>
                <td className="px-6 py-4 capitalize">{tx.transaction_type.replace('_', ' ')}</td>
                <td className="px-6 py-4 font-medium">{formatCurrency(tx.amount)}</td>
                <td className="px-6 py-4 font-mono text-xs text-gray-500">{tx.payment_reference || 'N/A'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    tx.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {tx.status}
                  </span>
                </td>
              </tr>
            ))}
            {(!transactions || transactions.length === 0) && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No platform transactions recorded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}