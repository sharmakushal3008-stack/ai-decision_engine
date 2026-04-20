/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neonBlue: '#3b82f6',
        neonPurple: '#a855f7',
        darkBg: '#0f172a',
        glassBg: 'rgba(30, 41, 59, 0.7)',
        glassBorder: 'rgba(255, 255, 255, 0.1)'
      }
    },
  },
  plugins: [],
}
