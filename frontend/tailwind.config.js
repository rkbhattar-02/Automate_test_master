/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        purple: {
          light: '#e9d5ff',
          DEFAULT: '#8b5cf6',
          dark: '#6d28d9',
        },
        teal: {
          light: '#ccfbf1',
          DEFAULT: '#14b8a6',
          dark: '#0f766e',
        },
        mint: {
          light: '#d1fae5',
          DEFAULT: '#34d399',
          dark: '#059669',
        },
        yellow: {
          light: '#fef9c3',
          DEFAULT: '#facc15',
          dark: '#ca8a04',
        },
        sidebar: '#f8fafc',
        testlist: '#f1f5f9',
      },
    },
  },
  plugins: [],
};