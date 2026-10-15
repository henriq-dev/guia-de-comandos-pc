import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'))

// ÂNCORA: depois do build, carimba o sw.js com um id que muda sempre que os arquivos do site mudam.
// Sem isso o sw.js seria idêntico entre deploys e o navegador nunca saberia que há versão nova.
function serviceWorkerVersion() {
  let root = process.cwd()
  let outDir = 'dist'
  return {
    name: 'sw-version',
    apply: 'build',
    configResolved(config) {
      root = config.root
      outDir = config.build.outDir
    },
    closeBundle() {
      const dist = resolve(root, outDir)
      const swPath = resolve(dist, 'sw.js')
      if (!existsSync(swPath)) return
      const assets = readdirSync(resolve(dist, 'assets')).sort().join('|')
      const id = createHash('sha1').update(assets).digest('hex').slice(0, 8)
      writeFileSync(swPath, readFileSync(swPath, 'utf-8').replace('__BUILD_ID__', `${pkg.version}-${id}`))
    }
  }
}

// base './' deixa os caminhos relativos (funciona na Vercel, Netlify e em subpastas)
// __APP_VERSION__ vira a versão do package.json e aparece no rodapé do site
export default defineConfig({
  plugins: [react(), tailwindcss(), serviceWorkerVersion()],
  base: './',
  define: { __APP_VERSION__: JSON.stringify(pkg.version) }
})
