import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('merchants')
    .select('*')
    .eq('is_verified', false)
    .not('business_locations', 'is', null)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ merchants: data || [] });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { merchantId, action } = body;

  if (!merchantId || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const admin = createAdminClient();

  const updateData = action === 'approve'
    ? { is_verified: true, verified_at: new Date().toISOString() }
    : { is_verified: false, business_locations: null, cac_number: null };

  const { error } = await admin
    .from('merchants')
    .update(updateData)
    .eq('id', merchantId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}