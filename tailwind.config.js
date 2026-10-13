/** @type {import('tailwindcss').Config} */
// ÂNCORA: o tema da Katana Tech fica aqui — mude a cor uma vez e vale para o site todo
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#07090d',
          900: '#0a0c10',
          800: '#12161f',
          700: '#1a202c',
          600: '#1e293b'
        },
        neon: '#00f0ff',
        jade: '#00ff88',
        amber: '#ff9900',
        muted: '#94a3b8'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"Fira Code"', 'ui-monospace', 'monospace']
      },
      boxShadow: {
        neon: '0 0 18px rgba(0, 240, 255, 0.28)',
        jade: '0 0 14px rgba(0, 255, 136, 0.25)'
      }
    }
  },
  plugins: []
}
