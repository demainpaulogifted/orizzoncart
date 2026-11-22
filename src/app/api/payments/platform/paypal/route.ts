
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { attributeStoreActivation } from '@/lib/invite';

export const dynamic = 'force-dynamic';

function paymentPage(
  request: NextRequest,
  reference: string,
  error?: string
) {
  const url = new URL('/payment/verify', request.url);
  url.searchParams.set('reference', reference);

  if (error) {
    url.searchParams.set('payment_error', error);
  }

  return NextResponse.redirect(url);
}

async function completeMerchantActivation(admin: any, merchantId: string) {
  try {
    await attributeStoreActivation(merchantId);
  } catch (error) {
    console.error('Invite activation attribution failed:', error);
  }

  const { data: merchant, error: merchantError } = await admin
    .from('merchants')
    .select(
      'paystack_secret_key, flutterwave_secret_key, bank_name, account_number, payment_activated_at'
    )
    .eq('id', merchantId)
    .single();

  if (merchantError) throw merchantError;

  const hasPaymentMethod = Boolean(
    merchant?.paystack_secret_key ||
    merchant?.flutterwave_secret_key ||
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
    .eq('id', merchantId);

  if (error) throw error;
}

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get('reference');
  const orderId = request.nextUrl.searchParams.get('token');

  if (!reference || !orderId) {
    return NextResponse.json(
      { error: 'Missing PayPal transaction details.' },
      { status: 400 }
    );
  }

  try {
    const admin = createAdminClient();

    const { data: tx, error: txError } = await admin
      .from('platform_transactions')
      .select('*')
      .eq('payment_reference', reference)
      .maybeSingle();

    if (txError) throw txError;

    if (!tx) {
      return NextResponse.json(
        { error: 'Transaction not found.' },
        { status: 404 }
      );
    }

    if (
      tx.transaction_type !== 'payment_activation' ||
      tx.metadata?.activation_gateway !== 'paypal' ||
      tx.metadata?.paypal_order_id !== orderId ||
      String(tx.currency || '').toUpperCase() !== 'USD'
    ) {
      return NextResponse.json(
        { error: 'PayPal transaction details do not match.' },
        { status: 400 }
      );
    }

    if (!['pending', 'paid'].includes(tx.status)) {
      return paymentPage(
        request,
        reference,
        'This payment transaction is no longer payable.'
      );
    }

    // A previously verified payment does not need to be captured again.
    // We still retry merchant activation in case the earlier database
    // update failed after PayPal confirmed the payment.
    if (tx.status !== 'paid') {
      const clientId = process.env.PLATFORM_PAYPAL_CLIENT_ID;
      const secret = process.env.PLATFORM_PAYPAL_SECRET;
      const baseUrl = (
        process.env.PLATFORM_PAYPAL_BASE_URL ||
        'https://api-m.sandbox.paypal.com'
      ).replace(/\/+$/, '');

      if (!clientId || !secret) {
        return paymentPage(
          request,
          reference,
          'PayPal is not configured.'
        );
      }

      const tokenResponse = await fetch(
        `${baseUrl}/v1/oauth2/token`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(
              `${clientId}:${secret}`
            ).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: 'grant_type=client_credentials',
          cache: 'no-store',
        }
      );

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok || !tokenData.access_token) {
        throw new Error('Could not authenticate with PayPal.');
      }

      const headers = {
        Authorization: `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      };

      const captureResponse = await fetch(
        `${baseUrl}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({}),
          cache: 'no-store',
        }
      );

      let captureData = await captureResponse.json();

      // If PayPal says the order was already captured, retrieve its
      // existing details instead of trying to capture it again.
      if (!captureResponse.ok) {
        const orderResponse = await fetch(
          `${baseUrl}/v2/checkout/orders/${encodeURIComponent(orderId)}`,
          {
            method: 'GET',
            headers,
            cache: 'no-store',
          }
        );

        const orderData = await orderResponse.json();

        if (!orderResponse.ok) {
          console.error('PayPal capture and retrieval errors:', {
            capture: captureData,
            retrieval: orderData,
          });

          throw new Error(
            'PayPal could not confirm the payment. Please try again.'
          );
        }

        captureData = orderData;
      }

      const purchaseUnit = captureData.purchase_units?.[0];

      const capture =
        purchaseUnit?.payments?.captures?.find(
          (item: any) => item.status === 'COMPLETED'
        ) || null;

      const receivedAmount = Number(capture?.amount?.value);
      const receivedCurrency = String(
        capture?.amount?.currency_code || ''
      ).toUpperCase();

      if (
        captureData.status !== 'COMPLETED' ||
        capture?.status !== 'COMPLETED' ||
        receivedCurrency !== String(tx.currency).toUpperCase() ||
        !Number.isFinite(receivedAmount) ||
        Math.abs(receivedAmount - Number(tx.amount)) > 0.001 ||
        purchaseUnit?.custom_id !== tx.merchant_id ||
        purchaseUnit?.reference_id !== tx.merchant_id
      ) {
        console.error('PayPal capture validation failed:', {
          orderStatus: captureData.status,
          captureStatus: capture?.status,
          receivedAmount,
          expectedAmount: tx.amount,
          receivedCurrency,
          expectedCurrency: tx.currency,
          customId: purchaseUnit?.custom_id,
          referenceId: purchaseUnit?.reference_id,
          merchantId: tx.merchant_id,
        });

        return paymentPage(
          request,
          reference,
          'PayPal payment could not be verified.'
        );
      }

      const { error: updateError } = await admin
        .from('platform_transactions')
        .update({ status: 'paid' })
        .eq('id', tx.id)
        .eq('status', 'pending');

      if (updateError) throw updateError;

      const { data: updatedTx, error: readError } = await admin
        .from('platform_transactions')
        .select('status')
        .eq('id', tx.id)
        .single();

      if (readError) throw readError;

      if (updatedTx.status !== 'paid') {
        throw new Error(
          'PayPal payment was captured but the transaction status could not be confirmed.'
        );
      }
    }

    // Run this for both newly captured and previously paid transactions.
    // This makes merchant activation retryable after temporary failures.
    await completeMerchantActivation(admin, tx.merchant_id);

    return paymentPage(request, reference);
  } catch (error: unknown) {
    console.error('PayPal return/capture error:', error);

    return paymentPage(
      request,
      reference,
      error instanceof Error
        ? error.message
        : 'PayPal payment verification failed.'
    );
  }
}
