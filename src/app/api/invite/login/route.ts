
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { createInviteSession, INVITE_SESSION_COOKIE, INVITE_SESSION_MAX_AGE } from '@/lib/invite-session';
import { hashInvitePassword, verifyInvitePassword } from '@/lib/invite-password';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email = String(body.email || '').trim().toLowerCase();
    const accountNumber = String(body.account_number || '').trim();

    if (!email || !/^\d{10}$/.test(accountNumber)) {
      return NextResponse.json(
        { error: 'Enter your email and 10-digit account number.' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    const { data: partner, error } = await admin
      .from('invite_partners')
      .select('id, email, account_number, password_hash')
      .eq('email', email)
      .maybeSingle();

    if (error) throw error;

    if (!partner) {
      return NextResponse.json(
        { error: 'Incorrect email or account number.' },
        { status: 401 }
      );
    }

    let valid = false;

    if (partner.password_hash) {
      valid = await verifyInvitePassword(
        accountNumber,
        partner.password_hash
      );
    } else {
      // Existing partners: upgrade their old account-number
      // login to a password hash on successful login.
      valid = partner.account_number === accountNumber;

      if (valid) {
        const passwordHash = await hashInvitePassword(accountNumber);

        const { error: updateError } = await admin
          .from('invite_partners')
          .update({ password_hash: passwordHash })
          .eq('id', partner.id)
          .is('password_hash', null);

        if (updateError) throw updateError;
      }
    }

    if (!valid) {
      return NextResponse.json(
        { error: 'Incorrect email or account number.' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true });

    response.cookies.set(
      INVITE_SESSION_COOKIE,
      createInviteSession(email),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: INVITE_SESSION_MAX_AGE,
      }
    );

    return response;
  } catch (error: any) {
    console.error('Partner login:', error);

    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
