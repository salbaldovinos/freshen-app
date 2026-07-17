/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        ember: {
          DEFAULT: '#C4603A',
          deep: '#9E4A28',
          warm: '#D07048',
          light: '#E49070',
          pale: '#F5E0D0',
        },
        harvest: {
          DEFAULT: '#D4A842',
          deep: '#A87E22',
          light: '#E8C870',
          pale: '#FAF0D0',
        },
        pasture: {
          DEFAULT: '#6B8F71',
          deep: '#4E6E54',
          light: '#9DB8A2',
          pale: '#DDE9DE',
        },
        parchment: '#F7F2E8',
        bark: {
          DEFAULT: '#261C10',
          mid: '#4A3828',
        },
        dusk: '#7A6652',
        mist: '#B8A898',
        sand: '#D8CCB8',
        fog: '#EAE4DC',
        flax: '#EDE5D2',
        cream: '#FDFAF4',
      },
      fontFamily: {
        'cormorant': ['Cormorant-Regular'],
        'cormorant-medium': ['Cormorant-Medium'],
        'cormorant-semibold': ['Cormorant-SemiBold'],
        'cormorant-bold': ['Cormorant-Bold'],
        'cormorant-italic': ['Cormorant-Italic'],
        'cormorant-medium-italic': ['Cormorant-MediumItalic'],
        'dm-sans-light': ['DMSans-Light'],
        'dm-sans': ['DMSans-Regular'],
        'dm-sans-medium': ['DMSans-Medium'],
        'dm-sans-semibold': ['DMSans-SemiBold'],
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '14px',
        xl: '20px',
        '2xl': '28px',
      },
    },
  },
  plugins: [],
};
