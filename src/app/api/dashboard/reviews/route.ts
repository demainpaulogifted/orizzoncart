import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
try {
// Verify the current signed-in user using their session.
const supabase = await createServerClient();
const {
data: { user },
error: authError,
} = await supabase.auth.getUser();

if (authError || !user) {
  return NextResponse.json(
    { error: 'Please sign in again.' },
    { status: 401, headers: { 'Cache-Control': 'no-store' } }
  );
}

// Resolve the selected store from the dashboard cookie.
const cookieStore = await cookies();
const activeMerchantId = cookieStore.get('active_merchant_id')?.value;

const { data: merchants, error: merchantError } = await supabase
  .from('merchants')
  .select('id, store_slug, created_at')
  .eq('user_id', user.id)
  .order('created_at', { ascending: true });

if (merchantError) {
  console.error('[Dashboard reviews merchant lookup]', merchantError.message);
  return NextResponse.json(
    { error: 'Could not find your stores.' },
    { status: 500, headers: { 'Cache-Control': 'no-store' } }
  );
}

const merchantList = merchants || [];
const merchant =
  merchantList.find((item) => item.id === activeMerchantId) ||
  merchantList[0] ||
  null;

if (!merchant) {
  return NextResponse.json(
    { error: 'No store was found for your account.' },
    { status: 404, headers: { 'Cache-Control': 'no-store' } }
  );
}

// Only use the admin client after confirming ownership above.
const admin = createAdminClient();

const { data: storeReviews, error: storeReviewsError } = await admin
  .from('store_reviews')
  .select('id, merchant_id, reviewer_name, rating, comment, status, created_at')
  .eq('merchant_id', merchant.id)
  .order('created_at', { ascending: false });

if (storeReviewsError) {
  console.error('[Dashboard store reviews query]', storeReviewsError.message);
  return NextResponse.json(
    { error: 'Could not read store reviews.' },
    { status: 500, headers: { 'Cache-Control': 'no-store' } }
  );
}

const { data: productReviews, error: productReviewsError } = await admin
  .from('product_reviews')
  .select('*, products(name, slug)')
  .eq('merchant_id', merchant.id)
  .order('created_at', { ascending: false });

if (productReviewsError) {
  console.error('[Dashboard product reviews query]', productReviewsError.message);
  return NextResponse.json(
    {
      error: 'Store reviews loaded, but product reviews could not be read.',
      section: 'product_reviews',
      storeReviews: storeReviews || [],
      storeSlug: merchant.store_slug || '',
    },
    { status: 200, headers: { 'Cache-Control': 'no-store' } }
  );
}

return NextResponse.json(
  {
    storeSlug: merchant.store_slug || '',
    storeReviews: storeReviews || [],
    productReviews: productReviews || [],
  },
  { headers: { 'Cache-Control': 'no-store' } }
);

} catch (error) {
console.error('[Dashboard reviews API unexpected error]', error);
return NextResponse.json(
{ error: 'An unexpected error occurred while loading reviews.' },
{ status: 500, headers: { 'Cache-Control': 'no-store' } }
);
}
}