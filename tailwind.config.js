/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: '#F6F4EF',
        ink: {
          900: '#141C2E',
          800: '#1B2740',
          700: '#233152',
          600: '#324467',
          500: '#475569',
          400: '#6B7A94',
          300: '#9AA6BA',
          200: '#CBD2DF',
          100: '#E7EAF0',
        },
        brass: {
          700: '#8C6A3F',
          600: '#A67C42',
          500: '#B08D57',
          400: '#C7A672',
          300: '#DFC79A',
          100: '#F3E9D6',
        },
        seal: {
          green: '#2F6844',
          red: '#A8402C',
          amber: '#B7862A',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(20,28,46,0.04), 0 8px 24px -12px rgba(20,28,46,0.18)',
        panel: '0 20px 60px -20px rgba(20,28,46,0.35)',
      },
      backgroundImage: {
        'ledger-lines':
          'repeating-linear-gradient(to bottom, transparent, transparent 39px, rgba(20,28,46,0.05) 40px)',
      },
    },
  },
  plugins: [],
};
