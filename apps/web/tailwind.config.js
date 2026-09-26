/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        jarvis: {
          bg: '#020711',
          surface: '#061425',
          card: 'rgba(6, 20, 37, 0.75)',
          border: 'rgba(0, 229, 255, 0.2)',
          borderGlow: 'rgba(0, 229, 255, 0.45)',
          cyan: '#00E5FF',
          plasma: '#3D7CFF',
          violet: '#8B5CFF',
          amber: '#F59E0B',
          red: '#EF4444',
          textMuted: '#8BA1B8',
          textBright: '#F0F6FC'
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        glowCyan: '0 0 20px rgba(0, 229, 255, 0.35)',
        glowViolet: '0 0 20px rgba(139, 92, 255, 0.35)',
        glowRed: '0 0 20px rgba(239, 68, 68, 0.45)',
        hudCard: '0 8px 32px 0 rgba(0, 0, 0, 0.6), inset 0 0 0 1px rgba(0, 229, 255, 0.15)'
      }
    }
  },
  plugins: []
};
