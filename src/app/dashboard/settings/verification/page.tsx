'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const emptyLoc = { address: '', city: '', state: '' };

export default function VerificationPage() {
  const [merchant, setMerchant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    business_phone: '',
    business_email: '',
    business_about: '',
    cac_number: '',
    logo_url: '',
    business_locations: [emptyLoc, emptyLoc, emptyLoc],
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
      setForm({
        business_phone: m.business_phone || '',
        business_email: m.business_email || '',
        business_about: m.business_about || '',
        cac_number: m.cac_number || '',
        logo_url: m.logo_url || '',
        business_locations:
          Array.isArray(m.business_locations) && m.business_locations.length === 3
            ? m.business_locations
            : [emptyLoc, emptyLoc, emptyLoc],
      });
    }
    setLoading(false);
  }

  function setLoc(i: number, field: string, value: string) {
    const locs = [...form.business_locations];
    locs[i] = { ...locs[i], [field]: value };
    setForm({ ...form, business_locations: locs });
  }

  async function save() {
    // Validate required fields (CAC is NOT required)
    if (!form.business_phone.trim()) return toast.error('Phone number is required');
    for (let i = 0; i < 3; i++) {
      const l = form.business_locations[i];
      if (!l.address.trim() || !l.city.trim() || !l.state.trim()) {
        return toast.error(`Please fill all 3 fields for Location ${i + 1}`);
      }
    }

    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from('merchants')
      .update({
        business_phone: form.business_phone.trim(),
        business_email: form.business_email.trim() || null,
        business_about: form.business_about.trim() || null,
        cac_number: form.cac_number.trim() || null, // Optional
        logo_url: form.logo_url.trim() || null,
        business_locations: form.business_locations,
      })
      .eq('id', merchant.id);

    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success('✅ Submitted! Our team will review and verify your business.');
  }

  if (loading) return <div className="p-10 text-center text-gray-500">Loading...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard/settings" className="text-purple-600 text-sm hover:underline">
          ← Back to Settings
        </Link>
        <h1 className="text-2xl font-bold mt-2">✅ Business Verification</h1>
        <p className="text-gray-500 text-sm mt-1">
          Verified sellers get a trust badge, appear on the Marketplace, and show their locations to
          customers.
        </p>
      </div>

      {merchant?.is_verified && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-900">
          ✅ Your business is already <strong>VERIFIED</strong>. You can update details below.
        </div>
      )}

      <div className="bg-white border rounded-xl p-6 space-y-4">
        <div>
          <label className="text-sm font-bold text-gray-700 block mb-1">Business Phone *</label>
          <input
            value={form.business_phone}
            onChange={(e) => setForm({ ...form, business_phone: e.target.value })}
            placeholder="+2348012345678"
            className="w-full px-3 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-gray-700 block mb-1">Business Email</label>
          <input
            type="email"
            value={form.business_email}
            onChange={(e) => setForm({ ...form, business_email: e.target.value })}
            placeholder="hello@yourstore.com"
            className="w-full px-3 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-gray-700 block mb-1">Logo URL</label>
          <input
            value={form.logo_url}
            onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
            placeholder="https://..."
            className="w-full px-3 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-gray-700 block mb-1">
            CAC Registration Number <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            value={form.cac_number}
            onChange={(e) => setForm({ ...form, cac_number: e.target.value })}
            placeholder="e.g. RC1234567 — leave blank if not registered"
            className="w-full px-3 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-gray-700 block mb-1">About Your Business</label>
          <textarea
            value={form.business_about}
            onChange={(e) => setForm({ ...form, business_about: e.target.value })}
            rows={3}
            placeholder="Tell customers what you sell and why they should trust you..."
            className="w-full px-3 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-gray-700 block">
            Physical Locations * (exactly 3)
          </label>
          {form.business_locations.map((loc, i) => (
            <div key={i} className="border rounded-lg p-3 space-y-2 bg-gray-50">
              <p className="text-xs font-extrabold text-gray-500 uppercase">Location {i + 1}</p>
              <input
                value={loc.address}
                onChange={(e) => setLoc(i, 'address', e.target.value)}
                placeholder="Street address"
                className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={loc.city}
                  onChange={(e) => setLoc(i, 'city', e.target.value)}
                  placeholder="City"
                  className="px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  value={loc.state}
                  onChange={(e) => setLoc(i, 'state', e.target.value)}
                  placeholder="State"
                  className="px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="w-full py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {saving ? 'Submitting...' : 'Submit for Verification'}
        </button>
      </div>
    </div>
  );
}