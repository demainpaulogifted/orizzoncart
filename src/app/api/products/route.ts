import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ProductService } from '@/lib/services/product.service';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: merchant } = await supabase.from('merchants').select('id').eq('user_id', user.id).single();
    if (!merchant) return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });

    const body = await request.json();
    const product = await ProductService.create({
      merchant_id: merchant.id,
      name: body.name,
      price: body.price,
      description: body.description,
      category: body.category,
      images: body.images || [],
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}