/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#15803d',
        'primary-dark': '#14532d',
        'primary-light': '#dcfce7',
        accent: '#ca8a04',
        'accent-light': '#fef9c3',
      },
      fontFamily: {
        sans: ['Noto Sans Thai', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
