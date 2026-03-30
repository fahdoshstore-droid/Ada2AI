/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00d4ff',
          dark: '#00a8cc',
          light: '#33ddff'
        },
        secondary: '#d4af37',
        accent: '#00d4ff',
        gold: {
          DEFAULT: '#d4af37',
          light: '#e8c84a',
          dark: '#b8962e'
        },
        cyan: {
          DEFAULT: '#00d4ff',
          light: '#33ddff',
          dark: '#00a8cc'
        },
        dark: {
          DEFAULT: '#041329',
          light: '#0a1f3d',
          lighter: '#0f2b52',
          card: '#0a1f3d80',
        }
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
