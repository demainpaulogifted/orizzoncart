export function getStoreUrl(slug: string): string {
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
  if (root) return `https://${slug}.${root}`;
  return `${process.env.NEXT_PUBLIC_APP_URL || 'https://orizzoncart.vercel.app'}/store/${slug}`;
}