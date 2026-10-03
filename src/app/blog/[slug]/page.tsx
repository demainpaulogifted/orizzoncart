import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/admin';
import type { Metadata } from 'next';
import { MonetagReadingTimeVignette } from '@/components/ads/MonetagReadingTimeVignette';

// ✅ DYNAMIC SEO METADATA
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createClient();
  
  const { data: blog } = await supabase
    .from('posts') // Change to 'posts' if your table is named posts
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (!blog) return { title: 'Blog Post Not Found' };

  return {
    title: `${blog.title} | OrizzonCart Blog`,
    description: blog.excerpt || blog.description || `Read more about ${blog.title} on the OrizzonCart blog.`,
    openGraph: {
      title: blog.title,
      description: blog.excerpt || blog.description,
      type: 'article',
      publishedTime: blog.created_at,
      modifiedTime: blog.updated_at,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createClient();

  const { data: blog } = await supabase
    .from('posts') // Change to 'posts' if your table is named posts
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (!blog) notFound();

  // JSON-LD Schema for Google News & Rich Snippets
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: blog.title,
    description: blog.excerpt || blog.description,
    author: { '@type': 'Organization', name: 'OrizzonCart' },
    publisher: { '@type': 'Organization', name: 'OrizzonCart', logo: { '@type': 'ImageObject', url: 'https://orizzoncart.name.ng/icon-192.png' } },
    datePublished: blog.created_at,
    dateModified: blog.updated_at,
  };

  return (
    <>
      {/* ✅ READING TIME AD: Triggers after 60 seconds of reading */}
      <MonetagReadingTimeVignette zoneId="11938217" triggerSeconds={60} />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      
      <article className="max-w-3xl mx-auto px-4 py-16">
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">{blog.title}</h1>
          <time className="text-gray-500 text-sm">{new Date(blog.created_at).toLocaleDateString()}</time>
        </header>
        
        <div className="prose prose-lg max-w-none text-gray-700">
          {/* Render your blog content here. If it's HTML, use dangerouslySetInnerHTML. If it's Markdown, use a parser. */}
          <div dangerouslySetInnerHTML={{ __html: blog.content }} />
        </div>
      </article>
    </>
  );
}
