import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { generateOrderNumber } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { store_slug, items, customer } = body; 
    // items = [{ product_id: 'uuid', quantity: 1 }]
    // customer = { name, email, phone, address_line1, city, state }

    const supabase = createAdminClient();

    // 1. Fetch Merchant & Enforce Rules
    const { data: merchant, error: merchantError } = await supabase
      .from('merchants')
      .select('id, store_name, payment_receiving_status, cart_status, checkout_status, preferred_gateway, paystack_secret_key, flutterwave_secret_key')
      .eq('store_slug', store_slug)
      .single();

    if (merchantError || !merchant) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // ENFORCEMENT: Block checkout if not active or held
    if (merchant.payment_receiving_status !== 'ACTIVE' || merchant.checkout_status !== 'ENABLED') {
      return NextResponse.json({ error: 'This store is currently not accepting orders.' }, { status: 403 });
    }

    // 2. Fetch REAL product prices from DB (Prevent frontend price manipulation)
    const productIds = items.map((i: any) => i.product_id);
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, is_active, is_digital')
      .in('id', productIds)
      .eq('merchant_id', merchant.id);

    if (productsError || !products || products.length === 0) {
      return NextResponse.json({ error: 'Invalid products in cart' }, { status: 400 });
    }

    // 3. Calculate Totals Server-Side
    let subtotal = 0;
    let isDigitalOnly = true;
    const orderItems = items.map((item: any) => {
      const product = products.find((p: any) => p.id === item.product_id);
      if (!product || !product.is_active) throw new Error(`Product ${item.product_id} is invalid or inactive`);
      if (!product.is_digital) isDigitalOnly = false;
      
      const total_price = product.price * item.quantity;
      subtotal += total_price;
      
      return {
        product_id: product.id,
        product_name: product.name,
        quantity: item.quantity,
        unit_price: product.price,
        total_price: total_price,
      };
    });

    const shippingCost = isDigitalOnly ? 0 : 2500; // Example: Flat rate shipping
    const totalAmount = subtotal + shippingCost;

    // 4. Create Pending Order in Database
    const orderNumber = generateOrderNumber();
    const trackingNumber = `TRK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    const { data: order, error: orderError } = await supabase.from('orders').insert({
      order_number: orderNumber,
      merchant_id: merchant.id,
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone,
      subtotal,
      shipping_cost: shippingCost,
      total_amount: totalAmount,
      currency: 'NGN',
      status: 'pending',
      payment_status: 'pending',
      shipping_address: isDigitalOnly ? null : {
        address_line1: customer.address_line1,
        city: customer.city,
        state: customer.state,
      },
      tracking_number: trackingNumber,
      metadata: { is_digital_only: isDigitalOnly }
    }).select().single();

    if (orderError) throw orderError;

    // Insert order items
    const itemsWithOrderId = orderItems.map((item: any) => ({ ...item, order_id: order.id }));
    await supabase.from('order_items').insert(itemsWithOrderId);

    // 5. Initialize Payment with Merchant's Gateway
    const reference = `ORD-${order.id.substring(0, 8)}-${Date.now()}`;
    const secretKey = merchant.preferred_gateway === 'paystack' 
      ? merchant.paystack_secret_key 
      : merchant.flutterwave_secret_key;

    if (!secretKey) {
      return NextResponse.json({ error: 'Merchant payment gateway not configured' }, { status: 500 });
    }

    let authorization_url = '';

    if (merchant.preferred_gateway === 'paystack') {
      const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: customer.email,
          amount: totalAmount * 100, // Kobo
          reference: reference,
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?order=${order.id}`,
          metadata: { order_id: order.id, merchant_id: merchant.id, type: 'customer_order' }
        }),
      });
      const paystackData = await paystackRes.json();
      if (!paystackData.status) throw new Error(paystackData.message);
      authorization_url = paystackData.data.authorization_url;
    } 
    // TODO: Add Flutterwave initialization logic here similarly

    return NextResponse.json({ authorization_url, order_id: order.id, tracking_number: trackingNumber });

  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message || 'Checkout failed' }, { status: 500 });
  }
}