
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { inviteLink } from '@/lib/invite';
import {
  INVITE_SESSION_COOKIE,
  readInviteSession,
} from '@/lib/invite-session';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(INVITE_SESSION_COOKIE)?.value;
  const email = readInviteSession(token || undefined);

  if (!email) {
    return NextResponse.json(
      { error: 'Please log in to your partner account.' },
      { status: 401 }
    );
  }

  const admin = createAdminClient();

  const { data: partner, error } = await admin
    .from('invite_partners')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: 'Could not load partner dashboard.' },
      { status: 500 }
    );
  }

  if (!partner) {
    return NextResponse.json(
      { error: 'Partner account not found.' },
      { status: 404 }
    );
  }

  // Never send password hashes or bank account numbers to the browser.
  const {
    password_hash,
    account_number,
    ...safePartner
  } = partner;

  return NextResponse.json({
    partner: safePartner,
    link: inviteLink(partner.invite_code),
    pending_naira: (partner.earnings_pending_kobo || 0) / 100,
    paid_naira: (partner.earnings_paid_kobo || 0) / 100,
  });
}
