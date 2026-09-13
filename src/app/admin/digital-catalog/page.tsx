import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

export default async function AdminDigitalCatalogPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single();
  if (profile?.role !== 'platform_admin') {
    return <div className="p-10 text-center text-red-600 font-bold">Access denied</div>;
  }

  const { data: catalog } = await supabase
    .from('digital_catalog')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">📚 Digital Catalog Management</h1>
          <p className="text-gray-600 text-sm">{catalog?.length || 0} products in platform catalog</p>
        </div>
        <Link href="/admin/digital-catalog/add" className="px-5 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700">
          + Add New Product
        </Link>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="p-5 border-b bg-gray-50">
          <h2 className="font-bold">All Digital Products</h2>
        </div>
        <div className="divide-y">
          {(!catalog || catalog.length === 0) ? (
            <p className="p-8 text-center text-gray-500">No digital products yet</p>
          ) : (
            catalog.map((product: any) => (
              <div key={product.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-3 h-3 rounded-full ${
                        product.cover_color === 'green' ? 'bg-green-500' :
                        product.cover_color === 'blue' ? 'bg-blue-500' :
                        product.cover_color === 'purple' ? 'bg-purple-500' :
                        product.cover_color === 'pink' ? 'bg-pink-500' :
                        product.cover_color === 'orange' ? 'bg-orange-500' :
                        product.cover_color === 'yellow' ? 'bg-yellow-500' :
                        product.cover_color === 'teal' ? 'bg-teal-500' :
                        product.cover_color === 'red' ? 'bg-red-500' :
                        product.cover_color === 'indigo' ? 'bg-indigo-500' :
                        'bg-gray-500'
                      }`} />
                      <h3 className="font-bold text-gray-900">{product.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="px-2 py-1 bg-gray-100 rounded font-bold">{product.category}</span>
                      <span className="text-gray-500">Price: {formatCurrency(product.suggested_price)}</span>
                      <span className="text-gray-500">Profit Score: {product.profit_score}%</span>
                      <span className="text-gray-500">{product.is_active ? '✅ Active' : '❌ Inactive'}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/admin/digital-catalog/${product.id}/edit`} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700">
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}