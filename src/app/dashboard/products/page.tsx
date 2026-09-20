import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const cookieStore = await cookies();
  const activeId = cookieStore.get('active_merchant_id')?.value;

  const { data: merchants } = await supabase
    .from('merchants')
    .select('id, store_name, store_slug')
    .eq('user_id', user?.id);
  const merchant = (merchants || []).find((m: any) => m.id === activeId) || (merchants || [])[0];

  const { data: products } = merchant
    ? await supabase.from('products').select('*').eq('merchant_id', merchant.id).order('created_at', { ascending: false })
    : { data: [] };

  const storeUrl = merchant?.store_slug ? `https://${merchant.store_slug}.orizzoncart.name.ng` : '#';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-gray-600 text-sm">{products?.length || 0} products in {merchant?.store_name || 'your store'}</p>
        </div>
        <Link href="/dashboard/products/add" className="px-5 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 shrink-0">
          + Add Product
        </Link>
      </div>

      {(!products || products.length === 0) ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-16 text-center">
          <p className="text-5xl mb-4">📦</p>
          <h2 className="text-xl font-bold mb-2">No products yet</h2>
          <p className="text-gray-600 mb-6">Add your first product — it only takes a name, a price and a photo.</p>
          <Link href="/dashboard/products/add" className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700">
            Add Your First Product
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((p: any) => (
            <div key={p.id} className="bg-white rounded-2xl border p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 truncate">{p.name}</p>
                  <p className="text-sm font-extrabold text-purple-700 mt-0.5">{formatCurrency(p.price)}</p>
                  {p.category && <p className="text-[11px] text-gray-500 mt-0.5 uppercase font-bold">{p.category}</p>}
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {p.is_active ? 'Active' : 'Hidden'}
                </span>
              </div>

              <div className="flex gap-2 pt-1 border-t">
                <Link
                  href={`${storeUrl}/p/${p.slug || p.id}`}
                  target="_blank"
                  className="flex-1 text-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200"
                >
                  👀 View
                </Link>
                <Link
                  href={`/dashboard/products/${p.id}/edit`}
                  className="flex-1 text-center px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100"
                >
                  ✏️ Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}