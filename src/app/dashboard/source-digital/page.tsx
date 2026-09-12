'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const GRADIENTS: Record<string, string> = {
  green: 'from-green-400 to-emerald-600',
  blue: 'from-blue-400 to-indigo-600',
  purple: 'from-purple-400 to-violet-600',
  pink: 'from-pink-400 to-rose-600',
  orange: 'from-orange-400 to-red-600',
  yellow: 'from-yellow-400 to-amber-600',
  teal: 'from-teal-400 to-cyan-600',
  red: 'from-red-400 to-rose-600',
  indigo: 'from-indigo-400 to-purple-600',
  gray: 'from-gray-400 to-gray-600',
};

export default function SourceDigitalPage() {
  const [catalog, setCatalog] = useState<any[]>([]);
  const [sourced, setSourced] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [merchantId, setMerchantId] = useState('');

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: catalogData } = await supabase
        .from('digital_catalog')
        .select('*')
        .eq('is_active', true)
        .order('profit_score', { ascending: false });
      setCatalog(catalogData || []);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: m } = await supabase
          .from('merchants')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        if (m) {
          setMerchantId(m.id);
          const { data: items } = await supabase
            .from('products')
            .select('catalog_id')
            .eq('merchant_id', m.id)
            .not('catalog_id', 'is', null);
          setSourced((items || []).map((i: any) => i.catalog_id).filter(Boolean));
        }
      }
      setLoading(false);
    };
    load();
  }, []);

  const source = async (p: any) => {
    if (!merchantId) {
      toast.error('Create a store first');
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.from('products').insert({
      merchant_id: merchantId,
      name: p.title,
      description: p.description,
      price: p.suggested_price,
      is_digital: true,
      is_active: true,
      catalog_id: p.id,
      images: [],
    });
    if (error) {
      toast.error('Already sourced or failed');
      return;
    }
    toast.success('⚡ Added to your store!');
    setSourced([...sourced, p.id]);
  };

  const categories = ['All', ...Array.from(new Set(catalog.map((p) => p.category)))];
  let list = filter === 'All' ? catalog : catalog.filter((p) => p.category === filter);
  if (search) list = list.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="p-10 text-center text-gray-500">Loading {catalog.length || '...'} products...</div>;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">⚡ Source Digital Products</h1>
        <p className="text-gray-600 text-sm">{catalog.length} proven products ready to sell. You keep 60%, OrizzonCart takes 40%.</p>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search products..."
        className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
      />

      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold ${
              filter === cat ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {list.map((p) => {
          const isSourced = sourced.includes(p.id);
          return (
            <div key={p.id} className="bg-white border rounded-2xl overflow-hidden hover:shadow-xl transition-shadow flex flex-col">
              <div className={`h-36 bg-gradient-to-br ${GRADIENTS[p.cover_color] || GRADIENTS.purple} flex flex-col items-center justify-center relative`}>
                <span className="text-6xl drop-shadow-lg">{p.cover_emoji}</span>
                <span className="absolute top-2 right-2 bg-white/90 text-purple-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full">🔥 {p.profit_score}%</span>
              </div>
              <div className="p-4 flex flex-col gap-2 flex-1">
                <h3 className="font-bold text-gray-900 text-sm leading-snug">{p.title}</h3>
                <p className="text-[11px] text-gray-500">{p.category}</p>
                <p className="text-xs text-gray-600 line-clamp-2 flex-1">{p.description}</p>
                <div className="flex items-center justify-between">
                  <p className="text-base font-extrabold text-gray-900">₦{Number(p.suggested_price).toLocaleString()}</p>
                  <p className="text-[10px] text-green-600 font-bold">You earn ₦{Math.round(Number(p.suggested_price) * 0.6).toLocaleString()}</p>
                </div>
                <button
                  onClick={() => source(p)}
                  disabled={isSourced}
                  className={`w-full py-2 rounded-xl font-bold text-xs ${
                    isSourced ? 'bg-green-100 text-green-700' : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {isSourced ? '✅ In Your Store' : '⚡ Source to My Store'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}