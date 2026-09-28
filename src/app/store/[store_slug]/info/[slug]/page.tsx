import { notFound } from 'next/navigation';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ store_slug: string; slug: string }> }): Promise<Metadata> {
  const { store_slug, slug } = await params;
  const admin = createAdminClient();

  const { data: merchant } = await admin
    .from('merchants')
    .select('id, store_name')
    .eq('store_slug', store_slug)
    .maybeSingle();

  if (!merchant) return { title: 'Page Not Found' };

  const decodedSlug = decodeURIComponent(slug);
  const { data: page } = await admin
    .from('store_pages')
    .select('title, content')
    .eq('merchant_id', merchant.id)
    .eq('slug', decodedSlug)
    .eq('is_active', true)
    .maybeSingle();

  if (!page) return { title: 'Page Not Found' };

  return {
    title: `${page.title} | ${merchant.store_name}`,
    description: page.content?.substring(0, 150) || `Read ${page.title} at ${merchant.store_name}.`,
  };
}

export default async function StoreInfoPage({ params }: { params: Promise<{ store_slug: string; slug: string }> }) {
  const { store_slug, slug } = await params;
  const admin = createAdminClient();

  const { data: merchant } = await admin
    .from('merchants')
    .select('id, store_name')
    .eq('store_slug', store_slug)
    .maybeSingle();

  if (!merchant) notFound();

  const decodedSlug = decodeURIComponent(slug);
  const { data: page } = await admin
    .from('store_pages')
    .select('*')
    .eq('merchant_id', merchant.id)
    .eq('slug', decodedSlug)
    .eq('is_active', true)
    .maybeSingle();

  if (!page) notFound();

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">{page.title}</h1>
        <div 
          className="prose prose-purple max-w-none text-gray-700 whitespace-pre-line"
          dangerouslySetInnerHTML={{ __html: page.content || '' }} 
        />
      </div>
    </main>
  );
}