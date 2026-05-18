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
          bg: 'var(--color-bg)',
          bg2: 'var(--color-bg2)',
          surface: 'var(--color-surface)',
          card: 'var(--color-card)',
          card2: 'var(--color-card2)',
          border: 'var(--color-border)',
          border2: 'var(--color-border2)',
          accent: '#00d4ff',
          accent2: '#0099bb',
          gold: '#f5b800',
          green: '#00e676',
          red: '#ff4757',
          text: 'var(--color-text)',
          text2: 'var(--color-text2)',
          gray: 'var(--color-gray)',
        }
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        body: ['Syne', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'gradient-neon': 'linear-gradient(135deg, #0099bb, #00d4ff)',
        'gradient-dark': 'linear-gradient(135deg, #141f2b 0%, #192535 100%)',
        'radial-neon': 'radial-gradient(circle, rgba(0, 212, 255, 0.08) 0%, transparent 70%)',
      },
      letterSpacing: {
        widest: '0.2em',
        wordmark: '0.08em',
      }
    },
  },
  plugins: [],
}
