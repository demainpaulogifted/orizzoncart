export function getStoreUrl(slug: string): string {
  const raw = process.env.NEXT_PUBLIC_ROOT_DOMAIN || '';
  // Strip any https:// or http:// if someone pasted it by mistake
  const root = raw.replace(/^https?:\/\//, '').replace(/\/$/, '');

  if (root) return `https://${slug}.${root}`;

  const fallback = (process.env.NEXT_PUBLIC_APP_URL || 'https://orizzoncart.vercel.app')
    .replace(/\/$/, '');
  return `${fallback}/store/${slug}`;
}