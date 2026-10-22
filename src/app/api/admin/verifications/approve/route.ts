import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { merchantId } = await req.json();

    if (!merchantId) {
      return NextResponse.json({ error: 'Merchant ID is required' }, { status: 400 });
    }

    const admin = createAdminClient();

    const { error } = await admin
      .from('merchants')
      .update({ is_verified: true })
      .eq('id', merchantId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}