import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const admin = createAdminClient();
  const now = new Date().toISOString();
  const { data: expired } = await admin
    .from('merchants')
    .select('id')
    .not('maintenance_expires_at', 'is', null)
    .lt('maintenance_expires_at', now)
    .eq('payment_receiving_status', 'ACTIVE');

  for (const m of expired || []) {
    await admin.from('merchants').update({
      payment_receiving_status: 'SUSPENDED', cart_status: 'LOCKED', checkout_status: 'DISABLED', maintenance_status: 'expired',
    }).eq('id', m.id);
  }
  return NextResponse.json({ suspended: expired?.length || 0 });
}