
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { encryptMerchantSecret } from '@/lib/payments/merchant-credentials';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getMerchant() {
  const authClient = await createClient();

  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser();

  if (authError || !user) {
    return {
      error: 'Please sign in again.',
      status: 401,
    };
  }

  const cookieStore = await cookies();
  const activeMerchantId =
    cookieStore.get('active_merchant_id')?.value;

  const admin = createAdminClient();

  let query = admin
    .from('merchants')
    .select('id, user_id, payment_receiving_status')
    .eq('user_id', user.id);

  if (activeMerchantId) {
    query = query.eq('id', activeMerchantId);
  }

  const { data: merchant, error } = await query.maybeSingle();

  if (error || !merchant) {
    return {
      error: 'No active store was found for your account.',
      status: 404,
    };
  }

  return { merchant, admin };
}

export async function GET() {
  try {
    const result = await getMerchant();

    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    const { merchant, admin } = result;

    const { data, error } = await admin
      .from('merchant_payment_credentials')
      .select('client_id, environment, last_verified_at')
      .eq('merchant_id', merchant.id)
      .eq('provider', 'paystack')
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({
      configured: Boolean(data),
      public_key: data?.client_id || '',
      environment: data?.environment || null,
      last_verified_at: data?.last_verified_at || null,
    });
  } catch (error) {
    console.error('Paystack credential status error:', error);

    return NextResponse.json(
      { error: 'Could not load payment settings.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const result = await getMerchant();

    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    const { merchant, admin } = result;
    const body = await request.json();

    const secretKey = String(body.secret_key || '').trim();
    const publicKey = String(body.public_key || '').trim();

    const secretMatch = secretKey.match(
      /^sk_(test|live)_[A-Za-z0-9]+$/
    );

    const publicMatch = publicKey.match(
      /^pk_(test|live)_[A-Za-z0-9]+$/
    );

    if (!secretMatch || !publicMatch) {
      return NextResponse.json(
        {
          error:
            'Enter valid Paystack Secret and Public keys.',
        },
        { status: 400 }
      );
    }

    if (secretMatch[1] !== publicMatch[1]) {
      return NextResponse.json(
        {
          error:
            'Your Secret Key and Public Key must belong to the same Paystack environment.',
        },
        { status: 400 }
      );
    }

    const environment =
      secretMatch[1] === 'live' ? 'live' : 'sandbox';

    // Verify that Paystack accepts the supplied secret key.
    const verificationResponse = await fetch(
      'https://api.paystack.co/balance',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${secretKey}`,
          Accept: 'application/json',
        },
        cache: 'no-store',
      }
    );

    const verificationData = await verificationResponse.json();

    if (
      !verificationResponse.ok ||
      verificationData?.status !== true
    ) {
      return NextResponse.json(
        {
          error:
            verificationData?.message ||
            'Paystack could not verify this Secret Key. Check the key and its API permissions.',
        },
        { status: 400 }
      );
    }

    // Encrypt the secret before it enters the database.
    const encrypted = encryptMerchantSecret(secretKey);
    const verifiedAt = new Date().toISOString();

    const { error: credentialError } = await admin
      .from('merchant_payment_credentials')
      .upsert(
        {
          merchant_id: merchant.id,
          provider: 'paystack',
          environment,
          client_id: publicKey,
          ...encrypted,
          last_verified_at: verifiedAt,
          updated_at: verifiedAt,
        },
        {
          onConflict: 'merchant_id,provider',
        }
      );

    if (credentialError) throw credentialError;

    const merchantUpdate: Record<string, any> = {
      preferred_gateway: 'paystack',
      payout_method: 'own_keys',
    };

    if (
      merchant.payment_receiving_status === 'PENDING_KEYS'
    ) {
      merchantUpdate.payment_receiving_status = 'ACTIVE';
      merchantUpdate.cart_status = 'ENABLED';
      merchantUpdate.checkout_status = 'ENABLED';
    }

    const { error: merchantUpdateError } = await admin
      .from('merchants')
      .update(merchantUpdate)
      .eq('id', merchant.id);

    if (merchantUpdateError) {
      throw merchantUpdateError;
    }

    return NextResponse.json({
      success: true,
      configured: true,
      public_key: publicKey,
      environment,
      last_verified_at: verifiedAt,
      message: 'Paystack credentials verified and saved securely.',
    });
  } catch (error) {
    console.error('Paystack credential save error:', error);

    return NextResponse.json(
      {
        error:
          'Could not securely save your Paystack credentials. Please try again.',
      },
      { status: 500 }
    );
  }
}
