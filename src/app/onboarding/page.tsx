'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { generateSlug } from '@/lib/utils';

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    business_name: '',
    store_name: '',
    store_slug: '',
    whatsapp_number: '',
    merchant_type: 'physical',
    store_description: '',
  });

  // Auto-switch: shows orizzoncart.name.ng now, orizzoncart.com when you upgrade
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'orizzoncart.com';

  useEffect(() => {
    const check = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      const { data } = await supabase.from('merchants').select('id').eq('user_id', user.id).maybeSingle();
      if (data) router.push('/dashboard');
    };
    check();
  }, [router]);

  const handleStoreName = (value: string) => {
    setForm({ ...form, store_name: value, store_slug: generateSlug(value) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/merchants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: form.business_name,
          store_name: form.store_name,
          store_slug: form.store_slug,
          merchant_type: form.merchant_type,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { data: merchant } = await supabase.from('merchants').select('id').eq('user_id', user?.id).single();
      
      // NULL CHECK: Fix for TypeScript error TS18047
      if (!merchant) {
        throw new Error('Store created but not found. Please refresh and try again.');
      }
      
      await supabase.from('merchants').update({
        whatsapp_number: form.whatsapp_number,
        store_description: form.store_description,
      }).eq('id', merchant.id);

      toast.success(`Store created! Your live link: ${form.store_slug}.${rootDomain} 🎉`);
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create store');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold">Set up your store 🏪</h1>
          <p className="text-gray-600 mt-2">Step 2 of 6 — this takes about 2 minutes.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business / Owner Name *</label>
            <input required value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Paul's Fashion Ltd" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Name *</label>
            <input required value={form.store_name} onChange={(e) => handleStoreName(e.target.value)} className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Paul's Fashion" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Store Link *</label>
            <div className="flex items-center gap-2">
              <input required value={form.store_slug} onChange={(e) => setForm({ ...form, store_slug: generateSlug(e.target.value) })} className="flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="paulsfashion" />
              <span className="text-sm text-gray-500 whitespace-nowrap">.{rootDomain}</span>
            </div>
            <p className="text-xs text-purple-600 mt-2 font-semibold">
              ✨ Your customers will visit: <span className="font-mono">{form.store_slug || 'yourstore'}.{rootDomain}</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number * (required to launch)</label>
            <input required type="tel" value={form.whatsapp_number} onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })} className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="+2348012345678" />
            <p className="text-xs text-gray-500 mt-1">Customers will see a WhatsApp chat button on your store.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">What type of merchant are you? *</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setForm({ ...form, merchant_type: 'physical' })} className={`p-4 rounded-xl border-2 text-left transition-all ${form.merchant_type === 'physical' ? 'border-purple-600 bg-purple-50' : 'border-gray-200'}`}>
                <p className="font-bold">📦 Physical Goods</p>
                <p className="text-xs text-gray-500 mt-1">Clothing, shoes, food, gadgets — items you ship.</p>
              </button>
              <button type="button" onClick={() => setForm({ ...form, merchant_type: 'digital' })} className={`p-4 rounded-xl border-2 text-left transition-all ${form.merchant_type === 'digital' ? 'border-purple-600 bg-purple-50' : 'border-gray-200'}`}>
                <p className="font-bold">📚 Digital Goods</p>
                <p className="text-xs text-gray-500 mt-1">Courses, eBooks, files — instant delivery, no shipping.</p>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Description (optional)</label>
            <textarea value={form.store_description} onChange={(e) => setForm({ ...form, store_description: e.target.value })} rows={3} className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Tell customers what you sell..." />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-purple-700 disabled:opacity-50">
            {loading ? 'Creating store...' : 'Create My Store →'}
          </button>
        </form>
      </div>
    </div>
  );
}