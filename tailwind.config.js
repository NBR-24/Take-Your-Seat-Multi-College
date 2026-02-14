/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Racdox-inspired dark theme palette
        dark: {
          50: '#f5f5f5',
          100: '#e0e0e0',
          200: '#1e1e1e',
          300: '#1a1a1a',
          400: '#141414',
          500: '#111111',
          600: '#0d0d0d',
          700: '#0a0a0a',
          800: '#080808',
          900: '#050505',
        },
        accent: {
          DEFAULT: '#00d47e',
          light: '#33f5a0',
          dark: '#00a865',
          50: '#edfff7',
          100: '#d6ffec',
          200: '#a8ffd6',
          300: '#66f5b0',
          400: '#00d47e',
          500: '#00b86b',
          600: '#009958',
        },
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 212, 126, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 212, 126, 0.6)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
