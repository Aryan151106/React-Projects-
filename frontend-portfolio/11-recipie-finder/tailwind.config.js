/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f3faf4',
          100: '#d9f2dc',
          500: '#3ea55b',
          700: '#256b38'
        }
      }
    }
  },
  plugins: []
};
