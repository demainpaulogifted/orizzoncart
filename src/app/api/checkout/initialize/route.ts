
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { generateOrderNumber } from '@/lib/utils';
import { ensureOrizzonPay } from '@/lib/paystack-engine';
import { getMarketplaceCountryCode } from '@/lib/geo/marketplace-country';
import { decryptMerchantSecret } from '@/lib/payments/merchant-credentials';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      store_slug,
      items,
      customer,
      shipping_mode,
      shipping_cost,
    } = body;

    const supabase = createAdminClient();

    const { data: merchant, error: merchantError } = await supabase
      .from('merchants')
      .select(`
        id,
        store_name,
        store_slug,
        country_code,
        currency_code,
        is_active,
        is_verified,
        is_on_marketplace,
        payment_receiving_status,
        cart_status,
        checkout_status,
        maintenance_expires_at,
        bank_name,
        account_number,
        paystack_subaccount_code,
        split_code_platform,
        payout_method
      `)
      .eq('store_slug', store_slug)
      .single();

    if (merchantError || !merchant) {
      return NextResponse.json(
        { error: 'Store not found.' },
        { status: 404 }
      );
    }

    const marketplaceCountry = await getMarketplaceCountryCode();
    const merchantCountry = String(
      merchant.country_code || 'NG'
    ).toUpperCase();
    const currencyCode = String(
      merchant.currency_code || 'NGN'
    ).toUpperCase();

    if (merchantCountry !== marketplaceCountry) {
      return NextResponse.json(
        {
          error:
            'This store does not belong to your selected country marketplace.',
        },
        { status: 403 }
      );
    }

    if (merchantCountry !== 'NG' || currencyCode !== 'NGN') {
      return NextResponse.json(
        {
          error:
            'Online payment is not yet enabled for this country and currency. Please contact the seller for an available payment option.',
        },
        { status: 400 }
      );
    }

    const expired =
      merchant.maintenance_expires_at &&
      new Date(merchant.maintenance_expires_at) < new Date();

    if (
      expired ||
      merchant.is_active !== true ||
      merchant.is_verified !== true ||
      merchant.is_on_marketplace !== true ||
      merchant.payment_receiving_status !== 'ACTIVE' ||
      merchant.cart_status !== 'ENABLED' ||
      merchant.checkout_status !== 'ENABLED'
    ) {
      return NextResponse.json(
        {
          error:
            'This store is in showcase mode and is not accepting orders yet.',
        },
        { status: 403 }
      );
    }

    // Retrieve the merchant's encrypted Paystack credentials.
    const { data: credential, error: credentialError } =
      await supabase
        .from('merchant_payment_credentials')
        .select(
          'client_id, environment, secret_ciphertext, secret_iv, secret_auth_tag'
        )
        .eq('merchant_id', merchant.id)
        .eq('provider', 'paystack')
        .maybeSingle();

    if (credentialError) throw credentialError;

    const hasOwnPaystack = Boolean(credential);

    const hasBank = Boolean(
      merchant.bank_name && merchant.account_number
    );

    const platformKey =
      process.env.ORIZZONCART_PAY_SECRET_KEY ||
      process.env.PLATFORM_PAYSTACK_SECRET_KEY;

    const method =
      merchant.payout_method ||
      (hasOwnPaystack
        ? 'own_keys'
        : hasBank
          ? 'orizzonpay'
          : null);

    let secretKey: string | null = null;
    let splitCode: string | null = null;

    if (method === 'own_keys') {
      if (!credential) {
        return NextResponse.json(
          {
            error:
              'Your Paystack account is not configured. Please reconnect your Paystack credentials in Payment Settings.',
          },
          { status: 400 }
        );
      }

      if (
        credential.environment !== 'live' &&
        credential.environment !== 'sandbox'
      ) {
        return NextResponse.json(
          { error: 'Invalid Paystack credential environment.' },
          { status: 400 }
        );
      }

      secretKey = decryptMerchantSecret({
        secret_ciphertext: credential.secret_ciphertext,
        secret_iv: credential.secret_iv,
        secret_auth_tag: credential.secret_auth_tag,
      });

      splitCode = null;
    } else if (hasBank && platformKey) {
      const enriched = await ensureOrizzonPay(merchant);
      secretKey = platformKey;
      splitCode = enriched.split_code_platform || null;
    } else {
      return NextResponse.json(
        {
          error:
            'No supported payment method is configured for this store.',
        },
        { status: 400 }
      );
    }

    if (!secretKey) {
      return NextResponse.json(
        { error: 'Payment gateway not configured.' },
        { status: 500 }
      );
    }

    const productIds = (items || [])
      .map((item: any) => item.product_id)
      .filter(Boolean);

    if (!productIds.length) {
      return NextResponse.json(
        { error: 'Your cart is empty.' },
        { status: 400 }
      );
    }

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(
        'id, name, price, is_active, is_digital, supplier, supplier_product_id'
      )
      .in('id', productIds)
      .eq('merchant_id', merchant.id);

    if (productsError) throw productsError;

    const validProducts = (products || []).filter(
      (product: any) => product.is_active
    );

    if (!validProducts.length) {
      return NextResponse.json(
        { error: 'No available products in your cart.' },
        { status: 400 }
      );
    }

    let subtotal = 0;
    const orderItems: any[] = [];

    for (const item of items || []) {
      const product = validProducts.find(
        (p: any) => p.id === item.product_id
      );

      if (!product) continue;

      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        return NextResponse.json(
          { error: 'Invalid product quantity.' },
          { status: 400 }
        );
      }

      const price = Number(product.price);

      if (!Number.isFinite(price) || price < 0) {
        return NextResponse.json(
          { error: 'Invalid product price.' },
          { status: 400 }
        );
      }

      subtotal += price * quantity;

      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        quantity,
        unit_price: price,
        total_price: price * quantity,
      });
    }

    if (!orderItems.length || subtotal <= 0) {
      return NextResponse.json(
        { error: 'Your cart contains no valid products.' },
        { status: 400 }
      );
    }

    // SHIPPING CALCULATION
    const isPickup = shipping_mode === 'PICKUP';
    const isNeighbourhood = /neigh/i.test(shipping_mode || '');
    const customerCountry = 'Nigeria';

    let finalShippingCost = Math.max(
      0,
      Number(shipping_cost) || 0
    );

    let supplierShippingCost = 0;

    const hasDropshipItems = validProducts.some(
      (p: any) => p.supplier && p.supplier_product_id
    );

    if (hasDropshipItems && !isPickup && !isNeighbourhood) {
      try {
        const shippingRes = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/dropshipping/shipping-rate`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              merchantId: merchant.id,
              items: orderItems,
              country: customerCountry,
            }),
          }
        );

        const shippingData = await shippingRes.json();

        if (shippingRes.ok) {
          supplierShippingCost =
            Number(shippingData.shipping_cost) || 0;
        }
      } catch (error) {
        console.error(
          'Failed to fetch supplier shipping rate:',
          error
        );
      }
    }

    if (
      !hasDropshipItems &&
      !isPickup &&
      !isNeighbourhood &&
      customer?.state
    ) {
      const { data: zones } = await supabase
        .from('shipping_zones')
        .select('*')
        .eq('merchant_id', merchant.id);

      if (zones && zones.length > 0) {
        const zone =
          (zones as any[]).find((z) =>
            (z.states || []).includes(customer.state)
          ) ||
          (zones as any[]).find((z) => z.is_default) ||
          null;

        if (zone) {
          finalShippingCost =
            zone.free_shipping_threshold &&
            subtotal >= Number(zone.free_shipping_threshold)
              ? 0
              : Number(zone.flat_fee) || 0;
        }
      }
    } else if (isPickup || isNeighbourhood) {
      finalShippingCost = 0;
      supplierShippingCost = 0;
    }

    if (hasDropshipItems && supplierShippingCost > 0) {
      finalShippingCost = supplierShippingCost;
    }

    const totalAmount = subtotal + finalShippingCost;

    const shippingAddress =
      shipping_mode === 'PICKUP' || !customer?.address_line1
        ? {
            address_line1:
              shipping_mode === 'PICKUP'
                ? 'Store pickup'
                : 'Digital delivery — no shipping required',
            city: customer?.city || 'N/A',
            state: customer?.state || 'N/A',
            country: customerCountry,
          }
        : {
            address_line1: customer.address_line1,
            city: customer.city,
            state: customer.state,
            country: customerCountry,
          };

    // CREATE ORDER
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: generateOrderNumber(),
        merchant_id: merchant.id,
        customer_name: customer?.name || 'Customer',
        customer_email: customer?.email || '',
        customer_phone: customer?.phone || '',
        subtotal,
        shipping_cost: finalShippingCost,
        supplier_shipping_cost: supplierShippingCost,
        shipping_country: customerCountry,
        total_amount: totalAmount,
        currency: currencyCode,
        status: 'pending',
        payment_status: 'pending',
        shipping_address: shippingAddress,
        tracking_number: `TRK-${Math.random()
          .toString(36)
          .substring(2, 8)
          .toUpperCase()}`,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(
        orderItems.map((item: any) => ({
          ...item,
          order_id: order.id,
        }))
      );

    if (itemsError) throw itemsError;

    if (hasDropshipItems) {
      await supabase
        .from('orders')
        .update({
          has_dropship_products: true,
          supplier_fulfillment_status: 'pending',
        })
        .eq('id', order.id);
    }

    const reference = `ORD-${order.id.substring(0, 8)}-${Date.now()}`;

    await supabase
      .from('orders')
      .update({ payment_intent_id: reference })
      .eq('id', order.id);

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      'https://marketplace.orizzoncart.com.ng';

    const buildBody = (split: string | null) => {
      const paymentBody: any = {
        email: customer?.email || 'customer@orizzoncart.com.ng',
        amount: Math.round(totalAmount * 100),
        currency: currencyCode,
        reference,
        callback_url:
          `${appUrl}/checkout/success?order=${encodeURIComponent(order.id)}` +
          `&reference=${encodeURIComponent(reference)}`,
        metadata: {
          order_id: order.id,
          merchant_id: merchant.id,
          type: 'customer_order',
        },
      };

      if (split) paymentBody.split_code = split;

      return paymentBody;
    };

    let paystackRes = await fetch(
      'https://api.paystack.co/transaction/initialize',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildBody(splitCode)),
        cache: 'no-store',
      }
    );

    let paystackData = await paystackRes.json();

    if (
      !paystackData.status &&
      splitCode &&
      /split/i.test(paystackData.message || '')
    ) {
      await supabase
        .from('merchants')
        .update({
          paystack_subaccount_code: null,
          split_code_platform: null,
        })
        .eq('id', merchant.id);

      const fresh = await ensureOrizzonPay({
        ...merchant,
        paystack_subaccount_code: null,
        split_code_platform: null,
      });

      splitCode = fresh.split_code_platform || null;

      paystackRes = await fetch(
        'https://api.paystack.co/transaction/initialize',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${secretKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(buildBody(splitCode)),
          cache: 'no-store',
        }
      );

      paystackData = await paystackRes.json();
    }

    if (!paystackRes.ok || !paystackData.status) {
      console.error('Paystack initialization failed:', paystackData);

      await supabase
        .from('orders')
        .update({
          payment_status: 'failed',
          status: 'cancelled',
        })
        .eq('id', order.id);

      throw new Error(
        paystackData.message || 'Paystack payment initialization failed.'
      );
    }

    return NextResponse.json({
      authorization_url: paystackData.data.authorization_url,
      order_id: order.id,
      reference,
    });
  } catch (error: any) {
    console.error('Checkout error:', error);

    return NextResponse.json(
      { error: error.message || 'Checkout failed.' },
      { status: 500 }
    );
  }
}
