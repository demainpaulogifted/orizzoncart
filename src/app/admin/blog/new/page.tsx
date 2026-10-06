'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function NewBlogPostPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    description: '',
    content: '',
    is_published: false,
  });

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      slug: prev.slug ? prev.slug : slugify(title),
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.slug.trim()) {
      toast.error('Title and slug are required');
      return;
    }

    setSaving(true);
    const supabase = createClient();

    const { error } = await supabase.from('posts').insert({
      title: form.title.trim(),
      slug: form.slug.trim(),
      excerpt: form.excerpt.trim() || null,
      description: form.description.trim() || null,
      content: form.content,
      is_published: form.is_published,
      updated_at: new Date().toISOString(),
    });

    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(form.is_published ? 'Post published!' : 'Draft saved!');
    router.push('/admin/blog');
    router.refresh();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/blog" className="text-sm font-bold text-purple-600 hover:underline">
          ← Back
        </Link>
        <h1 className="text-2xl font-bold">New Blog Post</h1>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border p-6 space-y-5">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Title *</label>
          <input
            required
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="How to Start an Online Store in Nigeria"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Slug *</label>
          <input
            required
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
            className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="how-to-start-online-store-nigeria"
          />
          <p className="text-xs text-gray-500 mt-1">
            URL: /blog/{form.slug || 'your-slug'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Excerpt</label>
          <textarea
            rows={2}
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Short summary shown under the title"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">SEO Description</label>
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Meta description for Google"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Content (HTML) *</label>
          <textarea
            required
            rows={14}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
            placeholder="<p>Write your blog content in HTML...</p>"
          />
        </div>

        <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
          <input
            type="checkbox"
            checked={form.is_published}
            onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
            className="w-4 h-4 accent-purple-600"
          />
          Publish now (show on site + sitemap)
        </label>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : form.is_published ? 'Publish Post' : 'Save Draft'}
        </button>
      </form>
    </div>
  );
}