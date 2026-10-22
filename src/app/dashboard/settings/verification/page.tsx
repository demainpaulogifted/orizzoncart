'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

type Location = {
  state: string;
  city: string;
  address: string;
  verified?: boolean; // we will mark verified ones
};

export default function VerificationPage() {
  const [merchant, setMerchant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

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

      // Pre-fill CAC if exists
      setForm((prev) => ({
        ...prev,
        cac_number: m.cac_number || '',
      }));
    }
    setLoading(false);
  }

  // Build the list of locations (support both old flat fields and new array)
  function getLocations(): Location[] {
    if (!merchant) return [];

    const locations: Location[] = [];

    // From the array field (preferred)
    if (Array.isArray(merchant.business_locations) && merchant.business_locations.length > 0) {
      merchant.business_locations.forEach((loc: any) => {
        locations.push({
          state: loc.state || '',
          city: loc.city || '',
          address: loc.address || '',
          verified: merchant.is_verified, // if merchant is verified, treat existing locations as verified
        });
      });
    }

    // Fallback to old flat columns (for stores that only have the old fields)
    if (locations.length === 0 && (merchant.business_state || merchant.business_address)) {
      locations.push({
        state: merchant.business_state || '',
        city: merchant.business_lga || '',
        address: merchant.business_address || '',
        verified: !!merchant.is_verified,
      });
    }

    return locations;
  }

  const locations = getLocations();
  const hasAnyLocation = locations.length > 0;
  const hasVerifiedLocation = locations.some((l) => l.verified);
  const hasPendingLocation = locations.some((l) => !l.verified);

  async function addLocation() {
    if (!form.business_state.trim() || !form.business_lga.trim() || !form.business_address.trim()) {
      return toast.error('Please fill in State, LGA and Address');
    }

    setSaving(true);
    const supabase = createClient();

    // Build new locations array
    const currentLocations = getLocations().map((l) => ({
      state: l.state,
      city: l.city,
      address: l.address,
    }));

    const newLocation = {
      state: form.business_state.trim(),
      city: form.business_lga.trim(),
      address: form.business_address.trim(),
    };

    const updatedLocations = [...currentLocations, newLocation];

    // Also keep the first location in the old flat columns for backward compatibility
    const first = updatedLocations[0];

    const { error } = await supabase
      .from('merchants')
      .update({
        business_locations: updatedLocations,
        business_state: first.state,
        business_lga: first.city,
        business_address: first.address,
        cac_number: form.cac_number.trim() || null,
        // Do NOT touch is_verified here. New locations stay pending.
      })
      .eq('id', merchant.id);

    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success('✅ Location added! Waiting for admin approval.');
    setShowAddForm(false);
    setForm({
      business_state: '',
      business_lga: '',
      business_address: '',
      cac_number: form.cac_number,
    });
    load();
  }

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard/settings" className="text-purple-600 text-sm hover:underline">
          ← Back to Settings
        </Link>
        <h1 className="text-2xl font-bold mt-2">📍 Business Locations</h1>
        <p className="text-gray-500 text-sm mt-1">
          Add your business location(s). Verified locations appear on the Marketplace and your storefront.
        </p>
      </div>

      {/* Existing locations */}
      {hasAnyLocation && (
        <div className="space-y-3">
          <h2 className="font-bold text-gray-800">Your Locations</h2>

          {locations.map((loc, index) => (
            <div
              key={index}
              className={`rounded-xl border p-4 ${
                loc.verified
                  ? 'bg-green-50 border-green-200'
                  : 'bg-yellow-50 border-yellow-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-gray-900">
                    {loc.address}
                  </p>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {loc.city}, {loc.state}
                  </p>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${
                    loc.verified
                      ? 'bg-green-600 text-white'
                      : 'bg-yellow-500 text-white'
                  }`}
                >
                  {loc.verified ? 'Verified' : 'Pending'}
                </span>
              </div>
              {loc.verified && (
                <p className="text-xs text-green-700 mt-2">
                  This location is locked and visible to customers.
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add new location form */}
      {!showAddForm ? (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700"
        >
          + Add {hasAnyLocation ? 'Another' : 'Business'} Location
        </button>
      ) : (
        <div className="bg-white border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">New Location</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-sm text-gray-500"
            >
              Cancel
            </button>
          </div>

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
            <label className="text-sm font-bold text-gray-700 block mb-1">LGA *</label>
            <input
              value={form.business_lga}
              onChange={(e) => setForm({ ...form, business_lga: e.target.value })}
              placeholder="e.g., Ikeja"
              className="w-full px-3 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 block mb-1">Town / Address *</label>
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
              CAC Number <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              value={form.cac_number}
              onChange={(e) => setForm({ ...form, cac_number: e.target.value })}
              placeholder="e.g., RC1234567"
              className="w-full px-3 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button
            onClick={addLocation}
            disabled={saving}
            className="w-full py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Submit Location for Approval'}
          </button>
        </div>
      )}

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
        <p className="font-bold mb-1">How it works</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>New locations stay <strong>Pending</strong> until an admin approves them.</li>
          <li>Once approved, a location becomes <strong>Verified</strong> and is locked.</li>
          <li>You can always add more locations later (new branch, new address, etc.).</li>
          <li>Verified locations appear on your Marketplace profile and storefront.</li>
        </ul>
      </div>
    </div>
  );
}