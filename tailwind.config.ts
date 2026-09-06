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
          500: '#8b5cf6', // Vibrant Purple
          600: '#7c3aed',
          900: '#4c1d95',
        },
        accent: {
          blue: '#3b82f6',
          green: '#10b981',
          purple: '#8b5cf6',
          orange: '#f97316',
        }
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 50%, #fbc2eb 100%)',
        'card-blue': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'card-green': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'card-purple': 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
        'card-orange': 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
};
export default config;