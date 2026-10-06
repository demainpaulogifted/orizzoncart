import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function AdminBlogPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single();

  if (profile?.role !== 'platform_admin') {
    return <div className="p-10 text-center text-red-600 font-bold">Access denied</div>;
  }

  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, slug, is_published, created_at, updated_at')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-5 min-w-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">✍️ Blog Posts</h1>
          <p className="text-gray-600 text-sm mt-0.5">{posts?.length || 0} posts</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="px-4 sm:px-5 py-2.5 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 whitespace-nowrap"
        >
          + New Post
        </Link>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="divide-y">
          {!posts || posts.length === 0 ? (
            <p className="p-8 text-center text-gray-500">No blog posts yet. Create your first one.</p>
          ) : (
            posts.map((post: any) => (
              <div key={post.id} className="p-4 hover:bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{post.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    /blog/{post.slug} · {new Date(post.created_at).toLocaleDateString()}
                  </p>
                  <span
                    className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      post.is_published
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {post.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div className="flex gap-2 shrink-0">
                  {post.is_published && (
                    <a
                      href={`https://orizzoncart.name.ng/blog/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 border rounded-lg text-xs font-bold hover:bg-gray-50"
                    >
                      View
                    </a>
                  )}
                  <Link
                    href={`/admin/blog/${post.id}/edit`}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}