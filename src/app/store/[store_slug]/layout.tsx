/**
 * Wraps every merchant route:
 *   /store/[slug]          (home)
 *   /store/[slug]/p/...    (product)
 *   /store/[slug]/info/... (pages)
 *
 * Middleware rewrites *.orizzoncart.name.ng → these paths.
 */
export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
