/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        gold: '#ffd700',
        'gold-hover': '#e6c200',
        terracotta: '#cc4e3c',
        'terracotta-dark': '#891d11',
        'ghana-green': '#006b3f',
        'green-light': '#94ecb4',
        charcoal: '#121212',
        surface: '#131313',
        clay: '#201f1f',
        'clay-high': '#2a2a2a',
      },
      fontFamily: {
        sans: ['Inter_400Regular'],
        display: ['Montserrat_700Bold'],
        mono: ['JetBrainsMono_400Regular'],
      },
    },
  },
  plugins: [],
};
