import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const merchantId = url.searchParams.get('merchant_id')?.trim();

  if (!merchantId) {
    return NextResponse.json(
      { error: 'merchant_id required' },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  const { data, error } = await admin
    .from('store_reviews')
    .select('id, merchant_id, reviewer_name, rating, comment, created_at')
    .eq('merchant_id', merchantId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('[Store reviews GET]', error.message);
    return NextResponse.json(
      { error: 'Unable to load reviews.' },
      { status: 500 }
    );
  }

  const reviews = data || [];

  const [{ data: replies, error: repliesError }, { data: votes, error: votesError }] =
    await Promise.all([
      admin
        .from('store_review_replies')
        .select('id, review_id, author_role, author_name, body, created_at')
        .in('review_id', reviews.map((r) => r.id).length ? reviews.map((r) => r.id) : ['00000000-0000-0000-0000-000000000000'])
        .order('created_at', { ascending: true }),
      admin
        .from('store_review_helpful_votes')
        .select('review_id')
        .in('review_id', reviews.map((r) => r.id).length ? reviews.map((r) => r.id) : ['00000000-0000-0000-0000-000000000000']),
    ]);

  if (repliesError || votesError) {
    console.error('[Store reviews interactions]', {
      repliesError: repliesError?.message,
      votesError: votesError?.message,
    });
    return NextResponse.json(
      { error: 'Unable to load review details.' },
      { status: 500 }
    );
  }

  const enrichedReviews = reviews.map((review) => ({
    ...review,
    helpful_count: (votes || []).filter((v) => v.review_id === review.id).length,
    replies: (replies || []).filter((r) => r.review_id === review.id),
  }));

  const count = reviews.length;
  const average = count
    ? Math.round(
        (reviews.reduce((sum, review) => sum + Number(review.rating), 0) /
          count) *
          10
      ) / 10
    : 0;

  return NextResponse.json(
    { reviews: enrichedReviews, average, count },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

export async function POST(request: Request) {
  let body: any;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const merchantId =
    typeof body.merchant_id === 'string' ? body.merchant_id.trim() : '';
  const name =
    typeof body.reviewer_name === 'string' ? body.reviewer_name.trim() : '';
  const email =
    typeof body.reviewer_email === 'string'
      ? body.reviewer_email.trim().toLowerCase()
      : '';
  const comment =
    typeof body.comment === 'string' ? body.comment.trim() : '';
  const rating = Number(body.rating);

  if (!merchantId) {
    return NextResponse.json({ error: 'Missing store.' }, { status: 400 });
  }

  if (!name || name.length > 100) {
    return NextResponse.json(
      { error: 'Enter a name of 1–100 characters.' },
      { status: 400 }
    );
  }

  if (
    !email ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return NextResponse.json(
      { error: 'Enter a valid email address.' },
      { status: 400 }
    );
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: 'Rating must be between 1 and 5.' },
      { status: 400 }
    );
  }

  if (comment.length > 3000) {
    return NextResponse.json(
      { error: 'Review must be 3000 characters or fewer.' },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  const { data: merchant, error: merchantError } = await admin
    .from('merchants')
    .select('id, is_active')
    .eq('id', merchantId)
    .maybeSingle();

  if (merchantError) {
    console.error('[Store review merchant lookup]', merchantError.message);
    return NextResponse.json(
      { error: 'Unable to verify the store.' },
      { status: 500 }
    );
  }

  if (!merchant || !merchant.is_active) {
    return NextResponse.json(
      { error: 'This store is unavailable for reviews.' },
      { status: 404 }
    );
  }

  const { error } = await admin.from('store_reviews').insert({
    merchant_id: merchantId,
    reviewer_name: name,
    reviewer_email: email,
    rating,
    comment: comment || null,
    status: 'approved',
  });

  if (error) {
    console.error('[Store review insert]', error.message);
    return NextResponse.json(
      { error: 'Your review could not be saved. Please try again.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true }, { status: 201 });
}