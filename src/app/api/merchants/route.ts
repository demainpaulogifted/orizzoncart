import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MerchantService } from '@/lib/services/merchant.service';
import { cookies } from 'next/headers';
import { attributeStoreRegistration, INVITE_COOKIE } from '@/lib/invite';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const isAvailable = await MerchantService.validateStoreSlug(body.store_slug);
    if (!isAvailable) return NextResponse.json({ error: 'Store URL is already taken' }, { status: 409 });

    const merchant = await MerchantService.create({
      user_id: user.id,
      business_name: body.business_name,
      store_name: body.store_name,
      store_slug: body.store_slug,
      merchant_type: body.merchant_type || 'physical',
    });

    try {
      const jar = await cookies();
      const ref = body.referral_code || jar.get(INVITE_COOKIE)?.value || null;
      await attributeStoreRegistration(merchant.id, ref);
    } catch (e) {
      console.error('Invite attribution failed', e);
    }

    return NextResponse.json({ success: true, merchant }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create store' }, { status: 500 });
  }
}