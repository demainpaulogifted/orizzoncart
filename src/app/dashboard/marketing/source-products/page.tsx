'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

const SUPPLIERS = [
  {
    id: 'cj',
    name: 'CJ Dropshipping',
    description: '500,000+ products, fast shipping, auto-fulfillment',
    icon: '📦',
    docsUrl: 'https://cjdropshipping.com/api',
    live: true, // Real API available now
  },
  {
    id: 'alibaba',
    name: 'Alibaba',
    description: 'Wholesale prices, bulk orders, verified suppliers',
    icon: '🏭',
    docsUrl: 'https://developer.alibaba.com',
    live: false, // Awaiting official API approval
  },
  {
    id: 'aliexpress',
    name: 'AliExpress',
    description: 'Low-cost products, global shipping',
    icon: '🌍',
    docsUrl: 'https://openservice.aliexpress.com',
    live: false, // Awaiting official API approval
  },
];

export default function SourceProductsPage() {
  const [connections, setConnections] = useState<any[]>([]);
  const [activeSupplier, setActiveSupplier] = useState('');
  const [keyword, setKeyword] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState('');

  useEffect(() => {
    fetch('/api/dropshipping/connections')
      .then(r => r.json())
      .then(d => setConnections(d.connections || []))
      .catch(() => {});
  }, []);

  async function connectSupplier(supplierId: string) {
    const supplier = SUPPLIERS.find(s => s.id === supplierId);
    if (!supplier?.live) {
      toast.info(`${supplierId.toUpperCase()} official API is in approval — coming soon.`);
      return;
    }

    // CJ requires a REAL API key — no fakes
    const apiKey = prompt(`Enter your ${supplierId.toUpperCase()} API Key (required):`);
    if (!apiKey) {
      toast.error(`${supplierId.toUpperCase()} needs a real API key to connect.`);
      return;
    }
    const apiSecret = prompt(`Enter your ${supplierId.toUpperCase()} API Secret (optional):`);

    try {
      const res = await fetch('/api/dropshipping/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplier: supplierId, apiKey, apiSecret: apiSecret || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(`✅ Connected to ${supplierId.toUpperCase()} (LIVE)!`);
      setConnections(prev => [...prev.filter(c => c.supplier !== supplierId), { supplier: supplierId, status: 'connected' }]);
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function disconnectSupplier(supplierId: string) {
    if (!confirm(`Disconnect from ${supplierId.toUpperCase()}?`)) return;
    try {
      const res = await fetch(`/api/dropshipping/connections?supplier=${supplierId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Disconnected');
      setConnections(prev => prev.filter(c => c.supplier !== supplierId));
      if (activeSupplier === supplierId) setActiveSupplier('');
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function search() {
    if (!activeSupplier || !keyword.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/dropshipping/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplier: activeSupplier, keyword, page: 1 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProducts(data.products || []);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function importProduct(p: any) {
    const sellingPrice = prompt(
      `Supplier cost: ₦${p.cost.toLocaleString()}\nEnter your selling price (e.g., ${Math.round(p.cost * 2.5).toLocaleString()} for 150% markup):`
    );
    if (!sellingPrice) return;

    const price = Number(sellingPrice);
    if (isNaN(price) || price <= p.cost) {
      toast.error('Selling price must be higher than supplier cost');
      return;
    }

    setImporting(p.supplier_product_id);
    try {
      const res = await fetch('/api/dropshipping/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplier: activeSupplier,
          productId: p.supplier_product_id,
          sellingPrice: price,
          productData: p,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`✅ Imported! Profit per sale: ₦${(price - p.cost - (p.shipping_cost || 0)).toLocaleString()}`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setImporting('');
    }
  }

  const connectedSuppliers = connections.map(c => c.supplier);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard/marketing/tools" className="text-purple-600 text-sm hover:underline">← Back to Marketing Tools</Link>
        <h1 className="text-2xl font-bold mt-2">📦 Source Products from Suppliers</h1>
        <p className="text-gray-500 text-sm mt-1">
          Connect a supplier with a real API key, search their live catalog, and import products.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900">
        <strong>🌍 Live vs Coming Soon:</strong> CJ Dropshipping connects with a real API key for live search & auto-fulfillment. Alibaba & AliExpress are in official API approval — they'll unlock automatically once access is granted. No fake connections.
      </div>

      {/* Supplier Connections */}
      <section className="space-y-3">
        <h2 className="font-bold text-lg">Your Suppliers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SUPPLIERS.map(s => {
            const isConnected = connectedSuppliers.includes(s.id);
            return (
              <div key={s.id} className={`bg-white border rounded-xl p-4 space-y-3 ${!s.live ? 'opacity-80' : ''}`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{s.icon}</span>
                  <div>
                    <p className="font-bold">{s.name}</p>
                    <p className="text-xs text-gray-500">{s.description}</p>
                  </div>
                </div>

                {s.live ? (
                  isConnected ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <span className="text-xs font-bold text-green-700">Connected (LIVE)</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setActiveSupplier(s.id)}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg ${
                            activeSupplier === s.id ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {activeSupplier === s.id ? '✓ Active' : 'Use This'}
                        </button>
                        <button
                          onClick={() => disconnectSupplier(s.id)}
                          className="px-3 py-2 text-xs font-bold text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                        >
                          Disconnect
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => connectSupplier(s.id)}
                      className="w-full py-2 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700"
                    >
                      🔑 Connect with API Key
                    </button>
                  )
                ) : (
                  <div className="space-y-2">
                    <button
                      disabled
                      className="w-full py-2 bg-gray-200 text-gray-400 text-xs font-bold rounded-lg cursor-not-allowed"
                    >
                      ⏳ Coming Soon
                    </button>
                    <p className="text-[10px] text-gray-400">Official API access in approval.</p>
                  </div>
                )}

                <a href={s.docsUrl} target="_blank" className="block text-[10px] text-purple-600 hover:underline">
                  How to get API keys →
                </a>
              </div>
            );
          })}
        </div>
      </section>

      {/* Search Section */}
      {activeSupplier && (
        <section className="space-y-3">
          <h2 className="font-bold text-lg">Search {SUPPLIERS.find(s => s.id === activeSupplier)?.name} (live)</h2>
          <div className="flex gap-2">
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && search()}
              placeholder="Search products (e.g., 'wireless earbuds', 'yoga mat')"
              className="flex-1 px-4 py-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={search}
              disabled={loading}
              className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </section>
      )}

      {/* Products Grid */}
      {products.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <div key={p.supplier_product_id} className="bg-white border rounded-xl overflow-hidden shadow-sm">
              {p.images[0] && (
                <img src={p.images[0].url} alt={p.title} className="w-full h-40 object-cover" />
              )}
              <div className="p-3 space-y-2">
                <p className="text-xs font-medium line-clamp-2">{p.title}</p>
                <div className="text-xs text-gray-500">
                  <p>Cost: ₦{p.cost.toLocaleString()}</p>
                  <p>Shipping: ₦{(p.shipping_cost || 0).toLocaleString()}</p>
                </div>
                <button
                  onClick={() => importProduct(p)}
                  disabled={importing === p.supplier_product_id}
                  className="w-full py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {importing === p.supplier_product_id ? 'Importing...' : '⚡ Import to My Store'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}