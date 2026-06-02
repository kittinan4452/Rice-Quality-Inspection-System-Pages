/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#A73B24',
        'primary-hover': '#8B2E1A',
        'primary-light': '#995A5A',
      },
      fontFamily: {
        sans: ['Noto Sans Thai', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
