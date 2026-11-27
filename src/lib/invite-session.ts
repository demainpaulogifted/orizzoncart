import { createHmac, timingSafeEqual } from 'crypto';

const SECRET = process.env.INVITE_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
export const INVITE_SESSION_COOKIE = 'invite_session';
export const INVITE_SESSION_MAX_AGE = 60 * 60 * 24 * 365;

export function createInviteSession(email: string, expiresAt?: number) {
  if (!SECRET) {
    throw new Error('Partner session secret is not configured');
  }

  const cleanEmail = email.trim().toLowerCase();
  const expiry = expiresAt ?? Math.floor(Date.now() / 1000) + INVITE_SESSION_MAX_AGE;
  const payload = Buffer.from(JSON.stringify({ email: cleanEmail, exp: expiry })).toString('base64url');
  const signature = createHmac('sha256', SECRET).update(payload).digest('base64url');

  return `${payload}.${signature}`;
}

export function readInviteSession(token: string | undefined) {
  if (!SECRET || !token) return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payload, suppliedSignature] = parts;
  if (!payload || !suppliedSignature) return null;

  const expectedSignature = createHmac('sha256', SECRET).update(payload).digest('base64url');
  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);

  if (
    supplied.length !== expected.length ||
    !timingSafeEqual(supplied, expected)
  ) {
    return null;
  }

  try {
    const value = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8')
    ) as { email?: unknown; exp?: unknown };

    const email = typeof value.email === 'string'
      ? value.email.trim().toLowerCase()
      : '';
    const expiresAt = typeof value.exp === 'number' ? value.exp : 0;

    if (!expiresAt || expiresAt <= Math.floor(Date.now() / 1000)) return null;

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
  } catch {
    return null;
  }
}
