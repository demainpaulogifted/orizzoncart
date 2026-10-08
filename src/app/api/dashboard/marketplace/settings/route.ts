import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { getActiveMerchant } from '@/lib/active-merchant';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

  const merchant = await getActiveMerchant(user.id);
  if (!merchant) return NextResponse.json({ error: 'No store found' }, { status: 404 });

  return NextResponse.json({
    is_on_marketplace: merchant.is_on_marketplace || false,
    payment_mode: merchant.payment_mode || 'platform',
    platform_subaccount_code: merchant.platform_subaccount_code || '',
    // Send these back so the frontend can show helpful warnings if they aren't ready
    payment_receiving_status: merchant.payment_receiving_status,
    is_verified: merchant.is_verified,
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { is_on_marketplace, platform_subaccount_code } = body;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

  const merchant = await getActiveMerchant(user.id);
  if (!merchant) return NextResponse.json({ error: 'No store found' }, { status: 404 });

  // 🔒 STRICT VALIDATION: Cannot list on marketplace unless fully ready
  if (is_on_marketplace) {
    if (merchant.payment_receiving_status !== 'ACTIVE') {
      return NextResponse.json({ 
        error: 'You must complete payment activation before listing on the marketplace.' 
      }, { status: 400 });
    }
    if (!merchant.is_verified) {
      return NextResponse.json({ 
        error: 'Your store must be verified before listing on the marketplace.' 
      }, { status: 400 });
    }
    if (merchant.payment_mode === 'own_keys' && !platform_subaccount_code?.trim()) {
      return NextResponse.json({ error: 'Subaccount code required for own payment keys' }, { status: 400 });
    }
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from('merchants')
    .update({
      is_on_marketplace: is_on_marketplace || false,
      platform_subaccount_code: platform_subaccount_code?.trim() || null,
    })
    .eq('id', merchant.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  return NextResponse.json({ success: true });
}