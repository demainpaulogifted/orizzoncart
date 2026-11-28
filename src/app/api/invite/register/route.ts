
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { generateInviteCode, inviteLink } from '@/lib/invite';
import { hashInvitePassword } from '@/lib/invite-password';
import {
  createInviteSession,
  INVITE_SESSION_COOKIE,
  INVITE_SESSION_MAX_AGE,
} from '@/lib/invite-session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email = String(body.email || '').trim().toLowerCase();
    const bankName = String(body.bank_name || '').trim();
    const bankCode = String(body.bank_code || '').trim();
    const accountNumber = String(body.account_number || '').trim();
    const accountName = String(body.account_name || '').trim();

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !bankName ||
      !bankCode ||
      !/^\d{10}$/.test(accountNumber) ||
      !accountName
    ) {
      return NextResponse.json(
        { error: 'Complete all fields and verify your bank account.' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    const { data: existing, error: lookupError } = await admin
      .from('invite_partners')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (lookupError) throw lookupError;

    if (existing) {
      return NextResponse.json(
        { error: 'This email is already registered. Please log in.' },
        { status: 409 }
      );
    }

    const passwordHash = await hashInvitePassword(accountNumber);

    let code = generateInviteCode(8);
    let unique = false;

    for (let i = 0; i < 10; i++) {
      const { data: clash, error } = await admin
        .from('invite_partners')
        .select('id')
        .eq('invite_code', code)
        .maybeSingle();

      if (error) throw error;

      if (!clash) {
        unique = true;
        break;
      }

      code = generateInviteCode(8);
    }

    if (!unique) {
      throw new Error('Could not generate a unique invite code.');
    }

    const { data: partner, error: insertError } = await admin
      .from('invite_partners')
      .insert({
        email,
        invite_code: code,
        bank_name: bankName,
        bank_code: bankCode,
        account_number: accountNumber,
        account_name: accountName,
        password_hash: passwordHash,
      })
      .select('id, email, invite_code')
      .single();

    if (insertError) throw insertError;

    const response = NextResponse.json(
      {
        success: true,
        link: inviteLink(partner.invite_code),
      },
      { status: 201 }
    );

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
    console.error('Partner registration:', error);

    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
