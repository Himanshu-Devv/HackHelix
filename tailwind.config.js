/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        band: {
          focused: '#22c55e',
          drifting: '#eab308',
          overloaded: '#f97316',
          fatigued: '#ef4444',
        },
        node: {
          high: '#f97316',
          medium: '#eab308',
          low: '#14b8a6',
          fatigue: '#a855f7',
          adhd: '#3b82f6',
        },
      },
      animation: {
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'breathe-in': 'breatheIn 4s ease-in-out',
        'breathe-out': 'breatheOut 6s ease-in-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        breatheIn: {
          '0%': { transform: 'scale(0.6)', opacity: '0.4' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        breatheOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.6)', opacity: '0.4' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
