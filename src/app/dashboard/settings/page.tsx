'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [merchantId, setMerchantId] = useState('');
  const [form, setForm] = useState({ store_name: '', store_description: '', whatsapp_number: '', contact_email: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase.from('merchants').select('*').eq('user_id', user?.id).single();
      if (data) {
        setMerchantId(data.id);
        setForm({
          store_name: data.store_name || '',
          store_description: data.store_description || '',
          whatsapp_number: data.whatsapp_number || '',
          contact_email: data.contact_email || '',
        });
      }
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from('merchants').update(form).eq('id', merchantId);
    if (error) toast.error('Failed to save settings');
    else toast.success('Store settings saved!');
    setSaving(false);
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-600 text-sm">Payments, themes and store information all live here.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/dashboard/settings/payment" className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-purple-400 hover:shadow-md transition-all">
          <span className="text-2xl">💳</span>
          <p className="font-bold mt-2">Payments</p>
          <p className="text-xs text-gray-500 mt-1">Paystack / Flutterwave keys, activation fee & payouts.</p>
        </Link>
        <Link href="/dashboard/settings/theme" className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-purple-400 hover:shadow-md transition-all">
          <span className="text-2xl">🎨</span>
          <p className="font-bold mt-2">Themes</p>
          <p className="text-xs text-gray-500 mt-1">Switch your storefront design instantly.</p>
        </Link>
        <Link href="/dashboard/settings/commerce" className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-purple-400 hover:shadow-md transition-all">
          <span className="text-2xl">🌍</span>
          <p className="font-bold mt-2">Orizzon Commerce</p>
          <p className="text-xs text-gray-500 mt-1">Sourcing & automated profit payouts.</p>
        </Link>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border p-6 sm:p-8 space-y-5">
        <h2 className="text-lg font-bold">Store Information</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
          <input value={form.store_name} onChange={(e) => setForm({ ...form, store_name: e.target.value })} className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Store Description</label>
          <textarea rows={3} value={form.store_description} onChange={(e) => setForm({ ...form, store_description: e.target.value })} className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
          <input value={form.whatsapp_number} onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })} className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
          <input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
        </div>
        <button type="submit" disabled={saving} className="w-full bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}