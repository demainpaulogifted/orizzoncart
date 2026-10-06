import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const b = await request.json();
  const { type, id, action } = b;

  if (!['store', 'product'].includes(type) || !['approve', 'reject'].includes(action) || !id)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

  const admin = createAdminClient();
  const { data: merchant } = await admin
    .from('merchants').select('id').eq('user_id', user.id).maybeSingle();
  if (!merchant) return NextResponse.json({ error: 'No store' }, { status: 403 });

  const table = type === 'store' ? 'store_reviews' : 'reviews';
  const { data: row } = await admin.from(table).select('*').eq('id', id).maybeSingle();
  if (!row) return NextResponse.json({ error: 'Review not found' }, { status: 404 });

  if (type === 'store') {
    if (row.merchant_id !== merchant.id)
      return NextResponse.json({ error: 'Not your review' }, { status: 403 });
  } else {
    const { data: prod } = await admin
      .from('products').select('merchant_id').eq('id', row.product_id).maybeSingle();
    if (!prod || prod.merchant_id !== merchant.id)
      return NextResponse.json({ error: 'Not your review' }, { status: 403 });
  }

  const status = action === 'approve' ? 'approved' : 'rejected';
  const { error } = await admin.from(table).update({ status }).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}