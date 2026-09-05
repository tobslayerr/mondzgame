/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme'; // <-- Impor tema default

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // --- PERUBAHAN FONT ---
        // Hapus 'poppins' dan atur 'sans' (default) ke Jakarta Sans
        sans: ['"Plus Jakarta Sans"', ...defaultTheme.fontFamily.sans],
        // --- AKHIR PERUBAHAN ---
      },
      colors: {
        'primary-dark': '#1a1a2e', 
        'secondary-dark': '#2e2e4a', 
        'gacha-red': '#e74c3c', 
        'gacha-red-dark': '#c0392b', 
        'gacha-gold': '#f1c40f', 
        'gacha-silver': '#bdc3c7', 
        'text-light': '#ecf0f1', 
        'text-muted': '#bdc3c7', 
      },
    },
  },
  plugins: [],
}