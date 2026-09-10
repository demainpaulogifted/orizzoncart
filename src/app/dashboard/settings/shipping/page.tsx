'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

export default function ShippingSettingsPage() {
  const [mode, setMode] = useState('FLAT');
  const [flatFee, setFlatFee] = useState(2500);
  const [pickupAddress, setPickupAddress] = useState('');
  const [merchantId, setMerchantId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase.from('merchants').select('*').eq('user_id', user?.id).single();
      if (data) {
        setMerchantId(data.id);
        setMode(data.shipping_mode || 'FLAT');
        setFlatFee(data.shipping_flat_fee || 2500);
        setPickupAddress(data.shipping_pickup_address || '');
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from('merchants').update({
      shipping_mode: mode,
      shipping_flat_fee: mode === 'FLAT' ? flatFee : 0,
      shipping_pickup_address: mode === 'PICKUP' ? pickupAddress : '',
    }).eq('id', merchantId);
    if (error) toast.error('Failed to save');
    else toast.success('Shipping settings saved!');
    setSaving(false);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Shipping Settings</h1>
        <p className="text-gray-600 text-sm">Choose how customers pay for delivery on your store.</p>
      </div>

      <div className="bg-white rounded-2xl border p-6 space-y-4">
        <h2 className="font-bold">Delivery Mode</h2>
        <div className="space-y-3">
          <button
            onClick={() => setMode('FREE')}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${mode === 'FREE' ? 'border-purple-600 bg-purple-50' : 'border-gray-200'}`}
          >
            <p className="font-bold flex items-center gap-2">🚚 Free Shipping</p>
            <p className="text-xs text-gray-500 mt-1">You cover shipping costs. Great for building loyalty.</p>
          </button>

          <button
            onClick={() => setMode('FLAT')}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${mode === 'FLAT' ? 'border-purple-600 bg-purple-50' : 'border-gray-200'}`}
          >
            <p className="font-bold flex items-center gap-2">📦 Flat Waybill Fee</p>
            <p className="text-xs text-gray-500 mt-1">Customer pays one fee regardless of location (e.g. ₦2,500).</p>
          </button>

          <button
            onClick={() => setMode('PICKUP')}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${mode === 'PICKUP' ? 'border-purple-600 bg-purple-50' : 'border-gray-200'}`}
          >
            <p className="font-bold flex items-center gap-2">🏪 Customer Pickup Only</p>
            <p className="text-xs text-gray-500 mt-1">Customer picks up from your location — no shipping fee.</p>
          </button>
        </div>
      </div>

      {mode === 'FLAT' && (
        <div className="bg-white rounded-2xl border p-6 space-y-4">
          <h2 className="font-bold">Waybill Fee</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₦)</label>
            <input
              type="number"
              value={flatFee}
              onChange={(e) => setFlatFee(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-xs text-gray-500 mt-1">Customers will see: "Shipping: {formatCurrency(flatFee)}"</p>
          </div>
        </div>
      )}

      {mode === 'PICKUP' && (
        <div className="bg-white rounded-2xl border p-6 space-y-4">
          <h2 className="font-bold">Pickup Location</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address (shown to customers at checkout)</label>
            <textarea
              rows={3}
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              placeholder="e.g. Shop 12, Ikeja City Mall, Lagos"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-xs text-gray-500 mt-1">Customers will see this after payment so they know where to collect.</p>
          </div>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full sm:w-auto px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Shipping Settings'}
      </button>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-900">
        <p className="font-bold mb-1">💡 Pro tip:</p>
        <p>Digital products (eBooks, courses, files) always ship FREE regardless of this setting.</p>
      </div>
    </div>
  );
}