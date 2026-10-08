import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { getActiveMerchant } from '@/lib/active-merchant';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

  const admin = createAdminClient();
  const merchant = await getActiveMerchant(user.id);
  if (!merchant) return NextResponse.json({ error: 'No store' }, { status: 404 });

  const { data: connections } = await admin
    .from('dropshipping_connections')
    .select('supplier, status, created_at')
    .eq('merchant_id', merchant.id);

  return NextResponse.json({ connections: connections || [] });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { supplier, apiKey, apiSecret } = body;

  if (!supplier) {
    return NextResponse.json({ error: 'Supplier required' }, { status: 400 });
  }
  // CJ needs real keys. Others can start in Estimation Mode with a placeholder.
  const key = apiKey || 'estimation-mode';

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

  const merchant = await getActiveMerchant(user.id);
  if (!merchant) return NextResponse.json({ error: 'No store' }, { status: 404 });

  const admin = createAdminClient();
  const { error } = await admin
    .from('dropshipping_connections')
    .upsert({
      merchant_id: merchant.id,
      supplier: supplier,
      api_key: key,
      api_secret: apiSecret || null,
      status: 'connected',
    }, { onConflict: 'merchant_id,supplier' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const supplier = searchParams.get('supplier');

  if (!supplier) return NextResponse.json({ error: 'Supplier required' }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
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