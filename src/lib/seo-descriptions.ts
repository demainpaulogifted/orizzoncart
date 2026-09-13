/**
 * SEO description helpers for:
 * - Platform digital catalog (bulk)
 * - Merchant own products (physical + digital)
 */

type CatalogLike = {
  title: string;
  description?: string | null;
  category?: string | null;
  suggested_price?: number | null;
};

type MerchantProductLike = {
  name: string;
  description?: string | null;
  price?: number | string | null;
  is_digital?: boolean;
  category?: string | null; // optional free-text
};

const CATEGORY_TEMPLATES: Record<string, (title: string, price: string) => string> = {
  'Side-Hustle Starters': (title, price) =>
    `\( {title} — practical side-hustle guide for Nigerian earners. Clear steps you can start today. Instant download after payment. ₦ \){price}.`,

  'Career & Jobs': (title, price) =>
    `\( {title} — career toolkit for job seekers and professionals. Templates and tips you can use right away. Instant access · ₦ \){price}.`,

  'Education': (title, price) =>
    `\( {title} — easy-to-follow learning resource. Practical lessons, no fluff. Instant digital delivery · ₦ \){price}.`,

  'Social Media & Marketing': (title, price) =>
    `\( {title} — social media & marketing pack. Captions, content ideas and growth tips for your brand. Instant download · ₦ \){price}.`,

  'Business Templates': (title, price) =>
    `\( {title} — ready business templates for entrepreneurs. Save time on invoices, proposals and planning. Instant access · ₦ \){price}.`,

  'Food & Health': (title, price) =>
    `\( {title} — food & health guide with practical tips you can use immediately. Instant download · ₦ \){price}.`,

  'Events & Lifestyle': (title, price) =>
    `\( {title} — events & lifestyle resource. Checklists and ideas for smoother planning. Instant delivery · ₦ \){price}.`,

  'Faith & Community': (title, price) =>
    `\( {title} — faith & community resource. Simple guides for growth and fellowship. Instant access · ₦ \){price}.`,

  'Tech Skills': (title, price) =>
    `\( {title} — tech skills pack. Step-by-step resources to learn practical digital skills. Instant download · ₦ \){price}.`,

  'Parenting': (title, price) =>
    `\( {title} — parenting guide with real-life tips and routines. Instant digital delivery · ₦ \){price}.`,

  'Real Life Admin': (title, price) =>
    `\( {title} — admin templates and checklists to organise everyday tasks faster. Instant access · ₦ \){price}.`,

  'AI & Prompt Packs': (title, price) =>
    `\( {title} — AI prompt pack to create better content faster. Ready-to-use workflows. Instant download · ₦ \){price}.`,
};

function formatPrice(value: number | string | null | undefined): string {
  return Number(value || 0).toLocaleString('en-NG');
}

function defaultCatalogDescription(title: string, category: string, price: string): string {
  return `${title} — \( {category || 'digital'} product with instant access after payment. Simple, practical and ready to use. ₦ \){price}.`;
}

/** Catalog / bulk SEO */
export function generateSeoDescription(
  product: CatalogLike,
  options: { force?: boolean; minLength?: number } = {}
): string {
  const { force = false, minLength = 80 } = options;
  const existing = (product.description || '').trim();
  if (!force && existing.length >= minLength) return existing;

  const title = (product.title || 'Digital Product').trim();
  const category = (product.category || '').trim();
  const price = formatPrice(product.suggested_price);
  const templateFn = CATEGORY_TEMPLATES[category];
  const generated = templateFn
    ? templateFn(title, price)
    : defaultCatalogDescription(title, category, price);

  if (existing.length > 20 && existing.length < minLength && !force) {
    const combined = `${existing} ${generated}`;
    return combined.length > 320 ? combined.slice(0, 317).trim() + '…' : combined;
  }
  return generated;
}

/**
 * Merchant product SEO helper (own products).
 * More natural tone; works for physical + digital.
 */
export function generateMerchantSeoDescription(product: MerchantProductLike): string {
  const name = (product.name || '').trim();
  if (!name) return '';

  const price = formatPrice(product.price);
  const existing = (product.description || '').trim();
  const isDigital = Boolean(product.is_digital);
  const category = (product.category || '').trim();

  // Keep useful existing details and expand them
  if (existing.length >= 40) {
    const tip = isDigital
      ? ' Instant delivery after payment.'
      : ' Order online with secure payment.';
    const base = existing.replace(/\s+/g, ' ').trim();
    if (base.length >= 120) return base;
    return `\( {base} \){base.endsWith('.') ? '' : '.'}\( {tip} ₦ \){price}.`.trim();
  }

  if (isDigital) {
    const catBit = category ? ` (${category})` : '';
    return `\( {name} \){catBit} — digital product with instant access after payment. Clear, practical and ready to use. Only ₦${price}.`;
  }

  // Physical product – more natural shop language
  const extras = existing
    ? ` ${existing.replace(/\s+/g, ' ').trim()}`
    : ' Quality product, secure payment and fast support.';
  return `Shop \( {name} online. \){extras} Price ₦${price}.`.replace(/\s+/g, ' ').trim();
}