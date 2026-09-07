import { createClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: merchant } = await supabase.from('merchants').select('id').eq('user_id', user?.id).single();
  const { data: products } = await supabase.from('products').select('*').eq('merchant_id', merchant?.id).order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-gray-600 text-sm">{products?.length || 0} products in your store</p>
        </div>
        <Link href="/dashboard/products/add" className="px-5 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800">+ Add Product</Link>
      </div>

      {(!products || products.length === 0) ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-16 text-center">
          <p className="text-5xl mb-4">📦</p>
          <h2 className="text-xl font-bold mb-2">No products yet</h2>
          <p className="text-gray-600 mb-6">Add your first product — it only takes a name, a price and a photo.</p>
          <Link href="/dashboard/products/add" className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700">Add Your First Product</Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{p.name}</td>
                  <td className="px-6 py-4">{formatCurrency(p.price)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {p.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}