/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './*.html',
    './assets/js/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        ags: {
          teal: '#3ba8bf',
          'teal-dark': '#2d8a9e',
          'teal-light': '#5fc4d9',
          navy: '#0d1b2a',
          'navy-light': '#1b2d45',
          'navy-mid': '#162236',
          dark: '#0a1220',
          gold: '#c8a951',
          surface: '#111d2e',
          border: '#1e3048',
        }
      },
      fontFamily: {
        inter: ['Inter', 'system-ui', 'sans-serif'],
      }
    }
  },
  plugins: [],
}
