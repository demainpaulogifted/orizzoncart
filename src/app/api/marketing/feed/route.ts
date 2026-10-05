import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const merchantId = searchParams.get('merchant_id');

  if (!merchantId) {
    return NextResponse.json({ error: 'merchant_id is required' }, { status: 400 });
  }

  const supabase = createAdminClient();
  
  // 1. Get the merchant's store slug so we can build correct links
  const { data: merchant } = await supabase
    .from('merchants')
    .select('store_slug')
    .eq('id', merchantId)
    .single();

  const storeSlug = merchant?.store_slug || 'store';
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://orizzoncart.com';

  // 2. Fetch active products exactly how your database stores them
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('merchant_id', merchantId)
    .eq('is_active', true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 3. Format them for Google, Meta, and TikTok
  const feed = (products || []).map((p: any) => {
    // Get the first image from your images array
    const imageUrl = p.images && p.images.length > 0 ? p.images[0].url : '';
    
    // Build the exact product link for your storefront
    const productLink = `${baseUrl}/store/${storeSlug}/p/${p.slug}`; 

    return {
      id: p.id,
      title: p.name, // Using 'name' from your database
      description: p.description || '',
      link: productLink,
      image_link: imageUrl, 
      price: `${p.price} NGN`, // Change to USD if you prefer
      availability: p.inventory_quantity > 0 ? 'in stock' : 'out of stock',
      condition: 'new'
    };
  });

  return NextResponse.json({
    success: true,
    count: feed.length,
    platform_ready_products: feed
  });
}