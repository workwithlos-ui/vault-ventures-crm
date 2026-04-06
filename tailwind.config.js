/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    
  ],
  theme: {
    extend: {
      colors: {
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        green: { 400: '#4ade80', 500: '#22c55e' },
        red: { 400: '#f87171', 500: '#ef4444' },
        blue: { 400: '#60a5fa', 500: '#3b82f6' },
        purple: { 400: '#c084fc', 500: '#a855f7' },
        yellow: { 400: '#facc15', 500: '#eab308' },
        orange: { 400: '#fb923c', 500: '#f97316' },
        teal: { 400: '#2dd4bf', 500: '#14b8a6' },
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
      },
      backdropBlur: {
        xl: '20px',
      },
    },
  },
  plugins: [],
};
