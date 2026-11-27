
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { encryptMerchantSecret } from '@/lib/payments/merchant-credentials';

export const dynamic = 'force-dynamic';

async function getMerchant() {
  const authClient = await createClient();
  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser();

  if (authError || !user) {
    return { error: 'Please sign in again.', status: 401 };
  }

  const cookieStore = await cookies();
  const activeMerchantId = cookieStore.get('active_merchant_id')?.value;

  const admin = createAdminClient();

  let query = admin
    .from('merchants')
    .select('id, user_id')
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

    const secretMatch = secretKey.match(/^sk_(test|live)_[A-Za-z0-9]+$/);
    const publicMatch = publicKey.match(/^pk_(test|live)_[A-Za-z0-9]+$/);

    if (!secretMatch || !publicMatch) {
      return NextResponse.json(
        {
          error:
            'Enter valid Paystack Secret and Public keys. Do not enter restricted or placeholder keys.',
        },
        { status: 400 }
      );
    }

    if (secretMatch[1] !== publicMatch[1]) {
      return NextResponse.json(
        {
          error:
            'Your Secret Key and Public Key must both belong to the same Paystack environment.',
        },
        { status: 400 }
      );
    }

    const environment = secretMatch[1] === 'live' ? 'live' : 'sandbox';

    const encrypted = encryptMerchantSecret(secretKey);

    const { error } = await admin
      .from('merchant_payment_credentials')
      .upsert(
        {
          merchant_id: merchant.id,
          provider: 'paystack',
          environment,
          client_id: publicKey,
          ...encrypted,
          last_verified_at: null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'merchant_id,provider',
        }
      );

    if (error) throw error;

    return NextResponse.json({
      success: true,
      configured: true,
      public_key: publicKey,
      environment,
      message: 'Paystack credentials saved securely.',
    });
  } catch (error) {
    console.error('Paystack credential save error:', error);

    return NextResponse.json(
      { error: 'Could not securely save your Paystack credentials.' },
      { status: 500 }
    );
  }
}
