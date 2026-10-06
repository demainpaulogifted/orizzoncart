'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    description: '',
    content: '',
    is_published: false,
  });

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from('posts').select('*').eq('id', postId).single();
      if (error || !data) {
        toast.error('Post not found');
        router.push('/admin/blog');
        return;
      }
      setForm({
        title: data.title || '',
        slug: data.slug || '',
        excerpt: data.excerpt || '',
        description: data.description || '',
        content: data.content || '',
        is_published: !!data.is_published,
      });
      setLoading(false);
    };
    load();
  }, [postId, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();

    const { error } = await supabase
      .from('posts')
      .update({
        title: form.title.trim(),
        slug: form.slug.trim(),
        excerpt: form.excerpt.trim() || null,
        description: form.description.trim() || null,
        content: form.content,
        is_published: form.is_published,
        updated_at: new Date().toISOString(),
      })
      .eq('id', postId);

    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success('Post updated!');
    router.push('/admin/blog');
    router.refresh();
  };

  const handleDelete = async () => {
    if (!confirm('Delete this post permanently?')) return;
    const supabase = createClient();
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Post deleted');
    router.push('/admin/blog');
    router.refresh();
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/blog" className="text-sm font-bold text-purple-600 hover:underline">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold">Edit Blog Post</h1>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          className="px-3 py-1.5 text-xs font-bold text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
        >
          Delete
        </button>
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
          <label className="block text-sm font-bold text-gray-700 mb-1">Slug *</label>
          <input
            required
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
            className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Excerpt</label>
          <textarea
            rows={2}
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">SEO Description</label>
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
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
          />
        </div>

        <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
          <input
            type="checkbox"
            checked={form.is_published}
            onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
            className="w-4 h-4 accent-purple-600"
          />
          Published
        </label>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Update Post'}
        </button>
      </form>
    </div>
  );
}