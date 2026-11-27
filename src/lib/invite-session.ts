import { createHmac, timingSafeEqual } from 'crypto';

const SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function createInviteSession(email: string) {
  if (!SECRET) {
    throw new Error('Partner session secret is not configured');
  }

  const encoded = Buffer.from(email.trim().toLowerCase()).toString('base64url');

  const signature = createHmac('sha256', SECRET)
    .update(encoded)
    .digest('base64url');

  return `${encoded}.${signature}`;
}

export function readInviteSession(token: string | undefined) {
  if (!SECRET || !token) return null;

  const [encoded, suppliedSignature] = token.split('.');

  if (!encoded || !suppliedSignature) return null;

  const expectedSignature = createHmac('sha256', SECRET)
    .update(encoded)
    .digest('base64url');

  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);

  if (
    supplied.length !== expected.length ||
    !timingSafeEqual(supplied, expected)
  ) {
    return null;
  }

  try {
    const email = Buffer.from(encoded, 'base64url')
      .toString('utf8')
      .trim()
      .toLowerCase();

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? email
      : null;
  } catch {
    return null;
  }
}