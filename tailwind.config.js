/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Professional Beige - Clean and neutral
        beige: {
          50: '#fefefd',
          100: '#fdfcf9',
          200: '#faf8f2',
          300: '#f6f1e7',
          400: '#f0e8d6',
          500: '#e8dcc0',
          600: '#dcc9a3',
          700: '#cbb17f',
          800: '#b39a65',
          900: '#8f7d4f',
          950: '#6b5d3b',
        },
        // Single Green - Consistent brand color
        green: {
          50: '#f0f9f0',
          100: '#dcf2dc',
          200: '#bce4bc',
          300: '#8fd18f',
          400: '#5bb85b',
          500: '#3a9d3a',
          600: '#2d7e2d',
          700: '#256425',
          800: '#1f511f',
          900: '#1a421a',
          950: '#0d240d',
        },
        // Russet - Rich and sophisticated
        russet: {
          50: '#fdf6f2',
          100: '#faece4',
          200: '#f4d8c8',
          300: '#e8b99a',
          400: '#d4946b',
          500: '#c06f3c',
          600: '#ac4a1d',
          700: '#8f3a15',
          800: '#722b0e',
          900: '#551c07',
          950: '#380d00',
        },
        // Neutral grays for text and backgrounds
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'rotate-slow': 'rotate-slow 20s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        'rotate-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'solid-beige': 'linear-gradient(to right, #f0e8d6, #e8dcc0)',
        'solid-green': 'linear-gradient(to right, #5bb85b, #3a9d3a)',
        'solid-russet': 'linear-gradient(to right, #845025, #703a1b)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 20px rgba(91, 184, 91, 0.3)',
        'green-glow': '0 0 20px rgba(91, 184, 91, 0.3)',
        'russet-glow': '0 0 20px rgba(132, 80, 37, 0.3)',
        'elegant': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'premium': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
} 