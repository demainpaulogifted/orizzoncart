
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { encryptMerchantSecret } from '@/lib/payments/merchant-credentials';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PAYPAL_URLS = {
  sandbox: 'https://api-m.sandbox.paypal.com',
  live: 'https://api-m.paypal.com',
};

async function getOwnedMerchant() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Please sign in again.', status: 401 };
  }

  const cookieStore = await cookies();
  const activeId = cookieStore.get('active_merchant_id')?.value;

  const admin = createAdminClient();

  const { data: merchants, error } = await admin
    .from('merchants')
    .select('id, user_id, country_code')
    .eq('user_id', user.id);

  if (error) {
    return { error: 'Could not verify your store.', status: 500 };
  }

  const list = merchants || [];

  const merchant =
    list.find((item: any) => item.id === activeId) ||
    list[0];

  if (!merchant) {
    return { error: 'No merchant store was found.', status: 404 };
  }

  return { merchant, admin };
}

export async function GET() {
  try {
    const result = await getOwnedMerchant();

    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    const { merchant, admin } = result;

    const { data: connection, error } = await admin
      .from('merchant_payment_connections')
      .select(
        'onboarding_status, account_country, connected_at, last_verified_at, metadata'
      )
      .eq('merchant_id', merchant.id)
      .eq('provider', 'paypal')
      .maybeSingle();

    if (error) throw error;

    const { data: credentials, error: credentialError } = await admin
      .from('merchant_payment_credentials')
      .select('environment, last_verified_at')
      .eq('merchant_id', merchant.id)
      .eq('provider', 'paypal')
      .maybeSingle();

    if (credentialError) throw credentialError;

    return NextResponse.json({
      connected: !!credentials,
      environment: credentials?.environment || null,
      status: connection?.onboarding_status || 'not_connected',
      last_verified_at: credentials?.last_verified_at || null,
    });
  } catch (error) {
    console.error('PayPal connection status error:', error);

    return NextResponse.json(
      { error: 'Could not load PayPal connection status.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const result = await getOwnedMerchant();

    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    const { merchant, admin } = result;

    const body = await request.json();

    const clientId = String(body.client_id || '').trim();
    const clientSecret = String(body.client_secret || '').trim();
    const environment = String(body.environment || 'sandbox');

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Enter both your PayPal Client ID and Client Secret.' },
        { status: 400 }
      );
    }

    if (!['sandbox', 'live'].includes(environment)) {
      return NextResponse.json(
        { error: 'Invalid PayPal environment.' },
        { status: 400 }
      );
    }

    if (clientId.length > 500 || clientSecret.length > 1000) {
      return NextResponse.json(
        { error: 'The supplied PayPal credentials are invalid.' },
        { status: 400 }
      );
    }

    const baseUrl =
      PAYPAL_URLS[environment as keyof typeof PAYPAL_URLS];

    // Verify the merchant's credentials directly with PayPal.
    const tokenResponse = await fetch(
      `${baseUrl}/v1/oauth2/token`,
      {
        method: 'POST',
        headers: {
          Authorization:
            `Basic ${Buffer.from(
              `${clientId}:${clientSecret}`
            ).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
        cache: 'no-store',
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      return NextResponse.json(
        {
          error:
            'PayPal rejected these credentials. Check that your Client ID, Secret and selected environment match.',
        },
        { status: 400 }
      );
    }

    // Encrypt the secret before it enters the database.
    const encrypted = encryptMerchantSecret(clientSecret);
    const verifiedAt = new Date().toISOString();

    const { error: saveError } = await admin
      .from('merchant_payment_credentials')
      .upsert(
        {
          merchant_id: merchant.id,
          provider: 'paypal',
          environment,
          client_id: clientId,
          ...encrypted,
          last_verified_at: verifiedAt,
          updated_at: verifiedAt,
        },
        { onConflict: 'merchant_id,provider' }
      );

    if (saveError) throw saveError;

    // Store connection status separately.
    // No credentials or access tokens are written into metadata.
    const { error: connectionError } = await admin
      .from('merchant_payment_connections')
      .upsert(
        {
          merchant_id: merchant.id,
          provider: 'paypal',
          account_country: merchant.country_code || null,
          onboarding_status: 'connected',
          charges_enabled: false,
          payouts_enabled: false,
          details_submitted: true,
          payments_receivable: false,
          permissions_granted: false,
          connected_at: verifiedAt,
          last_verified_at: verifiedAt,
          metadata: {
            connection_type: 'merchant_owned_rest_api',
            environment,
            credentials_verified: true,
          },
          updated_at: verifiedAt,
        },
        { onConflict: 'merchant_id,provider' }
      );

    if (connectionError) throw connectionError;

    return NextResponse.json({
      success: true,
      connected: true,
      environment,
      message: 'Your PayPal API credentials have been verified and securely saved.',
    });
  } catch (error) {
    console.error('PayPal credential connection error:', error);

    return NextResponse.json(
      { error: 'Could not securely connect your PayPal account. Please try again.' },
      { status: 500 }
    );
  }
}
