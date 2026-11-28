
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
        { error: 'Complete all fields and provide valid bank details.' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Prevent duplicate partner registrations.
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

    // Verify the bank account directly with Paystack on the server.
    const secretKey = process.env.PLATFORM_PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      throw new Error('Paystack is not configured.');
    }

    const params = new URLSearchParams({
      account_number: accountNumber,
      bank_code: bankCode,
    });

    const verificationResponse = await fetch(
      `https://api.paystack.co/bank/resolve?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
        cache: 'no-store',
      }
    );

    const verification = await verificationResponse.json();

    if (
      !verificationResponse.ok ||
      !verification.status ||
      !verification.data?.account_name
    ) {
      return NextResponse.json(
        { error: 'Paystack could not verify this bank account.' },
        { status: 400 }
      );
    }

    const verifiedAccountName = String(
      verification.data.account_name
    ).trim();

    if (
      verifiedAccountName.toLowerCase() !== accountName.toLowerCase()
    ) {
      return NextResponse.json(
        { error: 'Bank account verification did not match.' },
        { status: 400 }
      );
    }

    // Hash the account number before using it as the initial password.
    const passwordHash = await hashInvitePassword(accountNumber);

    // Generate a unique referral code.
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

    // Create the partner account only after Paystack verification.
    const { data: partner, error: insertError } = await admin
      .from('invite_partners')
      .insert({
        email,
        invite_code: code,
        bank_name: bankName,
        bank_code: bankCode,
        account_number: accountNumber,
        account_name: verifiedAccountName,
        password_hash: passwordHash,
      })
      .select('id, email, invite_code')
      .single();

    if (insertError) throw insertError;

    // Establish the partner's authenticated session.
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
