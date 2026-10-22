/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        lavender: {
          50: '#F8F7FF',
          100: '#E9E3FF',
          200: '#D4CCFF',
          300: '#BFB5FF',
          400: '#9B8AFB',
          500: '#7775E8',
          600: '#5A54C7',
          700: '#4339A6',
          800: '#2D2585',
          900: '#292747',
        },
        powder: {
          100: '#DCE9FF',
          200: '#C5DAFF',
          300: '#A8C8FF',
        },
        mint: {
          100: '#E6F7F0',
          200: '#BDEBD9',
          300: '#8EDBBE',
        },
        peach: {
          100: '#FFF0EB',
          200: '#FFD8CE',
          300: '#FFBFAF',
        },
        coral: {
          100: '#FFE8E5',
          200: '#FFD0CB',
          300: '#FFB3AB',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
