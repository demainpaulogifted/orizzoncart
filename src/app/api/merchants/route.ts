import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MerchantService } from '@/lib/services/merchant.service';

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

    return NextResponse.json({ success: true, merchant }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create store' }, { status: 500 });
  }
}