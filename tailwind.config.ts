import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          500: '#8b5cf6', // Beautiful purple
          600: '#7c3aed',
          900: '#4c1d95',
        },
        accent: {
          blue: '#3b82f6',
          green: '#10b981',
          purple: '#a855f7',
          orange: '#f97316',
        }
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)', // Soft purple to blue
        'card-blue': 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
        'card-green': 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
        'card-purple': 'linear-gradient(135deg, #c084fc 0%, #a855f7 100%)',
        'card-orange': 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif'], // For elegant headings
      },
    },
  },
  plugins: [],
};
export default config;