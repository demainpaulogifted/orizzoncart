import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const merchantId = url.searchParams.get('merchant_id');
  if (!merchantId)
    return NextResponse.json({ error: 'merchant_id required' }, { status: 400 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('store_reviews')
    .select('*')
    .eq('merchant_id', merchantId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const reviews = data || [];
  const count = reviews.length;
  const average = count
    ? Math.round((reviews.reduce((a: number, r: any) => a + r.rating, 0) / count) * 10) / 10
    : 0;

  return NextResponse.json({ reviews, average, count });
}

export async function POST(request: Request) {
  const b = await request.json();
  const merchantId = (b.merchant_id || '').trim();
  const name = (b.reviewer_name || '').trim();
  const rating = Number(b.rating);
  const comment = (b.comment || '').trim();

  if (!merchantId) return NextResponse.json({ error: 'Missing store' }, { status: 400 });
  if (!name) return NextResponse.json({ error: 'Please enter your name' }, { status: 400 });
  if (!Number.isFinite(rating) || rating < 1 || rating > 5)
    return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin.from('store_reviews').insert({
    merchant_id: merchantId,
    reviewer_name: name,
    rating: Math.round(rating),
    comment: comment || null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}