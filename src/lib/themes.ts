export interface ThemeConfig {
  name: string;
  display_name: string;
  description: string;
  category: string;
  is_premium: boolean;
  price: number;
  variables: Record<string, string>;
}

export const THEMES: Record<string, ThemeConfig> = {
  'luxe-minimal': {
    name: 'luxe-minimal',
    display_name: 'Luxe Minimal',
    description: 'Clean, elegant fashion theme with neutral tones.',
    category: 'fashion',
    is_premium: true,
    price: 15000,
    variables: {
      '--color-primary': '#D4C5B5', // Soft beige
      '--color-secondary': '#8B7355', // Brown
      '--color-bg': '#FFFFFF',
      '--color-surface': '#F9F9F9',
      '--color-text': '#1A1A1A',
      '--color-text-muted': '#666666',
      '--font-heading': 'Playfair Display, serif',
      '--font-body': 'Inter, sans-serif',
    },
  },
  'noir-atelier': {
    name: 'noir-atelier',
    display_name: 'Noir Atelier',
    description: 'Dark luxury theme for watches and accessories.',
    category: 'luxury',
    is_premium: true,
    price: 20000,
    variables: {
      '--color-primary': '#D4AF37', // Gold
      '--color-secondary': '#333333',
      '--color-bg': '#0A0A0A',
      '--color-surface': '#141414',
      '--color-text': '#F5F5F5',
      '--color-text-muted': '#A0A0A0',
      '--font-heading': 'Montserrat, sans-serif',
      '--font-body': 'Inter, sans-serif',
    },
  },
  'verdant-form': {
    name: 'verdant-form',
    display_name: 'Verdant Form',
    description: 'Natural, eco-friendly theme for sustainable products.',
    category: 'organic',
    is_premium: true,
    price: 12000,
    variables: {
      '--color-primary': '#7C9A6B', // Sage green
      '--color-secondary': '#5A724B',
      '--color-bg': '#F4F1EA',
      '--color-surface': '#FFFFFF',
      '--color-text': '#2C3E2D',
      '--color-text-muted': '#6B7C6C',
      '--font-heading': 'Inter, sans-serif',
      '--font-body': 'Inter, sans-serif',
    },
  },
  'aurelia': {
    name: 'aurelia',
    display_name: 'Aurelia',
    description: 'Romantic beauty and jewelry theme with pink palette.',
    category: 'beauty',
    is_premium: true,
    price: 15000,
    variables: {
      '--color-primary': '#D48C95', // Dusty rose
      '--color-secondary': '#8B4789', // Deep purple
      '--color-bg': '#FDF2F4',
      '--color-surface': '#FFFFFF',
      '--color-text': '#3D2B3D',
      '--color-text-muted': '#8A6A8A',
      '--font-heading': 'Cormorant Garamond, serif',
      '--font-body': 'Inter, sans-serif',
    },
  },
  'apex-commerce': {
    name: 'apex-commerce',
    display_name: 'Apex Commerce',
    description: 'Bold athletic and sportswear theme.',
    category: 'sports',
    is_premium: true,
    price: 15000,
    variables: {
      '--color-primary': '#0066CC', // Bold blue
      '--color-secondary': '#1A1A2E',
      '--color-bg': '#FFFFFF',
      '--color-surface': '#F3F4F6',
      '--color-text': '#111827',
      '--color-text-muted': '#6B7280',
      '--font-heading': 'Roboto, sans-serif',
      '--font-body': 'Inter, sans-serif',
    },
  },
  'golden-hour': {
    name: 'golden-hour',
    display_name: 'Golden Hour',
    description: 'Warm resort wear and beachwear theme.',
    category: 'fashion',
    is_premium: true,
    price: 12000,
    variables: {
      '--color-primary': '#D4A574', // Terracotta
      '--color-secondary': '#8B4513',
      '--color-bg': '#FAF7F2', // Warm cream
      '--color-surface': '#FFFFFF',
      '--color-text': '#2C1810',
      '--color-text-muted': '#7A5C4F',
      '--font-heading': 'Playfair Display, serif',
      '--font-body': 'Lato, sans-serif',
    },
  },
  'crystal-clarity': {
    name: 'crystal-clarity',
    display_name: 'Crystal Clarity',
    description: 'Luxury accessories and skincare theme.',
    category: 'luxury',
    is_premium: true,
    price: 18000,
    variables: {
      '--color-primary': '#B8D4E3', // Ice blue
      '--color-secondary': '#8BA3B5',
      '--color-bg': '#F8F9FA',
      '--color-surface': '#FFFFFF',
      '--color-text': '#1A252F',
      '--color-text-muted': '#6C7A89',
      '--font-heading': 'Playfair Display, serif',
      '--font-body': 'Inter, sans-serif',
    },
  },
  'soft-botan': {
    name: 'soft-botan',
    display_name: 'Soft Botan',
    description: 'Organic beauty products with earthy tones.',
    category: 'beauty',
    is_premium: true,
    price: 12000,
    variables: {
      '--color-primary': '#9CAF88', // Muted green
      '--color-secondary': '#7A8B69',
      '--color-bg': '#F5F1E8',
      '--color-surface': '#FFFFFF',
      '--color-text': '#3D4235',
      '--color-text-muted': '#7A8073',
      '--font-heading': 'Inter, sans-serif',
      '--font-body': 'Inter, sans-serif',
    },
  },
  'noir-elegance': {
    name: 'noir-elegance',
    display_name: 'Noir Elegance',
    description: 'Dark luxury watches and accessories.',
    category: 'luxury',
    is_premium: true,
    price: 20000,
    variables: {
      '--color-primary': '#C9A962', // Elegant gold
      '--color-secondary': '#1A1A1A',
      '--color-bg': '#050505',
      '--color-surface': '#111111',
      '--color-text': '#E5E5E5',
      '--color-text-muted': '#999999',
      '--font-heading': 'Montserrat, sans-serif',
      '--font-body': 'Inter, sans-serif',
    },
  },
  'luxe-maison': {
    name: 'luxe-maison',
    display_name: 'Luxe Maison',
    description: 'Sophisticated luxury goods theme.',
    category: 'luxury',
    is_premium: true,
    price: 25000,
    variables: {
      '--color-primary': '#C9B8A5', // Champagne
      '--color-secondary': '#8B7D6B',
      '--color-bg': '#F5F0E8',
      '--color-surface': '#FFFFFF',
      '--color-text': '#2A2520',
      '--color-text-muted': '#7A7065',
      '--font-heading': 'Cormorant Garamond, serif',
      '--font-body': 'Inter, sans-serif',
    },
  },
};

export function getThemeVariables(themeId: string | null) {
  const theme = THEMES[themeId || 'luxe-minimal'] || THEMES['luxe-minimal'];
  return theme.variables;
}