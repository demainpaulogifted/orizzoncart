'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function VerificationPage() {
  const [merchant, setMerchant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
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
    
    const { data: m } = await supabase
      .from('merchants')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
      
    if (m) {
      setMerchant(m);
      // Safely extract existing data (handles both new array format and old flat columns)
      const loc = Array.isArray(m.business_locations) && m.business_locations.length > 0 
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
    const supabase = createClient();
    
    const { error } = await supabase
      .from('merchants')
      .update({
        business_state: form.business_state.trim(),
        business_lga: form.business_lga.trim(),
        business_address: form.business_address.trim(),
        // Save as a 1-item array for storefront display compatibility
        business_locations: [{ 
          state: form.business_state.trim(), 
          city: form.business_lga.trim(), 
          address: form.business_address.trim() 
        }],
        cac_number: form.cac_number.trim() || null,
      })
      .eq('id', merchant.id);

    setSaving(false);
    if (error) return toast.error(error.message);
    
    toast.success('✅ Submitted! Admin will review and verify your business shortly.');
    // Refresh data to show pending state
    load(); 
  }

  if (loading) return <div className="p-10 text-center text-gray-500">Loading...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard/settings" className="text-purple-600 text-sm hover:underline">
          ← Back to Settings
        </Link>
        <h1 className="text-2xl font-bold mt-2">✅ Business Verification</h1>
        <p className="text-gray-500 text-sm mt-1">
          Provide your business location so customers can trust you. An admin will review and approve this.
        </p>
      </div>

      {/* 1. Already Verified: Leave them alone, just show success */}
      {merchant?.is_verified ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <p className="text-4xl mb-3">🎉</p>
          <h2 className="text-xl font-bold text-green-900">Your business is already VERIFIED</h2>
          <p className="text-green-700 mt-2">
            You are good to go! Your store is trusted and ready to be listed on the Marketplace.
          </p>
          <Link 
            href="/dashboard/settings/marketplace" 
            className="inline-block mt-4 px-6 py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700"
          >
            Go to Marketplace Settings →
          </Link>
        </div>
      ) : (
        /* 2. Not Verified Yet: Show the simple 1-location form (pre-filled if they already started) */
        <div className="bg-white border rounded-xl p-6 space-y-4">
          {merchant?.business_state && !merchant?.is_verified && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 mb-4">
              ℹ️ Your details are currently <strong>pending admin review</strong>. You can update them below if needed.
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
            {saving ? 'Saving...' : (merchant?.business_state ? 'Update Details' : 'Submit for Admin Verification')}
          </button>
        </div>
      )}
    </div>
  );
}