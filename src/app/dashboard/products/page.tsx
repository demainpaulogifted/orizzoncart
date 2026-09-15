import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const cookieStore = await cookies();
  const activeId = cookieStore.get('active_merchant_id')?.value;

  const { data: merchants } = await supabase.from('merchants').select('id, store_name, store_slug').eq('user_id', user?.id);
  const merchant = (merchants || []).find((m: any) => m.id === activeId) || (merchants || [])[0];

  const { data: products } = merchant
    ? await supabase.from('products').select('*').eq('merchant_id', merchant.id).order('created_at', { ascending: false })
    : { data: [] };

  const getProductUrl = (product: any) => {
    if (!merchant?.store_slug) return '#';
    const identifier = product.slug || product.id;
    return `/${merchant.store_slug}/p/${identifier}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-gray-600 text-sm">{products?.length || 0} products in {merchant?.store_name || 'your store'}</p>
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
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Price</th>
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
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {p.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <a
                          href={getProductUrl(p)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200"
                        >
                          View
                        </a>
                        <Link
                          href={`/dashboard/products/${p.id}/edit`}
                          className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-200"
                        >
                          Edit
                        </Link>
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