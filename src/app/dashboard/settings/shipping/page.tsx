'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function ShippingSettingsPage() {
  const [merchant, setMerchant] = useState<any>(null);
  const [mode, setMode] = useState('FLAT');
  const [fee, setFee] = useState('2500');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const cookieId = document.cookie.split(';').map((c) => c.trim()).find((c) => c.startsWith('active_merchant_id='))?.split('=')[1];
      const { data: merchants } = await supabase.from('merchants').select('*').eq('user_id', user.id);
      const active = (merchants || []).find((m: any) => m.id === cookieId) || (merchants || [])[0];
      if (active) {
        setMerchant(active);
        setMode(active.shipping_mode || 'FLAT');
        setFee(String(active.shipping_flat_fee ?? 2500));
        setAddress(active.shipping_pickup_address || '');
      }
    };
    load();
  }, []);

  const save = async () => {
    if (!merchant) { toast.error('Store not found — refresh and try again'); return; }
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from('merchants')
      .update({
        shipping_mode: mode,
        shipping_flat_fee: mode === 'FREE' ? 0 : Number(fee) || 0,
        shipping_pickup_address: address,
      })
      .eq('id', merchant.id);
    setSaving(false);
    if (error) { toast.error('Save failed: ' + error.message); return; }
    toast.success('✅ Shipping settings saved!');
    setMerchant({ ...merchant, shipping_mode: mode, shipping_flat_fee: Number(fee) || 0 });
  };

  if (!merchant) return <div className="p-10 text-center text-gray-500">Loading...</div>;

  const options = [
    { id: 'FREE', icon: '🚚', title: 'Free Shipping', desc: 'You cover shipping costs. Great for building loyalty.' },
    { id: 'FLAT', icon: '📦', title: 'Flat Waybill Fee', desc: 'Customer pays one fee regardless of location (e.g. ₦2,500).' },
    { id: 'PICKUP', icon: '🏪', title: 'Customer Pickup Only', desc: 'Customer picks up from your location — no shipping fee.' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">🚚 Shipping Settings</h1>
        <p className="text-gray-600 text-sm">How customers receive their physical orders.</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-800">
        💡 <strong>Tip:</strong> Digital products are never charged shipping — this only applies to physical items.
      </div>

      <div className="bg-white rounded-2xl border p-5 space-y-3">
        {options.map((o) => (
          <button
            key={o.id}
            onClick={() => setMode(o.id)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${mode === o.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}
          >
            <p className="font-bold text-gray-900">{o.icon} {o.title}</p>
            <p className="text-sm text-gray-500 mt-1">{o.desc}</p>
          </button>
        ))}
      </div>

      {mode === 'FLAT' && (
        <div className="bg-white rounded-2xl border p-5">
          <p className="font-bold text-gray-900 mb-2">Waybill Fee</p>
          <label className="block text-sm font-bold text-gray-700 mb-1">Amount (₦)</label>
          <input type="number" value={fee} onChange={(e) => setFee(e.target.value)} className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500" />
          <p className="text-xs text-gray-500 mt-2">Customers will see: "Shipping: ₦{Number(fee || 0).toLocaleString()}"</p>
        </div>
      )}

      {mode === 'PICKUP' && (
        <div className="bg-white rounded-2xl border p-5">
          <label className="block text-sm font-bold text-gray-700 mb-1">Pickup Address</label>
          <textarea rows={2} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g. 12 Bode Thomas St, Surulere, Lagos" className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500" />
          <p className="text-xs text-gray-500 mt-2">💡 Shown to customers at checkout so they know where to collect.</p>
        </div>
      )}

      <button onClick={save} disabled={saving} className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50">
        {saving ? 'Saving...' : 'Save Shipping Settings'}
      </button>
    </div>
  );
}