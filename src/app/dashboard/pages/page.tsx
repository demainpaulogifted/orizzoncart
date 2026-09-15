'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

function slugify(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function StorePagesManager() {
  const [pages, setPages] = useState<any[]>([]);
  const [merchantId, setMerchantId] = useState('');
  const [storeSlug, setStoreSlug] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: '', content: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const cookieId = document.cookie.split(';').map((c) => c.trim()).find((c) => c.startsWith('active_merchant_id='))?.split('=')[1];
    const { data: merchants } = await supabase.from('merchants').select('id, store_slug').eq('user_id', user?.id);
    const merchant = (merchants || []).find((m: any) => m.id === cookieId) || (merchants || [])[0];
    if (merchant) {
      setMerchantId(merchant.id);
      setStoreSlug(merchant.store_slug);
      const { data } = await supabase.from('store_pages').select('*').eq('merchant_id', merchant.id).order('created_at');
      setPages(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const startNew = () => { setEditing({ id: null }); setForm({ title: '', content: '' }); };
  const startEdit = (p: any) => { setEditing({ id: p.id }); setForm({ title: p.title, content: p.content }); };

  const save = async () => {
    if (!form.title.trim() || !form.content.trim()) { toast.error('Title and content are required'); return; }
    setSaving(true);
    const supabase = createClient();
    const slug = slugify(form.title) || `page-${Date.now()}`;
    const payload = { merchant_id: merchantId, title: form.title.trim(), slug, content: form.content };

    const { error } = editing?.id
      ? await supabase.from('store_pages').update(payload).eq('id', editing.id)
      : await supabase.from('store_pages').insert(payload);

    setSaving(false);
    if (error) { toast.error('Failed: ' + error.message); return; }
    toast.success('Page saved — live on your storefront!');
    setEditing(null);
    load();
  };

  const toggle = async (p: any) => {
    const supabase = createClient();
    await supabase.from('store_pages').update({ is_active: !p.is_active }).eq('id', p.id);
    load();
  };

  const remove = async (p: any) => {
    if (!confirm(`Delete page "${p.title}"?`)) return;
    const supabase = createClient();
    await supabase.from('store_pages').delete().eq('id', p.id);
    toast.success('Page deleted');
    load();
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">📄 Store Pages</h1>
          <p className="text-gray-600 text-sm">Build trust: About Us, Refund Policy, FAQ, Delivery Info...</p>
        </div>
        {!editing && (
          <button onClick={startNew} className="px-5 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700">+ New Page</button>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-900">
        <p className="font-bold mb-1">💡 Tip:</p>
        <p>Stores with a Refund Policy + About page convert up to 30% better — customers trust stores that look complete.</p>
      </div>

      {editing && (
        <div className="bg-white rounded-2xl border p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Page Title</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Refund Policy" className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Content</label>
            <textarea rows={10} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Write your policy or story. Separate paragraphs with empty lines." className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-sm" />
          </div>
          <div className="flex gap-3">
            <button onClick={save} disabled={saving} className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save Page'}</button>
            <button onClick={() => setEditing(null)} className="px-5 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {pages.length === 0 && !editing && (
          <div className="bg-white rounded-2xl border border-dashed p-12 text-center">
            <p className="text-4xl mb-3">📄</p>
            <p className="font-bold text-gray-700">No pages yet</p>
            <p className="text-sm text-gray-500 mt-1">Create "About Us" and "Refund Policy" first — they appear as tabs on your storefront.</p>
          </div>
        )}
        {pages.map((p: any) => (
          <div key={p.id} className="bg-white rounded-2xl border p-4 flex items-center gap-2 flex-wrap">
            <div className="flex-1 min-w-[150px]">
              <p className="font-bold text-gray-900">{p.title}</p>
              <p className="text-xs text-gray-500 truncate">/store/{storeSlug}/info/{p.slug}</p>
            </div>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {p.is_active ? 'LIVE' : 'HIDDEN'}
            </span>
            <button onClick={() => toggle(p)} className="px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-bold">{p.is_active ? 'Hide' : 'Show'}</button>
            <button onClick={() => startEdit(p)} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold">Edit</button>
            <button onClick={() => remove(p)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}