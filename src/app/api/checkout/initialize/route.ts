import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { generateOrderNumber } from '@/lib/utils';
import { ensureOrizzonPay } from '@/lib/paystack-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { store_slug, items, customer, shipping_mode, shipping_cost } = body;
    const supabase = createAdminClient();

    const { data: merchant } = await supabase
      .from('merchants')
      .select('id, store_name, store_slug, payment_receiving_status, cart_status, checkout_status, preferred_gateway, paystack_secret_key, flutterwave_secret_key, maintenance_expires_at, shipping_mode, shipping_flat_fee, bank_name, account_number, paystack_subaccount_code, split_code_platform')
      .eq('store_slug', store_slug)
      .single();

    if (!merchant) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

    const expired = merchant.maintenance_expires_at && new Date(merchant.maintenance_expires_at) < new Date();
    if (expired || merchant.payment_receiving_status !== 'ACTIVE' || merchant.checkout_status !== 'ENABLED') {
      return NextResponse.json({ error: 'This store is currently not accepting orders.' }, { status: 403 });
    }

    const productIds = items.map((i: any) => i.product_id);
    const { data: products } = await supabase
      .from('products')
      .select('id, name, price, is_active, is_digital')
      .in('id', productIds)
      .eq('merchant_id', merchant.id);

    if (!products || products.length === 0) return NextResponse.json({ error: 'Invalid products in cart' }, { status: 400 });

    let subtotal = 0;
    const orderItems = items.map((item: any) => {
      const product = products.find((p: any) => p.id === item.product_id);
      if (!product || !product.is_active) throw new Error('Product unavailable');
      subtotal += product.price * item.quantity;
      return {
        product_id: product.id,
        product_name: product.name,
        quantity: item.quantity,
        unit_price: product.price,
        total_price: product.price * item.quantity,
      };
    });

    const finalShippingCost = Math.max(0, Number(shipping_cost) || 0);
    const totalAmount = subtotal + finalShippingCost;

    const shippingAddress =
      shipping_mode === 'PICKUP' || !customer.address_line1
        ? {
            address_line1: shipping_mode === 'PICKUP' ? 'Store pickup' : 'Digital delivery — no shipping required',
            city: customer.city || 'N/A',
            state: customer.state || 'N/A',
          }
        : { address_line1: customer.address_line1, city: customer.city, state: customer.state };

    const { data: order, error: orderError } = await supabase.from('orders').insert({
      order_number: generateOrderNumber(),
      merchant_id: merchant.id,
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone,
      subtotal,
      shipping_cost: finalShippingCost,
      total_amount: totalAmount,
      currency: 'NGN',
      status: 'pending',
      payment_status: 'pending',
      shipping_address: shippingAddress,
      tracking_number: `TRK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    }).select().single();

    if (orderError) throw orderError;

    await supabase.from('order_items').insert(orderItems.map((i: any) => ({ ...i, order_id: order.id })));

    const reference = `ORD-${order.id.substring(0, 8)}-${Date.now()}`;
    await supabase.from('orders').update({ payment_intent_id: reference }).eq('id', order.id);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://orizzoncart.name.ng';

    let secretKey: string | null = null;
    let splitCode: string | null = null;

    // PRIORITY 1: Merchant's own keys → they keep 100%
    if (merchant.paystack_secret_key || merchant.flutterwave_secret_key) {
      secretKey = merchant.preferred_gateway === 'flutterwave' && merchant.flutterwave_secret_key
        ? merchant.flutterwave_secret_key
        : merchant.paystack_secret_key || merchant.flutterwave_secret_key;
      splitCode = null;
    }
    // PRIORITY 2: OrizzonCart Pay (bank account) → 5% platform split
    else {
      const orizzonKey = process.env.ORIZZONCART_PAY_SECRET_KEY || process.env.PLATFORM_PAYSTACK_SECRET_KEY;
      if (orizzonKey && merchant.bank_name && merchant.account_number) {
        const enriched = await ensureOrizzonPay(merchant);
        if (enriched.split_code_platform) {
          secretKey = orizzonKey;
          splitCode = enriched.split_code_platform;
        }
      }
    }

    if (!secretKey) return NextResponse.json({ error: 'Payment gateway not configured.' }, { status: 500 });

    const paystackBody: any = {
      email: customer.email,
      amount: totalAmount * 100,
      reference,
      callback_url: `${appUrl}/payment/verify?reference=${reference}`,
      metadata: { order_id: order.id, merchant_id: merchant.id, type: 'customer_order' },
    };

    if (splitCode) paystackBody.split_code = splitCode;

    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: { Authorization: `Bearer ${secretKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(paystackBody),
    });
    const paystackData = await paystackRes.json();
    if (!paystackData.status) throw new Error(paystackData.message);

    return NextResponse.json({
      authorization_url: paystackData.data.authorization_url,
      order_id: order.id,
      reference,
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message || 'Checkout failed' }, { status: 500 });
  }
}