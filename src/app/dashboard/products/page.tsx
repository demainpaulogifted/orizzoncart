'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const cookieId = document.cookie.split(';').map((c) => c.trim()).find((c) => c.startsWith('active_merchant_id='))?.split('=')[1];
      const { data: merchants } = await supabase.from('merchants').select('id').eq('user_id', user?.id);
      const merchant = (merchants || []).find((m: any) => m.id === cookieId) || (merchants || [])[0];
      
      if (merchant) {
        const { data } = await supabase
          .from('products')
          .select('*')
          .eq('merchant_id', merchant.id)
          .order('created_at', { ascending: false });
        setProducts(data || []);
      }
      setLoading(false);
    };
    load();
  }, []);

  const deleteProduct = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    const supabase = createClient();
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete: ' + error.message);
    } else {
      toast.success('Product deleted');
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
    setDeleting(null);
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-gray-600 text-sm">{products.length} products in your store</p>
        </div>
        <Link href="/dashboard/products/add" className="px-5 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800">+ Add Product</Link>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed p-16 text-center">
          <p className="text-5xl mb-4">📦</p>
          <h2 className="text-xl font-bold mb-2">No products yet</h2>
          <p className="text-gray-600 mb-6">Add your first product</p>
          <Link href="/dashboard/products/add" className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700">Add Product</Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((p: any) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{p.name}</td>
                    <td className="px-6 py-4">{formatCurrency(p.price)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.is_digital ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                        {p.is_digital ? 'Digital' : 'Physical'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {p.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => deleteProduct(p.id, p.name)}
                        disabled={deleting === p.id}
                        className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 disabled:opacity-50"
                      >
                        {deleting === p.id ? '...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}