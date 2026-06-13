/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        xs: '480px',
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
        display: ['Baloo 2', 'cursive'],
      },
      keyframes: {
        shootStar: {
          '0%':   { opacity: '1', transform: 'rotate(-45deg) translateX(0)' },
          '100%': { opacity: '0', transform: 'rotate(-45deg) translateX(500px)' },
        },
        atmoPulse: {
          '0%, 100%': { opacity: '0.75' },
          '50%':      { opacity: '1' },
        },
        globeGlow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 30px rgba(68,170,255,.35)) drop-shadow(0 0 70px rgba(0,80,200,.2))' },
          '50%':      { filter: 'drop-shadow(0 0 50px rgba(68,170,255,.6)) drop-shadow(0 0 100px rgba(0,80,200,.35))' },
        },
      },
      animation: {
        shootStar: 'shootStar 1.1s ease-out forwards',
        atmoPulse:  'atmoPulse 4s ease-in-out infinite',
        globeGlow:  'globeGlow 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
