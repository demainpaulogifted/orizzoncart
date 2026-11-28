
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(scryptCallback);

export async function hashInvitePassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');

  const derived = (await scrypt(password, salt, 64)) as Buffer;

  return `${salt}:${derived.toString('hex')}`;
}

export async function verifyInvitePassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  try {
    const [salt, hash] = storedHash.split(':');

    if (!salt || !hash) return false;

    const expected = Buffer.from(hash, 'hex');
    const actual = (await scrypt(password, salt, 64)) as Buffer;

    return (
      expected.length === actual.length &&
      timingSafeEqual(expected, actual)
    );
  } catch {
    return false;
  }
}
