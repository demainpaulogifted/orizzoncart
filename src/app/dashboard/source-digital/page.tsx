'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const GRADIENTS: Record<string, string> = {
  green: 'from-green-500 to-emerald-700',
  blue: 'from-blue-500 to-indigo-700',
  purple: 'from-purple-500 to-violet-700',
  pink: 'from-pink-500 to-rose-700',
  orange: 'from-orange-500 to-red-700',
  yellow: 'from-amber-400 to-orange-600',
  teal: 'from-teal-500 to-cyan-700',
  red: 'from-red-500 to-rose-700',
  indigo: 'from-indigo-500 to-purple-700',
  gray: 'from-slate-500 to-slate-700',
};

export default function SourceDigitalPage() {
  const [catalog, setCatalog] = useState<any[]>([]);
  const [sourced, setSourced] = useState<string[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [storeId, setStoreId] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: catalogData } = await supabase.from('digital_catalog').select('*').eq('is_active', true);
      setCatalog(catalogData || []);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: m } = await supabase.from('merchants').select('id, store_name').eq('user_id', user.id).order('created_at');
        const list = m || [];
        setStores(list);
        const cookieId = document.cookie.split(';').map((c) => c.trim()).find((c) => c.startsWith('active_merchant_id='))?.split('=')[1];
        const chosen = list.find((s: any) => s.id === cookieId) || list[0];
        if (chosen) setStoreId(chosen.id);
      }
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    const loadSourced = async () => {
      if (!storeId) return;
      const supabase = createClient();
      const { data: items } = await supabase.from('products').select('catalog_id').eq('merchant_id', storeId).not('catalog_id', 'is', null);
      setSourced((items || []).map((i: any) => i.catalog_id).filter(Boolean));
    };
    loadSourced();
  }, [storeId]);

  const source = async (p: any) => {
    if (!storeId) {
      toast.error('Create a store first');
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.from('products').insert({
      merchant_id: storeId,
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

  if (loading) return <div className="p-10 text-center text-gray-500">Loading catalog...</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">⚡ Source Digital Products</h1>
          <p className="text-gray-600 text-sm">{catalog.length} proven products • You keep 60% of every sale</p>
        </div>
        {stores.length > 0 && (
          <label className="flex items-center gap-2 bg-white border rounded-xl px-3 py-2 text-sm font-bold text-gray-700">
            <span className="text-xs text-gray-500">Sourcing into:</span>
            <select value={storeId} onChange={(e) => setStoreId(e.target.value)} className="bg-transparent font-bold outline-none max-w-[160px]">
              {stores.map((s: any) => (
                <option key={s.id} value={s.id}>{s.store_name}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search products..."
        className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-sm"
      />

      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold ${filter === cat ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {list.map((p) => {
          const isSourced = sourced.includes(p.id);
          return (
            <div key={p.id} className="bg-white border rounded-xl overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
              <div className={`h-28 bg-gradient-to-br ${GRADIENTS[p.cover_color] || GRADIENTS.purple} p-2.5 flex flex-col justify-between relative overflow-hidden`}>
                <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-white/10" />
                <div className="absolute -right-1 -top-6 w-16 h-16 rounded-full bg-white/10" />
                <span className="self-start bg-black/25 text-white text-[8px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded">
                  {p.category}
                </span>
                <p className="text-white font-extrabold text-[13px] leading-tight uppercase line-clamp-3 relative">{p.title}</p>
                <span className="absolute top-2 right-2 bg-white/95 text-purple-700 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">🔥 {p.profit_score}%</span>
              </div>
              <div className="p-2.5 flex flex-col gap-1.5 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-extrabold text-gray-900">₦{Number(p.suggested_price).toLocaleString()}</p>
                  <p className="text-[9px] text-green-600 font-bold">earn ₦{Math.round(Number(p.suggested_price) * 0.6).toLocaleString()}</p>
                </div>
                <button
                  onClick={() => source(p)}
                  disabled={isSourced}
                  className={`w-full py-1.5 rounded-lg font-bold text-[11px] ${isSourced ? 'bg-green-100 text-green-700' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
                >
                  {isSourced ? '✅ In Store' : '⚡ Source to My Store'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}