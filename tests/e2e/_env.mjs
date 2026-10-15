// ÂNCORA: configuração compartilhada dos testes de navegador (end-to-end).
// Variáveis opcionais:  APP_URL (site já no ar)  |  CHROME_PATH (Chrome/Chromium a usar)  |  SHOTS_DIR (onde salvar capturas)
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { existsSync, mkdirSync } from 'node:fs'
import { extname, join, normalize, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

export const ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)))
export const DIST = join(ROOT, 'dist')
export const APP_URL = process.env.APP_URL || 'http://localhost:4173/'
export const OUT = process.env.SHOTS_DIR || join(tmpdir(), 'katana-shots')
mkdirSync(OUT, { recursive: true })

// Abre o navegador. Sem CHROME_PATH usa o que o Playwright baixou (npx playwright-core install chromium).
export function launchBrowser() {
  const args = typeof process.getuid === 'function' && process.getuid() === 0 ? ['--no-sandbox'] : []
  return chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args })
}

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml'
}

// Servidor estático simples (só Node, sem dependências) para servir a pasta "dist"
export function serveDir(dir, port) {
  const server = createServer(async (req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname))
    const file = join(dir, path.endsWith('/') ? path + 'index.html' : path)
    if (!file.startsWith(dir)) { res.writeHead(403).end(); return }
    try {
      const body = await readFile(file)
      res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' }).end(body)
    } catch {
      res.writeHead(404).end('não encontrado')
    }
  })
  return new Promise((ok) => server.listen(port, () => ok(server)))
}

export const distExists = () => existsSync(join(DIST, 'index.html'))
