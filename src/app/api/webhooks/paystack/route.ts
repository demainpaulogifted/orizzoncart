
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { decryptMerchantSecret } from '@/lib/payments/merchant-credentials';
import { sendOrderAlert } from '@/lib/notify';
import { attributeStoreActivation } from '@/lib/invite';

const DAYS: Record<string, number> = {
  monthly: 30,
  quarterly: 90,
  yearly: 365,
};

function minorUnits(amount: number, currency: string) {
  const zeroDecimal = ['JPY', 'KRW', 'XAF', 'XOF', 'CLP', 'VND'];

  return Math.round(
    amount * (zeroDecimal.includes(currency) ? 1 : 100)
  );
}

function validSignature(
  body: string,
  signature: string | null,
  secret: string | null
) {
  if (!signature || !secret || !/^[a-fA-F0-9]{128}$/.test(signature)) {
    return false;
  }

  const expected = crypto
    .createHmac('sha512', secret)
    .update(body)
    .digest('hex');

  const expectedBuffer = Buffer.from(expected, 'hex');
  const receivedBuffer = Buffer.from(signature, 'hex');

  return (
    expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

async function getPlatformSecrets(admin: any) {
  const { data: keys, error } = await admin
    .from('platform_payment_keys')
    .select('secret_key')
    .eq('gateway', 'paystack')
    .maybeSingle();

  if (error) throw error;

  return [
    keys?.secret_key,
    process.env.ORIZZONCART_PAY_SECRET_KEY,
    process.env.PLATFORM_PAYSTACK_SECRET_KEY,
  ].filter(Boolean) as string[];
}

async function verifyMerchantOrderSignature(
  admin: any,
  order: any,
  body: string,
  signature: string | null,
  platformSecrets: string[]
) {
  const { data: merchant, error: merchantError } = await admin
    .from('merchants')
    .select(
      'id, payout_method, bank_name, account_number'
    )
    .eq('id', order.merchant_id)
    .maybeSingle();

  if (merchantError || !merchant) {
    return false;
  }

  const { data: credential, error: credentialError } = await admin
    .from('merchant_payment_credentials')
    .select(
      'secret_ciphertext, secret_iv, secret_auth_tag'
    )
    .eq('merchant_id', merchant.id)
    .eq('provider', 'paystack')
    .maybeSingle();

  if (credentialError) throw credentialError;

  const hasBank = Boolean(
    merchant.bank_name && merchant.account_number
  );

  const method =
    merchant.payout_method ||
    (credential ? 'own_keys' : hasBank ? 'orizzonpay' : null);

  if (method === 'own_keys') {
    if (!credential) return false;

    const secret = decryptMerchantSecret({
      secret_ciphertext: credential.secret_ciphertext,
      secret_iv: credential.secret_iv,
      secret_auth_tag: credential.secret_auth_tag,
    });

    return validSignature(body, signature, secret);
  }

  if (method === 'orizzonpay' && hasBank) {
    return platformSecrets.some((secret) =>
      validSignature(body, signature, secret)
    );
  }

  return false;
}

async function completeMerchantActivation(admin: any, tx: any) {
  try {
    await attributeStoreActivation(tx.merchant_id);
  } catch (error) {
    console.error('Invite activation attribution failed:', error);
  }

  const { data: merchant, error: merchantError } = await admin
    .from('merchants')
    .select(
      'paystack_secret_key, bank_name, account_number, payment_activated_at'
    )
    .eq('id', tx.merchant_id)
    .single();

  if (merchantError) throw merchantError;

  const { data: credentials, error: credentialsError } = await admin
    .from('merchant_payment_credentials')
    .select('id')
    .eq('merchant_id', tx.merchant_id)
    .eq('provider', 'paystack')
    .maybeSingle();

  if (credentialsError) throw credentialsError;

  const hasPaymentMethod = Boolean(
    credentials ||
    merchant?.paystack_secret_key ||
    (merchant?.bank_name && merchant?.account_number)
  );

  const activationTimestamp =
    merchant.payment_activated_at || new Date().toISOString();

  const { error } = await admin
    .from('merchants')
    .update(
      hasPaymentMethod
        ? {
            payment_receiving_status: 'ACTIVE',
            cart_status: 'ENABLED',
            checkout_status: 'ENABLED',
            payment_activated_at: activationTimestamp,
          }
        : {
            payment_receiving_status: 'PENDING_KEYS',
            cart_status: 'LOCKED',
            checkout_status: 'DISABLED',
            payment_activated_at: activationTimestamp,
          }
    )
    .eq('id', tx.merchant_id);

  if (error) throw error;
}

export async function GET(request: NextRequest) {
  const reference =
    request.nextUrl.searchParams.get('reference') ||
    request.nextUrl.searchParams.get('trxref');

  const url = new URL('/payment/verify', request.url);

  if (reference) {
    url.searchParams.set('reference', reference);
  }

  return NextResponse.redirect(url);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature');
    const admin = createAdminClient();

    let event: any;

    try {
      event = JSON.parse(body);
    } catch {
      return NextResponse.json(
        { error: 'Invalid webhook payload.' },
        { status: 400 }
      );
    }

    if (event.event !== 'charge.success') {
      return NextResponse.json(
        { message: 'Ignored' },
        { status: 200 }
      );
    }

    const { reference, amount, currency } = event.data || {};

    if (!reference || !Number.isFinite(Number(amount))) {
      return NextResponse.json(
        { error: 'Invalid payment details.' },
        { status: 400 }
      );
    }

    const platformSecrets = await getPlatformSecrets(admin);

    // First check whether this reference belongs to a platform transaction.
    const { data: tx, error: txError } = await admin
      .from('platform_transactions')
      .select('*')
      .eq('payment_reference', reference)
      .maybeSingle();

    if (txError) throw txError;

    if (tx) {
      const platformVerified = platformSecrets.some((secret) =>
        validSignature(body, signature, secret)
      );

      if (!platformVerified) {
        return NextResponse.json(
          { error: 'Invalid platform payment signature.' },
          { status: 401 }
        );
      }

      if (!['pending', 'paid'].includes(tx.status)) {
        return NextResponse.json(
          { error: 'Transaction is not payable.' },
          { status: 409 }
        );
      }

      const expectedCurrency = String(
        tx.currency || 'NGN'
      ).toUpperCase();

      const receivedCurrency = String(
        currency || ''
      ).toUpperCase();

      const expectedAmount = minorUnits(
        Number(tx.amount),
        expectedCurrency
      );

      const receivedAmount = Number(amount);

      if (
        !Number.isFinite(expectedAmount) ||
        receivedAmount !== expectedAmount ||
        receivedCurrency !== expectedCurrency
      ) {
        console.error('Platform payment webhook mismatch:', {
          reference,
          expectedAmount,
          receivedAmount,
          expectedCurrency,
          receivedCurrency,
        });

        if (tx.status === 'pending') {
          await admin
            .from('platform_transactions')
            .update({ status: 'failed' })
            .eq('id', tx.id)
            .eq('status', 'pending');
        }

        return NextResponse.json(
          { error: 'Payment amount or currency mismatch.' },
          { status: 400 }
        );
      }

      if (tx.status === 'pending') {
        const { error: updateError } = await admin
          .from('platform_transactions')
          .update({ status: 'paid' })
          .eq('id', tx.id)
          .eq('status', 'pending');

        if (updateError) throw updateError;
      }

      if (tx.transaction_type === 'payment_activation') {
        await completeMerchantActivation(admin, tx);
      }

      if (
        tx.transaction_type === 'theme_purchase' &&
        tx.metadata?.theme_name
      ) {
        const { error } = await admin
          .from('merchants')
          .update({ theme_id: tx.metadata.theme_name })
          .eq('id', tx.merchant_id);

        if (error) throw error;
      }

      if (
        tx.status === 'pending' &&
        tx.transaction_type === 'maintenance_payment' &&
        tx.metadata?.frequency
      ) {
        const frequency = String(tx.metadata.frequency);
        const days = DAYS[frequency] || 30;

        const { error } = await admin
          .from('merchants')
          .update({
            maintenance_plan: frequency,
            maintenance_status: 'active',
            maintenance_expires_at: new Date(
              Date.now() + days * 24 * 60 * 60 * 1000
            ).toISOString(),
            payment_receiving_status: 'ACTIVE',
            cart_status: 'ENABLED',
            checkout_status: 'ENABLED',
          })
          .eq('id', tx.merchant_id);

        if (error) throw error;
      }

      return NextResponse.json(
        { message: 'Processed' },
        { status: 200 }
      );
    }

    // Customer order: locate the merchant using the payment reference.
    const { data: order, error: orderError } = await admin
      .from('orders')
      .select('*')
      .eq('payment_intent_id', reference)
      .maybeSingle();

    if (orderError) throw orderError;

    if (!order) {
      return NextResponse.json(
        { error: 'Transaction not found.' },
        { status: 404 }
      );
    }

    // Verify using the merchant's encrypted Paystack key,
    // or the platform key for the existing OrizzonPay route.
    const merchantVerified = await verifyMerchantOrderSignature(
      admin,
      order,
      body,
      signature,
      platformSecrets
    );

    if (!merchantVerified) {
      return NextResponse.json(
        { error: 'Invalid merchant payment signature.' },
        { status: 401 }
      );
    }

    if (order.payment_status === 'paid') {
      return NextResponse.json(
        { message: 'Already processed' },
        { status: 200 }
      );
    }

    const expectedCurrency = String(
      order.currency || 'NGN'
    ).toUpperCase();

    const receivedCurrency = String(
      currency || ''
    ).toUpperCase();

    const expectedAmount = minorUnits(
      Number(order.total_amount),
      expectedCurrency
    );

    if (
      Number(amount) !== expectedAmount ||
      receivedCurrency !== expectedCurrency ||
      reference !== order.payment_intent_id
    ) {
      console.error('Customer order payment validation failed:', {
        orderId: order.id,
        expectedAmount,
        receivedAmount: amount,
        expectedCurrency,
        receivedCurrency,
      });

      return NextResponse.json(
        { error: 'Payment amount or currency mismatch.' },
        { status: 400 }
      );
    }

    // Only one webhook delivery can change the order from unpaid to paid.
    const { data: updatedOrder, error: orderUpdateError } = await admin
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'processing',
        payment_method: 'paystack',
      })
      .eq('id', order.id)
      .neq('payment_status', 'paid')
      .select('id')
      .maybeSingle();

    if (orderUpdateError) throw orderUpdateError;

    if (!updatedOrder) {
      return NextResponse.json(
        { message: 'Already processed' },
        { status: 200 }
      );
    }

    // DROPSHIPPING AUTO-FULFILLMENT
    const { data: dropshipOrder } = await admin
      .from('orders')
      .select('has_dropship_products, auto_fulfill_enabled')
      .eq('id', order.id)
      .single();

    if (
      dropshipOrder?.has_dropship_products &&
      dropshipOrder?.auto_fulfill_enabled !== false
    ) {
      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        'https://marketplace.orizzoncart.com.ng';

      fetch(`${appUrl}/api/dropshipping/fulfill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      }).catch((error) =>
        console.error('Auto-fulfillment failed:', error)
      );
    }

    const { data: items } = await admin
      .from('order_items')
      .select('product_name, quantity')
      .eq('order_id', order.id);

    const itemList = (items || [])
      .map(
        (item: any) =>
          `${item.product_name} x${item.quantity}`
      )
      .join(', ');

    sendOrderAlert(order.merchant_id, order, itemList).catch(
      (error) => console.error('Order notification failed:', error)
    );

    return NextResponse.json(
      { message: 'Processed' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Paystack webhook error:', error);

    return NextResponse.json(
      { error: 'Webhook failed.' },
      { status: 500 }
    );
  }
}
