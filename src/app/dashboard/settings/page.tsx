'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const SECTIONS = [
  { href: '/dashboard/settings/payment', icon: '💳', title: 'Payment Settings', desc: 'Payout method, own keys (0%) or OrizzonPay (5%)' },
  { href: '/dashboard/settings/shipping', icon: '🚚', title: 'Shipping', desc: 'Delivery, pickup or neighbourhood free' },
  { href: '/dashboard/settings/theme', icon: '🎨', title: 'Store Theme', desc: 'Change your storefront look' },
  { href: '/dashboard/settings/commerce', icon: '🛒', title: 'Commerce Rules', desc: 'Cart & checkout controls' },
  { href: '/dashboard/settings/plans', icon: '🧾', title: 'Maintenance Plans', desc: 'Keep your store active' },
];

export default function SettingsHubPage() {
  const [merchant, setMerchant] = useState<any>(null);
  const [form, setForm] = useState({ store_name: '', description: '', whatsapp_number: '', contact_email: '' });
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
        setForm({
          store_name: active.store_name || '',
          description: active.tagline ?? active.store_description ?? active.description ?? '',
          whatsapp_number: active.whatsapp_number || '',
          contact_email: active.contact_email || '',
        });
      }
    };
    load();
  }, []);

  const save = async () => {
    if (!merchant) { toast.error('Store not found — refresh and try again'); return; }
    if (!form.store_name.trim()) { toast.error('Store name is required'); return; }
    setSaving(true);
    const supabase = createClient();
    const payload: any = {
      store_name: form.store_name.trim(),
      whatsapp_number: form.whatsapp_number.trim(),
      contact_email: form.contact_email.trim(),
    };
    if ('tagline' in merchant) payload.tagline = form.description;
    else if ('store_description' in merchant) payload.store_description = form.description;
    else if ('description' in merchant) payload.description = form.description;

    const { error } = await supabase.from('merchants').update(payload).eq('id', merchant.id);
    setSaving(false);
    if (error) { toast.error('Save failed: ' + error.message); return; }
    toast.success('✅ Settings saved!');
    setMerchant({ ...merchant, ...payload });
  };

  if (!merchant) return <div className="p-10 text-center text-gray-500">Loading...</div>;

  const storeUrl = `https://${merchant.store_slug}.orizzoncart.name.ng`;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">⚙️ Settings</h1>
          <p className="text-gray-600 text-sm">Everything about your store, in one place.</p>
        </div>
        <Link href={storeUrl} target="_blank" className="px-4 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold shrink-0 hover:bg-purple-700">
          👀 Visit Live Store
        </Link>
      </div>

      {/* HUB */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SECTIONS.map((s) => (
          <Link key={s.href} href={s.href} className="bg-white rounded-2xl border p-4 hover:border-purple-400 hover:shadow-md transition-all flex items-start gap-3">
            <span className="text-xl mt-0.5">{s.icon}</span>
            <div>
              <p className="font-bold text-sm text-gray-900">{s.title}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">{s.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* GENERAL */}
      <div className="bg-white rounded-2xl border p-6 space-y-4">
        <h2 className="font-bold text-lg">🏪 General</h2>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Store Name</label>
          <input value={form.store_name} onChange={(e) => setForm({ ...form, store_name: e.target.value })} className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Store Description</label>
          <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g. Curated pieces, crafted for you." className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">WhatsApp Number</label>
          <input value={form.whatsapp_number} onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })} placeholder="08012345678" className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Contact Email</label>
          <input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500" />
        </div>
        <button onClick={save} disabled={saving} className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}