import { permanentRedirect } from 'next/navigation';

const PLATFORM_HOSTS = [
  'orizzoncart.name.ng',
  'www.orizzoncart.name.ng',
  'localhost:3000',
  '127.0.0.1:3000',
];

export function redirectToSubdomain(host: string, storeSlug: string, suffix: string, query?: string) {
  const h = (host || '').toLowerCase();
  if (PLATFORM_HOSTS.includes(h)) {
    permanentRedirect(`https://${storeSlug}.orizzoncart.name.ng${suffix}${query ? `?${query}` : ''}`);
  }
}