import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

  if (!productId) {
    return NextResponse.json({ error: 'productId is required' }, { status: 400 });
  }

  const admin = createAdminClient();
  const offset = (page - 1) * limit;

  const { data: reviews, error: reviewsError } = await admin
    .from('product_reviews')
    .select('*')
    .eq('product_id', productId)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (reviewsError) {
    console.error('Reviews fetch error:', reviewsError);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }

  // Get count for pagination
  const { count } = await admin
    .from('product_reviews')
    .select('*', { count: 'exact', head: true })
    .eq('product_id', productId)
    .eq('is_approved', true);

  // Get rating breakdown
  const { data: ratingBreakdown } = await admin
    .from('product_reviews')
    .select('rating')
    .eq('product_id', productId)
    .eq('is_approved', true);

  const breakdown = [5, 4, 3, 2, 1].map(r => ({
    rating: r,
    count: ratingBreakdown?.filter(rev => rev.rating === r).length || 0,
  }));

  return NextResponse.json({
    reviews: reviews || [],
    total: count || 0,
    page,
    limit,
    breakdown,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, merchantId, customerName, customerEmail, rating, title, comment } = body;

    // Validation
    if (!productId || !merchantId || !customerName || !rating || !comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    if (comment.length < 10) {
      return NextResponse.json({ error: 'Comment must be at least 10 characters' }, { status: 400 });
    }

    if (comment.length > 2000) {
      return NextResponse.json({ error: 'Comment must be less than 2000 characters' }, { status: 400 });
    }

    if (customerName.length > 100) {
      return NextResponse.json({ error: 'Name too long' }, { status: 400 });
    }

    // Sanitize inputs (basic XSS prevention)
    const sanitize = (str: string) => str.replace(/<[^>]*>/g, '').trim();

    const admin = createAdminClient();

    const { data: review, error } = await admin
      .from('product_reviews')
      .insert({
        product_id: productId,
        merchant_id: merchantId,
        customer_name: sanitize(customerName),
        customer_email: customerEmail ? sanitize(customerEmail) : null,
        rating: parseInt(rating),
        title: title ? sanitize(title) : null,
        comment: sanitize(comment),
        is_approved: true, // Auto-approve; set to false if you want moderation
      })
      .select()
      .single();

    if (error) {
      console.error('Review insert error:', error);
      return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
    }

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (err) {
    console.error('Review submission error:', err);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
