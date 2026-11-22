
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const COUNTRY_CODES = ['NG', 'ZA', 'EG', 'KE', 'MA', 'US', 'GB', 'CA', 'MX', 'HT'];

function minorUnits(amount: number, currency: string) {
  const zeroDecimal = ['JPY', 'KRW', 'XAF', 'XOF', 'CLP', 'VND'];
  return Math.round(amount * (zeroDecimal.includes(currency) ? 1 : 100));
}

function createReference() {
  return `ORZ-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://marketplace.orizzoncart.com.ng'
  ).replace(/\/+$/, '');
}

async function getMerchant(admin: any, userId: string) {
  const cookieStore = await cookies();
  const activeId = cookieStore.get('active_merchant_id')?.value;

  const { data: merchants, error } = await admin
    .from('merchants')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;

  return (
    (merchants || []).find((merchant: any) => merchant.id === activeId) ||
    (merchants || [])[0] ||
    null
  );
}

async function getActivationFee(admin: any, merchant: any) {
  const country = String(merchant.country_code || '').toUpperCase();
  const countryCode = COUNTRY_CODES.includes(country) ? country : 'OTHER';

  const { data, error } = await admin
    .from('platform_activation_fees')
    .select(
      'country_code, country_name, currency_code, gateway, amount, is_enabled'
    )
    .eq('country_code', countryCode)
    .maybeSingle();

  if (error) throw error;

  if (
    !data ||
    !data.is_enabled ||
    data.amount === null ||
    !Number.isFinite(Number(data.amount)) ||
    Number(data.amount) <= 0
  ) {
    throw new Error(
      'Store activation is not available for your registered country yet. Please contact support.'
    );
  }

  return {
    country_code: data.country_code,
    country_name: data.country_name,
    currency: String(data.currency_code).toUpperCase(),
    gateway: String(data.gateway).toLowerCase(),
    amount: Number(data.amount),
  };
}

async function getPaystackSecret(admin: any) {
  const { data: keys, error } = await admin
    .from('platform_payment_keys')
    .select('secret_key')
    .eq('gateway', 'paystack')
    .maybeSingle();

  if (error) throw error;

  return keys?.secret_key || process.env.PLATFORM_PAYSTACK_SECRET_KEY || null;
}

async function getPayPalAccessToken() {
  const clientId = process.env.PLATFORM_PAYPAL_CLIENT_ID;
  const secret = process.env.PLATFORM_PAYPAL_SECRET;
  const baseUrl =
    process.env.PLATFORM_PAYPAL_BASE_URL ||
    'https://api-m.sandbox.paypal.com';

  if (!clientId || !secret) {
    throw new Error(
      'PayPal is not configured yet. Please contact support.'
    );
  }

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${clientId}:${secret}`
      ).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });

  const data = await response.json();

  if (!response.ok || !data.access_token) {
    console.error('PayPal authentication error:', data);
    throw new Error('Could not connect to PayPal.');
  }

  return { accessToken: data.access_token, baseUrl };
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const admin = createAdminClient();
    const merchant = await getMerchant(admin, user.id);

    if (!merchant) {
      return NextResponse.json(
        { error: 'Merchant not found' },
        { status: 404 }
      );
    }

    const fee = await getActivationFee(admin, merchant);

    return NextResponse.json({
      ...fee,
      final_amount: fee.amount,
      activation_fee: fee.amount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Could not load activation fee.' },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));

    const type =
      body.type === 'theme_purchase'
        ? 'theme_purchase'
        : body.type === 'maintenance_payment'
          ? 'maintenance_payment'
          : 'payment_activation';

    const admin = createAdminClient();
    const merchant = await getMerchant(admin, user.id);

    if (!merchant) {
      return NextResponse.json(
        { error: 'Merchant not found' },
        { status: 404 }
      );
    }

    let amount = 0;
    let currency = 'NGN';
    let gateway = 'paystack';

    const metadata: Record<string, any> = {
      merchant_id: merchant.id,
      transaction_type: type,
    };

    if (type === 'payment_activation') {
      if (
        merchant.payment_receiving_status === 'ACTIVE' ||
        merchant.payment_receiving_status === 'PENDING_KEYS' ||
        merchant.payment_activated_at
      ) {
        return NextResponse.json(
          { error: 'Store activation has already been paid.' },
          { status: 400 }
        );
      }

      const fee = await getActivationFee(admin, merchant);

      amount = fee.amount;
      currency = fee.currency;
      gateway = fee.gateway;

      Object.assign(metadata, {
        activation_country: fee.country_code,
        activation_country_name: fee.country_name,
        activation_currency: currency,
        activation_gateway: gateway,
      });
    } else if (type === 'theme_purchase') {
      const { data: theme, error } = await admin
        .from('platform_theme_prices')
        .select('price')
        .eq('theme_name', body.theme_name)
        .single();

      if (error || !theme) {
        return NextResponse.json(
          { error: 'Theme price not found.' },
          { status: 404 }
        );
      }

      amount = Number(theme.price);
      metadata.theme_name = body.theme_name;
    } else {
      const { data: plan, error } = await admin
        .from('maintenance_plans')
        .select('*')
        .eq('frequency', body.plan)
        .eq('is_active', true)
        .single();

      if (error || !plan) {
        return NextResponse.json(
          { error: 'Maintenance plan not available.' },
          { status: 404 }
        );
      }

      amount =
        Number(plan.base_price) *
        (1 - Number(plan.discount_percent || 0) / 100);

      metadata.frequency = plan.frequency;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid payment amount.' },
        { status: 400 }
      );
    }

    const reference = createReference();
    const appUrl = getAppUrl();

    // PayPal activation payment.
    if (gateway === 'paypal' && type === 'payment_activation') {
      if (currency !== 'USD') {
        return NextResponse.json(
          { error: 'PayPal activation fees must be configured in USD.' },
          { status: 400 }
        );
      }

      const { accessToken, baseUrl } = await getPayPalAccessToken();

      const returnUrl = new URL(
        '/api/payments/platform/paypal',
        appUrl
      );
      returnUrl.searchParams.set('reference', reference);

      const cancelUrl = new URL(
        '/dashboard/settings/payment',
        appUrl
      );
      cancelUrl.searchParams.set('payment', 'cancelled');

      const orderResponse = await fetch(
        `${baseUrl}/v2/checkout/orders`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: [
              {
                reference_id: merchant.id,
                custom_id: merchant.id,
                description: `OrizzonCart storefront activation - ${metadata.activation_country}`,
                amount: {
                  currency_code: currency,
                  value: amount.toFixed(2),
                },
              },
            ],
            application_context: {
              return_url: returnUrl.toString(),
              cancel_url: cancelUrl.toString(),
              user_action: 'PAY_NOW',
            },
          }),
          cache: 'no-store',
        }
      );

      const orderData = await orderResponse.json();

      if (!orderResponse.ok || !orderData.id) {
        console.error('PayPal order creation error:', orderData);
        throw new Error(
          'PayPal could not create the payment. Please try again.'
        );
      }

      const approvalUrl = orderData.links?.find(
        (link: any) => link.rel === 'approve'
      )?.href;

      if (!approvalUrl) {
        throw new Error('PayPal approval link was not returned.');
      }

      const { error: txError } = await admin
        .from('platform_transactions')
        .insert({
          merchant_id: merchant.id,
          transaction_type: type,
          amount,
          currency,
          status: 'pending',
          payment_reference: reference,
          metadata: {
            ...metadata,
            paypal_order_id: orderData.id,
          },
        });

      if (txError) {
        console.error('PayPal transaction insert error:', txError);
        throw new Error(
          'Could not save the PayPal transaction. Please try again.'
        );
      }

      return NextResponse.json({
        approval_url: approvalUrl,
        reference,
        gateway: 'paypal',
        paypal_order_id: orderData.id,
      });
    }

    if (gateway !== 'paystack') {
      return NextResponse.json(
        { error: 'Unsupported payment gateway.' },
        { status: 400 }
      );
    }

    const secret = await getPaystackSecret(admin);

    if (!secret) {
      return NextResponse.json(
        { error: 'Platform Paystack keys are not configured.' },
        { status: 503 }
      );
    }

    const { data: tx, error: txError } = await admin
      .from('platform_transactions')
      .insert({
        merchant_id: merchant.id,
        transaction_type: type,
        amount,
        currency,
        status: 'pending',
        payment_reference: reference,
        metadata,
      })
      .select()
      .single();

    if (txError) throw txError;

    const paystackResponse = await fetch(
      'https://api.paystack.co/transaction/initialize',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${secret}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          amount: minorUnits(amount, currency),
          currency,
          reference,
          callback_url: `${appUrl}/payment/verify?reference=${encodeURIComponent(reference)}`,
          metadata: {
            ...metadata,
            transaction_id: tx.id,
          },
        }),
        cache: 'no-store',
      }
    );

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok || !paystackData.status) {
      await admin
        .from('platform_transactions')
        .update({ status: 'failed' })
        .eq('id', tx.id);

      throw new Error(
        paystackData.message || 'Paystack initialization failed.'
      );
    }

    return NextResponse.json({
      authorization_url: paystackData.data.authorization_url,
      reference,
      gateway: 'paystack',
    });
  } catch (error: any) {
    console.error('Platform payment initialization error:', error);

    return NextResponse.json(
      { error: error.message || 'Could not initialize payment.' },
      { status: 400 }
    );
  }
}
