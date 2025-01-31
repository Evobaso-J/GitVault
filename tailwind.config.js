/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,vue,ts}'],
  theme: {
    extend: {
      colors: {
        'royal-blue': {
          50: '#f6f8fd',
          100: '#e5edff',
          200: '#c2cdff',
          300: '#9caaff',
          400: '#757cff',
          500: '#6360ff',
          600: '#4936f5',
          700: '#3e2ad8',
          800: '#3225ae',
          900: '#2d2689',
          950: '#1c1650',
        },
      },
      aspectRatio: {
        auto: 'auto',
        square: '1 / 1',
        video: '16 / 9',
      },
    },
  },
  plugins: [],
}
