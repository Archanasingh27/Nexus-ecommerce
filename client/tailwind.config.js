/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Main Primary Brand (#fae125)
        brand: {
          50: '#fffdf0',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#fae125', // Main Primary Color
          500: '#fae125', // Main Primary Color
          600: '#e5cc18',
          700: '#ca8a04',
          800: '#854d0e',
          900: '#713f12',
          950: '#422006',
        },
        // Main Accent Palette (#0d9488)
        teal: {
          50: '#f0fdfa',
          100: '#e5f3f3', // Exact Soft Theme Background Tint
          200: '#ccfbf1',
          300: '#99f6e4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488', // Exact Theme Teal Color
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        // Soft Theme Surface (#e5f3f3)
        surface: {
          50: '#f7fcfc',
          100: '#e5f3f3', // Exact Soft Theme Tint
          200: '#d0e9e9',
          300: '#b6dede',
        },
        sky: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
        },
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
        dark: {
          900: '#0f172a',
          800: '#134e4a',
          700: '#1e293b',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-yellow': '0 0 25px -5px rgba(250, 225, 37, 0.5)',
        'glow-teal': '0 0 25px -5px rgba(13, 148, 136, 0.4)',
        'glass': '0 8px 32px 0 rgba(13, 148, 136, 0.08)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
