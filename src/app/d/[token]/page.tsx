import { notFound } from 'next/navigation';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

const GRADIENTS: Record<string, string> = {
  green: 'from-green-500 to-emerald-700',
  blue: 'from-blue-500 to-indigo-700',
  purple: 'from-purple-500 to-violet-700',
  pink: 'from-pink-500 to-rose-700',
  orange: 'from-orange-500 to-red-700',
  yellow: 'from-yellow-500 to-amber-700',
  teal: 'from-teal-500 to-cyan-700',
  red: 'from-red-500 to-rose-700',
  indigo: 'from-indigo-500 to-purple-700',
  gray: 'from-gray-500 to-gray-700',
};

export default async function DigitalAccessPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const admin = createAdminClient();
  
  const { data: purchase } = await admin
    .from('digital_purchases')
    .select('*, digital_catalog(*)')
    .eq('access_token', token)
    .single();
  
  if (!purchase) notFound();
  
  await admin
    .from('digital_purchases')
    .update({ accessed_count: purchase.accessed_count + 1 })
    .eq('id', purchase.id);

  const c = purchase.digital_catalog as any;
  const sections = c.content_sections || [];

  return (
    <div className="min-h-screen bg-[#f6f4fb] py-10 px-4 print:py-0">
      <div className="max-w-3xl mx-auto">
        <div className={`bg-gradient-to-br ${GRADIENTS[c.cover_color] || GRADIENTS.purple} rounded-t-3xl px-8 py-14 text-center text-white shadow-2xl`}>
          <span className="text-7xl drop-shadow-xl">{c.cover_emoji}</span>
          <h1 className="text-3xl md:text-4xl font-extrabold mt-5 leading-tight">{c.title}</h1>
          <p className="text-white/80 text-sm mt-3">{c.category}</p>
        </div>

        <div className="bg-white rounded-b-3xl shadow-2xl overflow-hidden">
          <div className="px-8 py-6 border-b bg-gray-50">
            <p className="text-xs font-bold text-gray-500 uppercase">Contents</p>
            <ol className="mt-2 space-y-1">
              {sections.map((s: any, i: number) => (
                <li key={i} className="text-sm text-purple-700 font-semibold">{i + 1}. {s.title}</li>
              ))}
            </ol>
          </div>

          <div className="px-8 py-10 space-y-10">
            {sections.map((s: any, i: number) => (
              <section key={i}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 text-white flex items-center justify-center font-extrabold">
                    {i + 1}
                  </span>
                  <h2 className="text-xl md:text-2xl font-extrabold text-gray-900">{s.title}</h2>
                </div>
                <p className="text-gray-700 leading-relaxed text-[15px] whitespace-pre-line pl-12">{s.content}</p>
              </section>
            ))}

            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-6 text-center">
              <p className="text-sm font-bold text-purple-800">🎉 You own this forever. Bookmark this page or print it below.</p>
              <button
                onClick={() => window.print()}
                className="mt-3 px-6 py-2.5 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 print:hidden"
              >
                🖨️ Download as PDF
              </button>
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">Delivered by OrizzonCart • OrizzonS Inc.</p>
      </div>
    </div>
  );
}