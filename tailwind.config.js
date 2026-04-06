/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        amber: {
          500: '#f59e0b',
        },
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
