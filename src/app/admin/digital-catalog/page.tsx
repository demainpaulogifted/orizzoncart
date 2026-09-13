import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { BulkSeoButton } from '@/components/admin/BulkSeoButton';

export default async function AdminDigitalCatalogPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single();

  if (profile?.role !== 'platform_admin') {
    return (
      <div className="p-10 text-center text-red-600 font-bold">Access denied</div>
    );
  }

  // Only fields needed — faster with 590+ products
  const { data: catalog } = await supabase
    .from('digital_catalog')
    .select('id, title, description, category, suggested_price, profit_score, cover_color, is_active')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-5 min-w-0">
      <div className="flex flex-col gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold leading-tight">
            📚 Digital Catalog Management
          </h1>
          <p className="text-gray-600 text-sm mt-0.5">
            {catalog?.length || 0} products in platform catalog
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <BulkSeoButton />
          <Link
            href="/admin/digital-catalog/add"
            className="px-4 sm:px-5 py-2.5 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 whitespace-nowrap"
          >
            + Add New Product
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden min-w-0">
        <div className="px-4 py-3 sm:p-5 border-b bg-gray-50">
          <h2 className="font-bold text-sm sm:text-base">All Digital Products</h2>
        </div>
        <div className="divide-y">
          {!catalog || catalog.length === 0 ? (
            <p className="p-8 text-center text-gray-500">No digital products yet</p>
          ) : (
            catalog.map((product: any) => {
              const seoLen = (product.description || '').length;
              return (
                <div key={product.id} className="p-3 sm:p-4 hover:bg-gray-50">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2 mb-1">
                        <span
                          className={`mt-1.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0 ${
                            product.cover_color === 'green'
                              ? 'bg-green-500'
                              : product.cover_color === 'blue'
                              ? 'bg-blue-500'
                              : product.cover_color === 'purple'
                              ? 'bg-purple-500'
                              : product.cover_color === 'pink'
                              ? 'bg-pink-500'
                              : product.cover_color === 'orange'
                              ? 'bg-orange-500'
                              : product.cover_color === 'yellow'
                              ? 'bg-yellow-500'
                              : product.cover_color === 'teal'
                              ? 'bg-teal-500'
                              : product.cover_color === 'red'
                              ? 'bg-red-500'
                              : product.cover_color === 'indigo'
                              ? 'bg-indigo-500'
                              : 'bg-gray-500'
                          }`}
                        />
                        <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-snug break-words">
                          {product.title}
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2 pl-4 sm:pl-5">
                        {product.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs pl-4 sm:pl-5">
                        <span className="px-2 py-0.5 bg-gray-100 rounded font-bold text-gray-700">
                          {product.category}
                        </span>
                        <span className="text-gray-500 whitespace-nowrap">
                          {formatCurrency(product.suggested_price)}
                        </span>
                        <span className="text-gray-500 whitespace-nowrap">
                          Profit {product.profit_score}%
                        </span>
                        <span className="text-gray-500 whitespace-nowrap">
                          {product.is_active ? '✅ Active' : '❌ Inactive'}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded font-bold whitespace-nowrap ${
                            seoLen >= 80
                              ? 'bg-green-100 text-green-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          SEO {seoLen}
                        </span>
                      </div>
                    </div>
                    <div className="pl-4 sm:pl-0 shrink-0">
                      <Link
                        href={`/admin/digital-catalog/${product.id}/edit`}
                        className="inline-flex px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-bold hover:bg-blue-700"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}