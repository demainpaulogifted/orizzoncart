import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { getActiveMerchant } from '@/lib/active-merchant';
import { getSupplier, isSupplierSupported, listSuppliers } from '@/lib/dropshipping/registry';

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

  const admin = createAdminClient();
  const merchant = await getActiveMerchant(user.id);
  if (!merchant) return NextResponse.json({ error: 'No store' }, { status: 404 });

  const { data: connections } = await admin
    .from('dropshipping_connections')
    .select(
      'supplier, status, created_at, shop_name, country_code, currency_code, shop_id, last_verified_at'
    )
    .eq('merchant_id', merchant.id);

  return NextResponse.json({
    connections: connections || [],
    supportedSuppliers: listSuppliers(),
    activeStore: {
      id: merchant.id,
      store_name: merchant.store_name,
      store_slug: merchant.store_slug,
    },
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { supplier, apiKey, apiSecret, email } = body;

  if (!supplier) {
    return NextResponse.json({ error: 'Supplier required' }, { status: 400 });
  }

  if (!isSupplierSupported(supplier)) {
    return NextResponse.json(
      {
        error: `Supplier "${supplier}" is not supported yet`,
        supported: listSuppliers(),
      },
      { status: 400 }
    );
  }

  const key = (apiKey || '').trim() || 'estimation-mode';

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

  const merchant = await getActiveMerchant(user.id);
  if (!merchant) return NextResponse.json({ error: 'No store' }, { status: 404 });

  const adapter = getSupplier(supplier);

  let connectResult = {
    success: true as boolean,
    shopId: undefined as string | undefined,
    shopName: (merchant.store_name || merchant.business_name || 'Store') as string,
    countryCode: 'NG',
    currencyCode: 'NGN',
    accessToken: undefined as string | undefined,
    refreshToken: undefined as string | undefined,
    tokenExpiresAt: null as string | null,
    error: undefined as string | undefined,
    meta: {} as Record<string, unknown>,
  };

  if (supplier === 'cj' && key !== 'estimation-mode') {
    const result = await adapter.connect(
      { apiKey: key, apiSecret, email },
      merchant
    );
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to connect to supplier' },
        { status: 400 }
      );
    }
    connectResult = {
      success: true,
      shopId: result.shopId,
      shopName: result.shopName || connectResult.shopName,
      countryCode: result.countryCode || 'NG',
      currencyCode: result.currencyCode || 'NGN',
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      tokenExpiresAt: result.tokenExpiresAt ?? null,
      error: undefined,
      meta: result.meta || {},
    };
  }

  const admin = createAdminClient();

  const baseRow: Record<string, unknown> = {
    merchant_id: merchant.id,
    supplier,
    api_key: key,
    api_secret: apiSecret || null,
    status: 'connected',
  };

  const extendedRow: Record<string, unknown> = {
    ...baseRow,
    access_token: connectResult.accessToken || null,
    refresh_token: connectResult.refreshToken || null,
    token_expires_at: connectResult.tokenExpiresAt || null,
    shop_id: connectResult.shopId || null,
    shop_name: connectResult.shopName,
    country_code: connectResult.countryCode,
    currency_code: connectResult.currencyCode,
    last_verified_at: new Date().toISOString(),
    meta: connectResult.meta || {},
  };

  let error = (
    await admin
      .from('dropshipping_connections')
      .upsert(extendedRow, { onConflict: 'merchant_id,supplier' })
  ).error;

  if (error) {
    console.warn(
      '[dropshipping/connections] Extended upsert failed, falling back to base columns:',
      error.message
    );
    const fallback = await admin
      .from('dropshipping_connections')
      .upsert(baseRow, { onConflict: 'merchant_id,supplier' });
    error = fallback.error;
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    supplier,
    shop: {
      id: connectResult.shopId || null,
      name: connectResult.shopName,
      countryCode: connectResult.countryCode,
      currencyCode: connectResult.currencyCode,
    },
    message: connectResult.shopId
      ? `Connected. CJ shop linked: ${connectResult.shopName}`
      : `Connected. API key saved for ${merchant.store_name || 'your store'}. If CJ still shows "no store", create/activate an API store under CJ → Authorization → API and reconnect.`,
    meta: connectResult.meta,
  });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const supplier = searchParams.get('supplier');

  if (!supplier) {
    return NextResponse.json({ error: 'Supplier required' }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

  const merchant = await getActiveMerchant(user.id);
  if (!merchant) return NextResponse.json({ error: 'No store' }, { status: 404 });

  const admin = createAdminClient();
  const { error } = await admin
    .from('dropshipping_connections')
    .delete()
    .eq('merchant_id', merchant.id)
    .eq('supplier', supplier);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
