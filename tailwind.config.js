/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sih: {
          blue: '#0d3b66',
          navy: '#001d3d',
          orange: '#f4a261',
          gold: '#e9c46a',
          teal: '#2a9d8f',
          darkBg: '#0b132b',
          cardBg: '#1c2541',
          border: '#3a506b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
