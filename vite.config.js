import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ÂNCORA: base './' deixa os caminhos relativos (funciona na Vercel, Netlify e em subpastas)
export default defineConfig({
  plugins: [react()],
  base: './'
})
