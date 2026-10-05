'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function GoogleAdsBuilderPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [budget, setBudget] = useState<number>(2000); // Default 2000 NGN
  const [name, setName] = useState<string>('All Products Campaign');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch products for selection
    fetch('/api/products') 
      .then(r => r.json())
      .then(data => {
        // The API might return { products: [...] } or just [...]
        const list = Array.isArray(data) ? data : (data.products || []);
        setProducts(list);
        // Select all by default for "Bulk" ads
        setSelectedIds(list.map((p: any) => p.id));
      })
      .catch(() => setError('Could not load products.'));
  }, []);

  function toggleProduct(id: string) {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  }

  function toggleAll() {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map(p => p.id));
    }
  }

  async function createCampaign() {
    if (selectedIds.length === 0) {
      setError('Please select at least one product.');
      return;
    }
    if (budget <= 0) {
      setError('Budget must be greater than 0.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/marketing/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: 'google',
          name: name,
          dailyBudget: budget,
          productIds: selectedIds
        })
      });

      if (!res.ok) throw new Error((await res.json()).error || 'Failed to save');

      alert('Campaign saved! It is now ready to be launched.');
      router.push('/dashboard/marketing/ads');

    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Link href="/dashboard/marketing/ads" className="text-purple-600 text-sm hover:underline mb-4 inline-block">
        ← Back to Ads
      </Link>

      <h1 className="text-2xl font-bold mb-2">Create Google Ads Campaign</h1>
      <p className="text-gray-500 mb-8">
        Select the products you want to advertise. Your Google Merchant Center catalog will be used automatically.
      </p>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded border border-red-200 text-sm">{error}</div>}

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* LEFT: Products Selection */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-lg">Products ({products.length})</h2>
            <button onClick={toggleAll} className="text-xs text-purple-600 hover:underline">
              {selectedIds.length === products.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          
          <div className="bg-white border rounded-lg divide-y max-h-[500px] overflow-y-auto">
            {products.map((p) => (
              <label key={p.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={selectedIds.includes(p.id)} 
                  onChange={() => toggleProduct(p.id)}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden shrink-0">
                  {p.images && p.images[0]?.url ? (
                    <img src={p.images[0].url} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">📦</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{p.name}</p>
                  <p className="text-xs text-gray-500">{Number(p.price).toLocaleString()} NGN</p>
                </div>
              </label>
            ))}
            {products.length === 0 && <p className="p-4 text-center text-gray-400 text-sm">No products found.</p>}
          </div>
        </div>

        {/* RIGHT: Budget & Settings */}
        <div className="space-y-4 sticky top-6 self-start">
          <div className="bg-white border rounded-lg p-4 space-y-4">
            <h2 className="font-semibold">Campaign Settings</h2>
            
            <div>
              <label className="text-xs text-gray-600">Campaign Name</label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded text-sm" 
                placeholder="Summer Sale"
              />
            </div>

            <div>
              <label className="text-xs text-gray-600">Daily Budget (NGN)</label>
              <input 
                type="number" 
                value={budget}
                onChange={e => setBudget(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 border rounded text-sm" 
                min="100"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                You will be billed directly by Google.
              </p>
            </div>

            <button 
              onClick={createCampaign}
              disabled={saving || selectedIds.length === 0}
              className="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save & Prepare Campaign'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}