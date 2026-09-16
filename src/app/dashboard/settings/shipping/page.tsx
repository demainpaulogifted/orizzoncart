'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function ShippingSettingsPage() {
  const [merchant, setMerchant] = useState<any>(null);
  const [offerDelivery, setOfferDelivery] = useState(true);
  const [offerPickup, setOfferPickup] = useState(false);
  const [offerLocal, setOfferLocal] = useState(false);
  const [fee, setFee] = useState('2500');
  const [address, setAddress] = useState('');
  const [localLabel, setLocalLabel] = useState('Neighbourhood — free delivery');
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
        setOfferDelivery(active.shipping_offer_delivery !== false);
        setOfferPickup(active.shipping_offer_pickup === true);
        setOfferLocal(active.shipping_offer_local === true);
        setFee(String(active.shipping_flat_fee ?? 2500));
        setAddress(active.shipping_pickup_address || '');
        setLocalLabel(active.shipping_local_label || 'Neighbourhood — free delivery');
      }
    };
    load();
  }, []);

  const save = async () => {
    if (!merchant) { toast.error('Store not found'); return; }
    if (!offerDelivery && !offerPickup && !offerLocal) { toast.error('Enable at least one delivery option'); return; }
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from('merchants').update({
      shipping_offer_delivery: offerDelivery,
      shipping_offer_pickup: offerPickup,
      shipping_offer_local: offerLocal,
      shipping_flat_fee: Number(fee) || 0,
      shipping_pickup_address: address,
      shipping_local_label: localLabel,
      shipping_mode: offerDelivery ? 'FLAT' : offerPickup ? 'PICKUP' : 'FREE',
    }).eq('id', merchant.id);
    setSaving(false);
    if (error) { toast.error('Save failed: ' + error.message); return; }
    toast.success('✅ Shipping options saved — customers can now choose!');
    setMerchant({ ...merchant });
  };

  if (!merchant) return <div className="p-10 text-center text-gray-500">Loading...</div>;

  const Toggle = ({ on, set, icon, title, desc }: any) => (
    <button onClick={() => set(!on)} className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${on ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between">
        <p className="font-bold text-gray-900">{icon} {title}</p>
        <span className={`text-xs font-extrabold px-2 py-1 rounded-full ${on ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{on ? 'ON' : 'OFF'}</span>
      </div>
      <p className="text-xs text-gray-500 mt-1">{desc}</p>
    </button>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">🚚 Shipping Options</h1>
        <p className="text-gray-600 text-sm">Turn on every option you want to offer — customers choose at checkout.</p>
      </div>

      <div className="bg-white rounded-2xl border p-5 space-y-3">
        <Toggle on={offerDelivery} set={setOfferDelivery} icon="🚚" title="Door Delivery (waybill)" desc="Customer pays a flat waybill fee, anywhere." />
        {offerDelivery && (
          <div className="pl-4">
            <label className="block text-sm font-bold text-gray-700 mb-1">Waybill Fee (₦)</label>
            <input type="number" value={fee} onChange={(e) => setFee(e.target.value)} className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
        )}

        <Toggle on={offerPickup} set={setOfferPickup} icon="🏪" title="Customer Pickup" desc="Customer collects from you — no fee." />
        {offerPickup && (
          <div className="pl-4">
            <label className="block text-sm font-bold text-gray-700 mb-1">Pickup Address</label>
            <textarea rows={2} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g. 12 Bode Thomas St, Surulere, Lagos" className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
        )}

        <Toggle on={offerLocal} set={setOfferLocal} icon="🏘️" title="Neighbourhood Free Delivery" desc="Free delivery for customers near you." />
        {offerLocal && (
          <div className="pl-4">
            <label className="block text-sm font-bold text-gray-700 mb-1">Label customers see</label>
            <input value={localLabel} onChange={(e) => setLocalLabel(e.target.value)} className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
        )}
      </div>

      <button onClick={save} disabled={saving} className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50">
        {saving ? 'Saving...' : 'Save Shipping Options'}
      </button>
    </div>
  );
}