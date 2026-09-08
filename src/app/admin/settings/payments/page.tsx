'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function AdminPlatformKeysPage() {
  const [form, setForm] = useState({ public_key: '', secret_key: webhookPlaceholder() });
  const [saving, setSaving] = useState(false);

  function webhookPlaceholder() { return ''; }

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('platform_payment_keys').select('*').eq('gateway', 'paystack').maybeSingle();
      if (data) setForm({ public_key: data.public_key || '', secret_key: data.secret_key || '' });
    };
    load();
  }, []);

  const [webhookSecret, setWebhookSecret] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const payload = { gateway: 'paystack', public_key: form.public_key, secret_key: form.secret_key, webhook_secret: webhookSecret, updated_at: new Date().toISOString() };
    const { data: existing } = await supabase.from('platform_payment_keys').select('id').eq('gateway', 'paystack').maybeSingle();
    let error: any;
    if (existing) ({ error } = await supabase.from('platform_payment_keys').update(payload).eq('id', existing.id));
    else ({ error } = await supabase.from('platform_payment_keys').insert(payload));
    if (error) toast.error('Failed: ' + error.message);
    else toast.success('Platform Paystack keys saved! Activation payments are now live.');
    setSaving(false);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Platform Payment Keys</h1>
        <p className="text-gray-600 text-sm">These keys collect ALL platform money: activation fees, theme purchases, subscriptions.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border p-6 sm:p-8 space-y-5">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          🔐 Only super admins can see this page. Keys are stored in an admin-only table.
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Paystack Public Key</label>
          <input value={form.public_key} onChange={(e) => setForm({ ...form, public_key: e.target.value })} placeholder="pk_live_..." className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm outline-none focus:ring-2 focus:ring-amber-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Paystack Secret Key</label>
          <input type="password" value={form.secret_key} onChange={(e) => setForm({ ...form, secret_key: e.target.value })} placeholder="sk_live_..." className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm outline-none focus:ring-2 focus:ring-amber-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Webhook Secret (optional)</label>
          <input type="password" value={webhookSecret} onChange={(e) => setWebhookSecret(e.target.value)} placeholder="SK_..." className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm outline-none focus:ring-2 focus:ring-amber-500" />
        </div>
        <button type="submit" disabled={saving || !form.secret_key} className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Platform Keys'}
        </button>
      </form>
    </div>
  );
}