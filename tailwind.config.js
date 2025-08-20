/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1A1A1A',
        secondary: '#4A90E2',
        accent: '#00D084',
        success: '#00D084',
        warning: '#F5A623',
        error: '#E74C3C',
        info: '#4A90E2',
        surface: '#FFFFFF',
        background: '#F5F7FA',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}