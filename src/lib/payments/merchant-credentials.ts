
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from 'crypto';

function getEncryptionKey(): Buffer {
  const value = process.env.MERCHANT_PAYMENT_ENCRYPTION_KEY || '';

  if (!/^[a-fA-F0-9]{64}$/.test(value)) {
    throw new Error(
      'MERCHANT_PAYMENT_ENCRYPTION_KEY must be a 32-byte hexadecimal key.'
    );
  }

  return Buffer.from(value, 'hex');
}

export function encryptMerchantSecret(secret: string) {
  const key = getEncryptionKey();
  const iv = randomBytes(12);

  const cipher = createCipheriv('aes-256-gcm', key, iv);

  const encrypted = Buffer.concat([
    cipher.update(secret, 'utf8'),
    cipher.final(),
  ]);

  return {
    secret_ciphertext: encrypted.toString('base64'),
    secret_iv: iv.toString('base64'),
    secret_auth_tag: cipher.getAuthTag().toString('base64'),
  };
}

export function decryptMerchantSecret(record: {
  secret_ciphertext: string;
  secret_iv: string;
  secret_auth_tag: string;
}): string {
  const key = getEncryptionKey();

  const decipher = createDecipheriv(
    'aes-256-gcm',
    key,
    Buffer.from(record.secret_iv, 'base64')
  );

  decipher.setAuthTag(
    Buffer.from(record.secret_auth_tag, 'base64')
  );

  const decrypted = Buffer.concat([
    decipher.update(
      Buffer.from(record.secret_ciphertext, 'base64')
    ),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}
