import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { inviteLink } from '@/lib/invite';

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email')?.trim().toLowerCase();
  const code = request.nextUrl.searchParams.get('code')?.trim().toLowerCase();
  if (!email && !code) return NextResponse.json({ error: 'email or code required' }, { status: 400 });

  const admin = createAdminClient();
  let q = admin.from('invite_partners').select('*');
  if (email) q = q.eq('email', email);
  else q = q.eq('invite_code', code!);

  const { data: partner, error } = await q.maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!partner) return NextResponse.json({ error: 'Partner not found' }, { status: 404 });

  return NextResponse.json({
    partner,
    link: inviteLink(partner.invite_code),
    pending_naira: (partner.earnings_pending_kobo || 0) / 100,
    paid_naira: (partner.earnings_paid_kobo || 0) / 100,
  });
}
