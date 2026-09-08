'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { formatCurrency, formatDate } from '@/lib/utils';

const LABELS: Record<string, string> = { monthly: 'Monthly', quarterly: 'Quarterly', yearly: 'Yearly' };

export default function PlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [merchant, setMerchant] = useState<any>(null);
  const [paying, setPaying] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { data: m } = await supabase.from('merchants').select('*').eq('user_id', user?.id).single();
      setMerchant(m);
      const { data: p } = await supabase.from('maintenance_plans').select('*').eq('is_active', true);
      setPlans(p || []);
    };
    load();
  }, []);

  const expired = merchant?.maintenance_expires_at && new Date(merchant.maintenance_expires_at) < new Date();

  const handlePay = async (frequency: string) => {
    setPaying(frequency);
    try {
      const res = await fetch('/api/payments/platform/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'maintenance_payment', plan: frequency }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      window.location.href = data.authorization_url;
    } catch (e: any) {
      toast.error(e.message || 'Failed to start payment');
      setPaying(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Maintenance Plans</h1>
        <p className="text-gray-600 text-sm">Choose how often you pay to keep your store receiving payments.</p>
      </div>

      {merchant?.payment_receiving_status !== 'ACTIVE' && (
        <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-xl p-4 text-sm font-bold text-center">
          🔒 Activate your store first — plans unlock after activation.
        </div>
      )}

      {expired && (
        <div className="bg-red-100 border border-red-300 text-red-800 rounded-xl p-4 text-sm font-bold text-center">
          🛑 Your plan expired on {formatDate(merchant.maintenance_expires_at)}. Payment receiving is paused. Renew below to resume instantly.
        </div>
      )}

      {!expired && merchant?.maintenance_status === 'active' && (
        <div className="bg-green-100 border border-green-300 text-green-800 rounded-xl p-4 text-sm font-bold text-center">
          ✅ {LABELS[merchant.maintenance_plan]} plan active until {formatDate(merchant.maintenance_expires_at)}.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {plans.map((p) => {
          const final = p.base_price - (p.base_price * (p.discount_percent / 100));
          const isCurrent = merchant?.maintenance_plan === p.frequency && !expired;
          return (
            <div key={p.frequency} className={`bg-white rounded-2xl border-2 p-5 space-y-3 ${isCurrent ? 'border-green-500 ring-4 ring-green-100' : 'border-gray-200'}`}>
              <p className="font-bold text-gray-900">{LABELS[p.frequency]}</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-gray-500"><span>Base</span><span>{formatCurrency(p.base_price)}</span></div>
                {p.discount_percent > 0 && (
                  <div className="flex justify-between text-green-600 font-bold"><span>Discount {p.discount_percent}%</span><span>− {formatCurrency(p.base_price * p.discount_percent / 100)}</span></div>
                )}
                <div className="flex justify-between text-base font-extrabold text-gray-900 border-t pt-2"><span>You pay</span><span>{formatCurrency(final)}</span></div>
              </div>
              {isCurrent ? (
                <span className="block text-center bg-green-100 text-green-700 font-bold py-2.5 rounded-xl text-sm">✓ Current Plan</span>
              ) : (
                <button onClick={() => handlePay(p.frequency)} disabled={paying === p.frequency || merchant?.payment_receiving_status !== 'ACTIVE'} className="w-full bg-purple-600 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-purple-700 disabled:opacity-50">
                  {paying === p.frequency ? 'Redirecting...' : expired ? 'Renew Now' : 'Choose & Pay'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-500 text-center">⚠️ If your plan expires, the system automatically pauses payment receiving until you renew.</p>
    </div>
  );
}