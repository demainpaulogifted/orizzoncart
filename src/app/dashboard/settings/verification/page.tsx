'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function VerificationPage() {
  const [merchant, setMerchant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const [form, setForm] = useState({
    business_state: '',
    business_lga: '',
    business_address: '',
    cac_number: '',
  });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const activeMerchantId = document.cookie
      .split('; ')
      .find((row) => row.startsWith('active_merchant_id='))
      ?.split('=')[1];

    const { data: merchants } = await supabase
      .from('merchants')
      .select('*')
      .eq('user_id', user.id);

    const list = merchants || [];
    const m = list.find((item: any) => item.id === activeMerchantId) || list[0];

    if (m) {
      setMerchant(m);
      const loc =
        Array.isArray(m.business_locations) && m.business_locations.length > 0
          ? m.business_locations[0]
          : {};

      setForm({
        business_state: loc.state || m.business_state || '',
        business_lga: loc.city || m.business_lga || '',
        business_address: loc.address || m.business_address || '',
        cac_number: m.cac_number || '',
      });
    }
    setLoading(false);
  }

  async function save() {
    if (!form.business_state.trim() || !form.business_lga.trim() || !form.business_address.trim()) {
      return toast.error('Please fill in State, LGA, and Town/Address');
    }

    setSaving(true);
    setJustSaved(false);

    const supabase = createClient();

    const { error } = await supabase
      .from('merchants')
      .update({
        business_state: form.business_state.trim(),
        business_lga: form.business_lga.trim(),
        business_address: form.business_address.trim(),
        business_locations: [
          {
            state: form.business_state.trim(),
            city: form.business_lga.trim(),
            address: form.business_address.trim(),
          },
        ],
        cac_number: form.cac_number.trim() || null,
        // Keep is_verified as false until admin approves
      })
      .eq('id', merchant.id);

    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setJustSaved(true);
    toast.success('✅ Location saved! Waiting for admin approval.');
    load(); // refresh to show pending state
  }

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Loading...</div>;
  }

  const hasSubmitted =
    !!(merchant?.business_state || merchant?.business_address ||
      (Array.isArray(merchant?.business_locations) && merchant.business_locations.length > 0));

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard/settings" className="text-purple-600 text-sm hover:underline">
          ← Back to Settings
        </Link>
        <h1 className="text-2xl font-bold mt-2">📍 Business Location</h1>
        <p className="text-gray-500 text-sm mt-1">
          Provide your business location so customers can trust you. An admin will review and approve it.
        </p>
      </div>

      {/* Already fully verified */}
      {merchant?.is_verified ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <p className="text-4xl mb-3">🎉</p>
          <h2 className="text-xl font-bold text-green-900">Your business is VERIFIED</h2>
          <p className="text-green-700 mt-2">
            Your location is now visible on the Marketplace and your storefront.
          </p>
          <Link
            href="/dashboard/settings/marketplace"
            className="inline-block mt-4 px-6 py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700"
          >
            Go to Marketplace Settings →
          </Link>
        </div>
      ) : (
        <div className="bg-white border rounded-xl p-6 space-y-4">
          {/* Pending state */}
          {hasSubmitted && !merchant?.is_verified && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <p className="font-bold">✅ Details saved — waiting for admin approval</p>
              <p className="mt-1">
                An admin will review your location shortly. Once approved, it will appear on your Marketplace profile and storefront.
              </p>
            </div>
          )}

          {justSaved && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800 font-medium">
              Location saved successfully. Waiting for admin approval.
            </div>
          )}

          <div>
            <label className="text-sm font-bold text-gray-700 block mb-1">State *</label>
            <input
              value={form.business_state}
              onChange={(e) => setForm({ ...form, business_state: e.target.value })}
              placeholder="e.g., Lagos"
              className="w-full px-3 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 block mb-1">LGA (Local Government) *</label>
            <input
              value={form.business_lga}
              onChange={(e) => setForm({ ...form, business_lga: e.target.value })}
              placeholder="e.g., Ikeja"
              className="w-full px-3 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 block mb-1">Town / Business Address *</label>
            <textarea
              value={form.business_address}
              onChange={(e) => setForm({ ...form, business_address: e.target.value })}
              rows={2}
              placeholder="e.g., 12 Allen Avenue, Ikeja"
              className="w-full px-3 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 block mb-1">
              CAC Registration Number <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              value={form.cac_number}
              onChange={(e) => setForm({ ...form, cac_number: e.target.value })}
              placeholder="e.g., RC1234567"
              className="w-full px-3 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button
            onClick={save}
            disabled={saving}
            className="w-full py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : hasSubmitted ? 'Update Location' : 'Submit for Admin Approval'}
          </button>
        </div>
      )}
    </div>
  );
}