'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const emptyLoc = { address: '', city: '', state: '' };

export default function VerificationPage() {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [about, setAbout] = useState('');
  const [cac, setCac] = useState('');
  const [logo, setLogo] = useState('');
  const [locs, setLocs] = useState([
    { ...emptyLoc },
    { ...emptyLoc },
    { ...emptyLoc },
  ]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/dashboard/verification')
      .then((r) => r.json())
      .then((d) => {
        setPhone(d.business_phone || '');
        setEmail(d.business_email || '');
        setAbout(d.business_about || '');
        setCac(d.cac_number || '');
        setLogo(d.logo_url || '');
        if (Array.isArray(d.business_locations) && d.business_locations.length === 3)
          setLocs(d.business_locations);
      })
      .catch(() => {});
  }, []);

  function setLoc(i: number, key: string, value: string) {
    setLocs((prev) => prev.map((l, idx) => (idx === i ? { ...l, [key]: value } : l)));
  }

  async function save() {
    setSaving(true);
    setMsg('');
    try {
      const res = await fetch('/api/dashboard/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_phone: phone,
          business_email: email,
          business_about: about,
          cac_number: cac,
          logo_url: logo,
          business_locations: locs,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Save failed');
      setMsg('✅ Verified! Your business profile is now public on the marketplace.');
    } catch (e: any) {
      setMsg('❌ ' + e.message);
    } finally {
      setSaving(false);
    }
  }

  const input = 'w-full px-3 py-2 border rounded-lg text-sm mt-1';
  const label = 'text-xs font-bold text-gray-600';

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Link href="/dashboard/settings" className="text-purple-600 text-sm hover:underline">
        ← Back to Settings
      </Link>

      <h1 className="text-2xl font-bold mt-3 mb-1">🛡️ Business Verification</h1>
      <p className="text-gray-500 text-sm mb-6">
        Required to appear on the OrizzonCart Marketplace as a <b>Verified Seller</b>.
        This information is shown publicly on your seller profile to protect customers.
      </p>

      {msg && (
        <div className={`mb-6 p-4 rounded-lg text-sm ${msg.startsWith('✅') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {msg}
        </div>
      )}

      <div className="bg-white border rounded-xl p-6 space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>Business Phone Number *</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0803 123 4567" className={input} />
          </div>
          <div>
            <label className={label}>Business Contact Email *</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hello@yourbusiness.ng" className={input} />
          </div>
        </div>

        <div>
          <label className={label}>Business Logo URL *</label>
          <input value={logo} onChange={(e) => setLogo(e.target.value)} placeholder="https://..." className={input} />
          <p className="text-[10px] text-gray-400 mt-1">Upload your logo in Store Settings first, it auto-fills here.</p>
        </div>

        <div>
          <label className={label}>About Your Business *</label>
          <textarea value={about} onChange={(e) => setAbout(e.target.value)} rows={4} placeholder="Tell customers what you sell, how long you have existed, and why they can trust you…" className={input} />
        </div>

        <div>
          <label className={label}>CAC / BN Registration Number (optional, boosts trust)</label>
          <input value={cac} onChange={(e) => setCac(e.target.value)} placeholder="RC1234567" className={input} />
        </div>

        <div className="space-y-4">
          <p className={label}>Business Locations * (exactly 3)</p>
          <p className="text-[10px] text-gray-400 -mt-3">
            Fewer than 3 branches? Use your shop, office/warehouse, and delivery pickup point.
          </p>
          {locs.map((l, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3 bg-gray-50">
              <p className="text-xs font-extrabold text-purple-700">📍 Location {i + 1}</p>
              <input value={l.address} onChange={(e) => setLoc(i, 'address', e.target.value)} placeholder="Street address" className={input} />
              <div className="grid grid-cols-2 gap-3">
                <input value={l.city} onChange={(e) => setLoc(i, 'city', e.target.value)} placeholder="City" className={input} />
                <input value={l.state} onChange={(e) => setLoc(i, 'state', e.target.value)} placeholder="State" className={input} />
              </div>
            </div>
          ))}
        </div>

        <button onClick={save} disabled={saving} className="w-full py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 disabled:opacity-50">
          {saving ? 'Verifying…' : 'Submit & Get Verified ✅'}
        </button>
      </div>
    </div>
  );
}