/** @type {import('tailwindcss').Config} */
export default {
  content: { relative: true, files: ['./index.html', './src/**/*.{ts,tsx}'] },
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Baloo 2"', 'system-ui', 'sans-serif'],
        logo: ['Pacifico', 'cursive'],
      },
      colors: {
        noite: '#0b0218',
        roxo: { DEFAULT: '#a855f7', escuro: '#2a0b4d' },
        rosa: '#ff2ea6',
        amarelo: '#ffe140',
        azul: '#38bdf8',
        verde: '#4ade80',
      },
    },
  },
  plugins: [],
}
