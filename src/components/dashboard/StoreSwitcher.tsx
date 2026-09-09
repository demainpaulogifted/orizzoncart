'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function StoreSwitcher({ currentMerchant }: { currentMerchant: any }) {
  const [merchants, setMerchants] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase
        .from('merchants')
        .select('id, store_name, store_slug, payment_receiving_status')
        .eq('user_id', user?.id);
      setMerchants(data || []);
    };
    load();
  }, []);

  const switchStore = (merchantId: string) => {
    document.cookie = `active_merchant_id=${merchantId}; path=/; max-age=31536000`;
    router.refresh();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 shadow-sm"
      >
        <span className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
          {currentMerchant?.store_name?.[0]?.toUpperCase() || '?'}
        </span>
        <span className="hidden sm:inline max-w-32 truncate">{currentMerchant?.store_name || 'Select store'}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="p-3 bg-gray-50 border-b">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Your Stores ({merchants.length})</p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {merchants.map((m) => (
                <button
                  key={m.id}
                  onClick={() => switchStore(m.id)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 border-b last:border-b-0 ${
                    m.id === currentMerchant?.id ? 'bg-purple-50' : ''
                  }`}
                >
                  <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-sm font-bold text-purple-700 shrink-0">
                    {m.store_name[0]?.toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{m.store_name}</p>
                    <p className="text-xs text-gray-500 truncate">{m.store_slug}</p>
                  </div>
                  {m.id === currentMerchant?.id ? (
                    <span className="text-purple-600 text-xs font-bold shrink-0">✓ Active</span>
                  ) : (
                    <span
                      className={`text-xs font-bold shrink-0 px-2 py-0.5 rounded-full ${
                        m.payment_receiving_status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {m.payment_receiving_status === 'ACTIVE' ? 'Live' : 'Setup'}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="p-3 bg-gray-50 border-t">
              <button
                onClick={() => router.push('/onboarding')}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-sm font-bold hover:shadow-lg transition-all"
              >
                + Add New Store
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}