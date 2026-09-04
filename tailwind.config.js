/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        command: {
          bg: '#070a13',
          surface: '#0b1120',
          card: '#0f172a',
          'card-glass': 'rgba(15, 23, 42, 0.75)',
          border: 'rgba(51, 65, 85, 0.4)',
          'border-light': 'rgba(148, 163, 184, 0.15)',
          text: '#f8fafc',
          muted: '#94a3b8',
          accent: '#06b6d4'
        },
        hazard: {
          low: '#10b981',       // Emerald
          watch: '#f59e0b',     // Amber
          high: '#f97316',      // Orange
          critical: '#ef4444',  // Red
          flood: '#0284c7',     // Water Blue
          wildfire: '#ea580c',  // Fire Orange
          heatwave: '#eab308',  // Yellow Heat
          landslide: '#854d0e', // Earth Brown
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'radarSweep 4s linear infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite alternate',
      },
      keyframes: {
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        glowPulse: {
          '0%': { opacity: '0.4' },
          '100%': { opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
