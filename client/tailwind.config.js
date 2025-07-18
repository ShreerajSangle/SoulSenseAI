/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'nunito': ['Nunito', 'sans-serif'],
        'rosarivo': ['Playfair Display', 'serif'],
      },
      colors: {
        lavender: {
          50: '#f8f7ff',
          100: '#e8e4f3',
          200: '#d1c4e9',
          300: '#b39ddb',
          400: '#9575cd',
          500: '#7e57c2',
          600: '#673ab7',
          700: '#512da8',
          800: '#4527a0',
          900: '#311b92',
        },
        rose: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'bounce-soft': 'bounce 0.3s ease-in-out',
      },
      boxShadow: {
        'gentle': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}