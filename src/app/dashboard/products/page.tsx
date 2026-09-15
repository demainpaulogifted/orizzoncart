'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [archiving, setArchiving] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const load = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const cookieId = document.cookie
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith('active_merchant_id='))
      ?.split('=')[1];

    const { data: merchants } = await supabase
      .from('merchants')
      .select('id')
      .eq('user_id', user?.id);

    const merchant = (merchants || []).find((m: any) => m.id === cookieId) || (merchants || [])[0];

    if (merchant) {
      let query = supabase
        .from('products')
        .select('*')
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: false });

      if (!showArchived) {
        query = query.eq('is_active', true); // or .eq('is_archived', false)
      }

      const { data } = await query;
      setProducts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [showArchived]);

  const archiveProduct = async (id: string, name: string, currentlyActive: boolean) => {
    const action = currentlyActive ? 'Archive' : 'Restore';
    if (!confirm(`\( {action} " \){name}"?`)) return;

    setArchiving(id);
    const supabase = createClient();

    const { error } = await supabase
      .from('products')
      .update({
        is_active: !currentlyActive,          // hide from storefront
        // is_archived: currentlyActive,      // if you added the column
      })
      .eq('id', id);

    if (error) {
      toast.error('Failed: ' + error.message);
    } else {
      toast.success(currentlyActive ? 'Product archived' : 'Product restored');
      load();
    }
    setArchiving(null);
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-gray-600 text-sm">
            {products.length} product{products.length !== 1 ? 's' : ''} {showArchived ? '(including archived)' : 'in your store'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="px-4 py-2.5 border rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            {showArchived ? 'Show Active Only' : 'Show Archived'}
          </button>

          <Link
            href="/dashboard/products/add"
            className="px-5 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800"
          >
            + Add Product
          </Link>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed p-16 text-center">
          <p className="text-5xl mb-4">📦</p>
          <h2 className="text-xl font-bold mb-2">
            {showArchived ? 'No archived products' : 'No products yet'}
          </h2>
          {!showArchived && (
            <>
              <p className="text-gray-600 mb-6">Add your first product</p>
              <Link
                href="/dashboard/products/add"
                className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700"
              >
                Add Product
              </Link>
            </>
          )}
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
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          p.is_digital
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {p.is_digital ? 'Digital' : 'Physical'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          p.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {p.is_active ? 'Active' : 'Archived'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 flex-wrap">
                        {/* View / Edit */}
                        <Link
                          href={`/dashboard/products/${p.id}/edit`}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100"
                        >
                          Edit
                        </Link>

                        {/* Archive / Restore */}
                        <button
                          onClick={() => archiveProduct(p.id, p.name, p.is_active)}
                          disabled={archiving === p.id}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50 ${
                            p.is_active
                              ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                              : 'bg-green-50 text-green-700 hover:bg-green-100'
                          }`}
                        >
                          {archiving === p.id
                            ? '...'
                            : p.is_active
                            ? 'Archive'
                            : 'Restore'}
                        </button>
                      </div>
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