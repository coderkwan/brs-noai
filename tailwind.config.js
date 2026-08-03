/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    // Every corner is square — no rounded edges anywhere in the app.
    borderRadius: {
      none: '0px',
      sm: '0px',
      DEFAULT: '0px',
      md: '0px',
      lg: '0px',
      xl: '0px',
      '2xl': '0px',
      '3xl': '0px',
      full: '0px',
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        ink: {
          950: '#0f0f0f',
          800: '#1c1c1e',
          600: '#3a3a3c',
          400: '#636366',
          200: '#aeaeb2',
          100: '#d1d1d6',
          50:  '#f2f2f7',
        },
        forest: {
          700: '#1a4731',
          600: '#1e5c3f',
          500: '#2d7a56',
          400: '#3d9970',
          100: '#d1ead9',
          50:  '#edf6ef',
        },
        amber: {
          600: '#b45309',
          100: '#fef3c7',
          50:  '#fffbeb',
        },
        rose: {
          600: '#be123c',
          100: '#ffe4e6',
          50:  '#fff1f2',
        },
      },
    },
  },
  plugins: [],
}
