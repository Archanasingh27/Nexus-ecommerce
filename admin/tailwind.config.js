/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#fae125', // Main Primary Yellow
          500: '#fae125',
          600: '#e5cc18',
          700: '#ca8a04',
          800: '#854d0e',
          900: '#713f12',
        },
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488', // Deep Teal Accent
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        admin: {
          bg: '#f8fafc',
          card: '#ffffff',
          border: '#e2e8f0',
          sidebar: '#ffffff',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
