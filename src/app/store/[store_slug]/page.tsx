import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { StorefrontClient } from '@/components/storefront/StorefrontClient';

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { store_slug } = await params;
  const admin = createAdminClient();
  const { data: merchant } = await admin.from('merchants').select('store_name, tagline').eq('store_slug', store_slug).maybeSingle();
  if (!merchant) return {};
  return {
    title: `${merchant.store_name} | OrizzonCart`,
    description: merchant.tagline || `Shop ${merchant.store_name} online — secure payments and fast delivery.`,
  };
}

export default async function StorePage({ params }: any) {
  const { store_slug } = await params;
  const admin = createAdminClient();

  const { data: merchant } = await admin.from('merchants').select('*').eq('store_slug', store_slug).maybeSingle();
  if (!merchant) notFound();

  const expired = merchant.maintenance_expires_at && new Date(merchant.maintenance_expires_at) < new Date();
  const isShowcaseMode =
    merchant.cart_status === 'LOCKED' ||
    merchant.checkout_status !== 'ENABLED' ||
    merchant.payment_receiving_status !== 'ACTIVE' ||
    !!expired;

  const { data: products } = await admin
    .from('products')
    .select('*')
    .eq('merchant_id', merchant.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  const { data: pages } = await admin
    .from('store_pages')
    .select('title, slug')
    .eq('merchant_id', merchant.id)
    .eq('is_active', true)
    .order('created_at');

  const styleVars = {
    '--color-primary': '#7c3aed',
    '--color-surface': '#f8fafc',
    '--color-text': '#111827',
  } as React.CSSProperties;

  return (
    <StorefrontClient
      merchant={merchant}
      products={products || []}
      isShowcaseMode={isShowcaseMode}
      pages={pages || []}
      styleVars={styleVars}
    />
  );
}