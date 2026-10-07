import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const body = await request.json();
  const { supplier, productId, sellingPrice, productData } = body;

  if (!supplier || !productId || !sellingPrice || !productData) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

  const admin = createAdminClient();
  const { data: merchant } = await admin
    .from('merchants').select('id').eq('user_id', user.id).maybeSingle();
  if (!merchant) return NextResponse.json({ error: 'No store' }, { status: 404 });

  // Generate slug
  const base = productData.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const suffix = Math.random().toString(36).substring(2, 6);
  const slug = `${base}-${suffix}`;

  const { data, error } = await admin
    .from('products')
    .insert({
      merchant_id: merchant.id,
      name: productData.title,
      slug: slug,
      description: productData.description,
      price: sellingPrice,
      images: productData.images,
      is_active: true,
      is_digital: false,
      category: productData.category,
      supplier: supplier,
      supplier_product_id: productId,
      supplier_cost: productData.cost,
      supplier_shipping_cost: productData.shipping_cost || 0,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Product already imported' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, product: data });
}