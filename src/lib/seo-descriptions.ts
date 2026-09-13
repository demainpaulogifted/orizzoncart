/**
 * Generates unique, SEO-friendly descriptions for digital catalog products.
 * Uses title + category + price so each product gets differentiated copy.
 */

const CATEGORY_TEMPLATES: Record<string, (title: string, price: string) => string> = {
  'Side-Hustle Starters': (title, price) =>
    `\( {title} — proven side-hustle digital product for Nigerians. Start earning extra income today with ready-to-use guides and templates. Instant download after payment. Only ₦ \){price}.`,

  'Career & Jobs': (title, price) =>
    `\( {title} — career & job-ready digital resource. CV templates, interview guides and workplace tools designed for African professionals. Get instant access for ₦ \){price}.`,

  'Education': (title, price) =>
    `\( {title} — practical education digital product. Clear lessons and resources you can use immediately. Instant digital delivery. Price ₦ \){price}.`,

  'Social Media & Marketing': (title, price) =>
    `\( {title} — social media & marketing pack. Content ideas, captions, growth strategies and templates to grow your brand faster. Instant download · ₦ \){price}.`,

  'Business Templates': (title, price) =>
    `\( {title} — ready-to-use business templates. Invoices, proposals, planners and professional docs for Nigerian entrepreneurs. Instant access for ₦ \){price}.`,

  'Food & Health': (title, price) =>
    `\( {title} — food & health digital guide. Practical tips, meal plans and wellness resources you can start using today. Instant download · ₦ \){price}.`,

  'Events & Lifestyle': (title, price) =>
    `\( {title} — events & lifestyle digital product. Planning checklists, ideas and templates for memorable occasions. Get it instantly for ₦ \){price}.`,

  'Faith & Community': (title, price) =>
    `\( {title} — faith & community resource. Devotionals, study guides and community tools for spiritual growth. Instant digital delivery · ₦ \){price}.`,

  'Tech Skills': (title, price) =>
    `\( {title} — tech skills digital pack. Step-by-step guides and resources to learn in-demand digital skills. Instant access after payment · ₦ \){price}.`,

  'Parenting': (title, price) =>
    `\( {title} — parenting digital guide. Practical advice, routines and tools for modern parents. Instant download · only ₦ \){price}.`,

  'Real Life Admin': (title, price) =>
    `\( {title} — real-life admin templates and checklists. Simplify paperwork, planning and everyday organisation. Instant digital delivery · ₦ \){price}.`,

  'AI & Prompt Packs': (title, price) =>
    `\( {title} — AI prompt pack & digital toolkit. Ready-to-use prompts and workflows to save time and create better results with AI. Instant access · ₦ \){price}.`,
};

const DEFAULT_TEMPLATE = (title: string, category: string, price: string) =>
  `${title} — premium \( {category || 'digital'} product. Instant download after secure payment. Perfect for resellers and personal use. Only ₦ \){price} on OrizzonCart.`;

/**
 * Builds an SEO description (≈140–160 chars ideal, up to \~300 for on-page).
 * Keeps existing good descriptions; only upgrades thin or empty ones unless force=true.
 */
export function generateSeoDescription(product: {
  title: string;
  description?: string | null;
  category?: string | null;
  suggested_price?: number | null;
}, options: { force?: boolean; minLength?: number } = {}): string {
  const { force = false, minLength = 80 } = options;
  const existing = (product.description || '').trim();

  // Keep solid existing copy unless forced
  if (!force && existing.length >= minLength) {
    return existing;
  }

  const title = (product.title || 'Digital Product').trim();
  const category = (product.category || '').trim();
  const price = Number(product.suggested_price || 0).toLocaleString('en-NG');

  const templateFn = CATEGORY_TEMPLATES[category];
  const generated = templateFn
    ? templateFn(title, price)
    : DEFAULT_TEMPLATE(title, category || 'digital', price);

  // If there was a short existing description, prepend it for uniqueness
  if (existing.length > 20 && existing.length < minLength && !force) {
    const combined = `${existing} ${generated}`;
    return combined.length > 320 ? combined.slice(0, 317).trim() + '…' : combined;
  }

  return generated;
}