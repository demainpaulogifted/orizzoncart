import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function AdminMerchantDetailPage({ params }: any) {
  const supabase = await createClient();
  const { id } = await params;

  // 1. Fetch Merchant Core Details
  const { data: merchant } = await supabase
    .from('merchants')
    .select('*')
    .eq('id', id)
    .single();

  if (!merchant) return notFound();

  // 2. Fetch Stats & Store Type Logic
  const { count: totalProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('merchant_id', id);

  const { count: sourcedProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('merchant_id', id)
    .not('catalog_id', 'is', null);

  const { count: totalOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('merchant_id', id);

  const physicalCount = (totalProducts || 0) - (sourcedProducts || 0);
  const hasDigital = (sourcedProducts || 0) > 0;
  const hasPhysical = physicalCount > 0;
  
  let storeType = 'Physical';
  if (hasDigital && hasPhysical) storeType = 'Hybrid (Digital + Physical)';
  else if (hasDigital) storeType = 'Digital Only';

  // 3. Onboarding Checklist Logic
  const checklist = [
    { label: 'Store Created', done: !!merchant.store_slug },
    { label: 'Bank Account Linked', done: !!merchant.bank_name && !!merchant.account_number },
    { label: 'Payment Active', done: merchant.payment_receiving_status === 'ACTIVE' },
    { label: 'First Product Added', done: (totalProducts || 0) > 0 },
    { label: 'Sourcing Platform Products', done: (sourcedProducts || 0) > 0 },
    { label: 'First Sale Completed', done: (totalOrders || 0) > 0 },
  ];

  const progress = Math.round((checklist.filter(i => i.done).length / checklist.length) * 100);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/admin" className="text-sm text-purple-600 font-bold hover:underline mb-2 block">← Back to Businesses</Link>
          <h1 className="text-2xl font-extrabold text-gray-900">{merchant.store_name}</h1>
          <p className="text-sm text-gray-500">/{merchant.store_slug} • Joined {new Date(merchant.created_at).toLocaleDateString()}</p>
        </div>
        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${
          merchant.payment_receiving_status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          {merchant.payment_receiving_status || 'Inactive'}
        </span>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border shadow-sm">
          <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Store Type</p>
          <p className="text-lg font-extrabold text-gray-900">{storeType}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border shadow-sm">
          <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Total Products</p>
          <p className="text-lg font-extrabold text-gray-900">{totalProducts || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border shadow-sm">
          <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Sourced Items</p>
          <p className="text-lg font-extrabold text-purple-600">{sourcedProducts || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border shadow-sm">
          <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Lifetime Orders</p>
          <p className="text-lg font-extrabold text-gray-900">{totalOrders || 0}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column: Contact & Banking */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Contact Details</h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-gray-500 text-xs uppercase font-semibold">Email Address</p>
                <p className="font-medium text-gray-900 break-all">{merchant.user_email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase font-semibold">Phone Number</p>
                <p className="font-medium text-gray-900">{merchant.phone || 'Not provided'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Payout Account</h2>
            {merchant.bank_name ? (
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500 text-xs uppercase font-semibold">Bank Name</p>
                  <p className="font-medium text-gray-900">{merchant.bank_name}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-semibold">Account Number</p>
                  <p className="font-mono font-medium text-gray-900 bg-gray-50 px-2 py-1 rounded inline-block">
                    {merchant.account_number}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-semibold">Account Name</p>
                  <p className="font-medium text-gray-900">{merchant.account_name || 'Unverified'}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No bank account linked yet.</p>
            )}
          </div>
        </div>

        {/* Right Column: Onboarding Progress */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl border p-6 shadow-sm h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-gray-900">Onboarding Progress</h2>
              <span className="text-sm font-bold text-purple-600">{progress}% Complete</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-100 rounded-full h-2.5 mb-8">
              <div 
                className="bg-purple-600 h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            {/* Checklist */}
            <div className="space-y-4">
              {checklist.map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    item.done ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {item.done ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                    )}
                  </div>
                  <div>
                    <p className={`font-semibold text-sm ${item.done ? 'text-gray-900' : 'text-gray-500'}`}>
                      {item.label}
                    </p>
                    {!item.done && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {i === 0 && 'Merchant needs to complete store setup.'}
                        {i === 1 && 'Required for OrizzonPay auto-payouts.'}
                        {i === 2 && 'Activation fee paid but bank missing?'}
                        {i === 3 && 'Store is currently empty.'}
                        {i === 4 && 'Not earning 40% commission yet.'}
                        {i === 5 && 'No revenue generated so far.'}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}