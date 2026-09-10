import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (profile?.role !== 'platform_admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const admin = createAdminClient();

  // Delete everything the store owns, in safe order
  const { data: orders } = await admin.from('orders').select('id').eq('merchant_id', id);
  const orderIds = (orders || []).map((o: any) => o.id);
  if (orderIds.length) await admin.from('order_items').delete().in('order_id', orderIds);
  await admin.from('orders').delete().eq('merchant_id', id);
  await admin.from('products').delete().eq('merchant_id', id);
  await admin.from('store_sessions').delete().eq('merchant_id', id);
  await admin.from('push_subscriptions').delete().eq('merchant_id', id);
  await admin.from('merchants').delete().eq('id', id);

  return NextResponse.json({ ok: true });
}