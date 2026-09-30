import { MonetagVignette } from '@/components/ads/MonetagVignette';
import { MonetagPushNotifications } from '@/components/ads/MonetagPushNotifications';

/**
 * Wraps every merchant route:
 *   /store/[slug]          (home)
 *   /store/[slug]/p/...    (product)
 *   /store/[slug]/info/... (pages)
 *
 * Middleware rewrites *.orizzoncart.name.ng → these paths,
 * so every existing and future store gets ads automatically.
 */
export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MonetagVignette
        zoneId="11902705"
        storageKey="store_vignette"
        delay={2500}
        frequency={2}
      />
      <MonetagPushNotifications zoneId="11902738" />
      {children}
    </>
  );
}