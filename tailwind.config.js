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
        // Renaming to avoid collisions with Tailwind internal keys
        brand: {
          bg: '#060a0f',
          bg2: '#0b1117',
          surface: '#0f1923',
          card: '#141f2b',
          card2: '#192535',
          border: '#1e2f42',
          border2: '#253a52',
          accent: '#00d4ff',
          accent2: '#0099bb',
          gold: '#f5b800',
          green: '#00e676',
          red: '#ff4757',
          text: '#e4edf5',
          text2: '#8ba0b4',
          gray: '#607080',
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
