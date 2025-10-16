/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./pages/**/*.html",
    "./services/**/*.html",
    "./portfolio/**/*.html",
  ],
  theme: {
    extend: {
      colors: {
        'lux-dark': '#111111',
        'lux-darker': '#0a0a0a',
        'lux-mid': '#1b1b1b',
        'lux-gold': '#c59a5c',
        'lux-sand': '#e5c18f',
        'lux-slate': '#a5a6aa',
        'lux-offwhite': '#f4f4f5',
      },
      fontFamily: {
        sans: ['"Poppins"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Syne"', '"Poppins"', 'sans-serif'],
      },
      boxShadow: {
        'lux': '0 20px 60px -30px rgba(0, 0, 0, 0.75)',
      },
      backgroundImage: {
        'lux-radial': 'radial-gradient(circle at top, rgba(255,255,255,0.08), transparent 65%)',
      },
    },
  },
  plugins: [],
};
