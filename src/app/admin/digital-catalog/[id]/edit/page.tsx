'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

const CATEGORIES = [
  'Side-Hustle Starters', 'Career & Jobs', 'Education', 'Social Media & Marketing',
  'Business Templates', 'Food & Health', 'Events & Lifestyle', 'Faith & Community',
  'Tech Skills', 'Parenting', 'Real Life Admin', 'AI & Prompt Packs'
];

const COLORS = ['green', 'blue', 'purple', 'pink', 'orange', 'yellow', 'teal', 'red', 'indigo', 'gray'];

export default function EditDigitalProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [form, setForm] = useState<any>({
    title: '',
    description: '',
    category: '',
    suggested_price: 3500,
    profit_score: 80,
    cover_color: 'purple',
    is_active: true,
    content_sections: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('digital_catalog').select('*').eq('id', productId).single();
      if (data) {
        setForm({
          ...data,
          content_sections: data.content_sections || []
        });
      }
      setLoading(false);
    };
    load();
  }, [productId]);

  const addSection = () => {
    setForm({
      ...form,
      content_sections: [...form.content_sections, { title: '', content: '' }]
    });
  };

  const updateSection = (idx: number, field: string, value: string) => {
    const updated = [...form.content_sections];
    updated[idx] = { ...updated[idx], [field]: value };
    setForm({ ...form, content_sections: updated });
  };

  const removeSection = (idx: number) => {
    setForm({
      ...form,
      content_sections: form.content_sections.filter((_: any, i: number) => i !== idx)
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from('digital_catalog')
      .update({
        title: form.title,
        description: form.description,
        category: form.category,
        suggested_price: form.suggested_price,
        profit_score: form.profit_score,
        cover_color: form.cover_color,
        is_active: form.is_active,
        content_sections: form.content_sections
      })
      .eq('id', productId);

    setSaving(false);
    if (error) {
      toast.error('Failed: ' + error.message);
    } else {
      toast.success('Product updated! ✅');
      router.push('/admin/digital-catalog');
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/digital-catalog" className="text-sm font-bold text-purple-600 hover:underline">← Back</Link>
        <h1 className="text-2xl font-bold">Edit Digital Product</h1>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border p-6 space-y-5">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Title *</label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Description *</label>
          <textarea
            required
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Category *</label>
            <select
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select...</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Cover Color</label>
            <select
              value={form.cover_color}
              onChange={(e) => setForm({ ...form, cover_color: e.target.value })}
              className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
            >
              {COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Price (₦) *</label>
            <input
              required
              type="number"
              value={form.suggested_price}
              onChange={(e) => setForm({ ...form, suggested_price: Number(e.target.value) })}
              className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Profit Score %</label>
            <input
              type="number"
              value={form.profit_score}
              onChange={(e) => setForm({ ...form, profit_score: Number(e.target.value) })}
              className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="w-4 h-4 accent-purple-600"
              />
              Active
            </label>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-bold text-gray-700">Content Sections</label>
            <button type="button" onClick={addSection} className="text-sm font-bold text-purple-600 hover:underline">
              + Add Section
            </button>
          </div>
          <div className="space-y-3">
            {form.content_sections.map((section: any, idx: number) => (
              <div key={idx} className="border rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500">Section {idx + 1}</span>
                  <button type="button" onClick={() => removeSection(idx)} className="text-xs text-red-600 font-bold hover:underline">
                    Remove
                  </button>
                </div>
                <input
                  placeholder="Section title"
                  value={section.title}
                  onChange={(e) => updateSection(idx, 'title', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
                <textarea
                  placeholder="Section content"
                  rows={3}
                  value={section.content}
                  onChange={(e) => updateSection(idx, 'content', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={saving} className="w-full py-3.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50">
          {saving ? 'Saving...' : 'Update Product'}
        </button>
      </form>
    </div>
  );
}