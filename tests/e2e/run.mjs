// ÂNCORA: executor dos testes de navegador. Sobe o site (pasta dist) e roda cada script 0N-*.mjs em sequência.
import { readdirSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { DIST, distExists, serveDir } from './_env.mjs'

if (!distExists()) {
  console.error('Pasta "dist" não encontrada. Rode "npm run build" primeiro.')
  process.exit(2)
}
const port = 4173
const server = await serveDir(DIST, port)
const env = { ...process.env, APP_URL: process.env.APP_URL || `http://localhost:${port}/` }
const dir = fileURLToPath(new URL('.', import.meta.url))
const files = readdirSync(dir).filter((f) => /^\d\d-.*\.mjs$/.test(f)).sort()

let failed = 0
for (const file of files) {
  // spawn assíncrono: o servidor de arquivos roda neste processo e precisa continuar respondendo
  const r = await new Promise((done) => {
    const child = spawn(process.execPath, [dir + file], { env })
    let out = ''
    child.stdout.on('data', (d) => (out += d))
    child.stderr.on('data', (d) => (out += d))
    const timer = setTimeout(() => child.kill(), 180000)
    child.on('close', (status) => { clearTimeout(timer); done({ status, out }) })
  })
  const out = r.out
  const m = out.match(/(\d+) falhas/) || out.match(/falhas: (\d+)/)
  const falhas = m ? Number(m[1]) : r.status === 0 ? 0 : 1
  if (falhas > 0 || r.status === 2) failed++
  console.log(`${falhas === 0 && r.status !== 2 ? 'OK    ' : 'FALHOU'} ${file}  (${m ? m[0] : 'sem resumo'})`)
  if (falhas > 0) console.log(out.split('\n').filter((l) => /FALHOU|FAIL|Error/.test(l)).slice(0, 8).join('\n'))
}
server.close()
console.log(failed === 0 ? '\nTodos os testes de navegador passaram.' : `\n${failed} arquivo(s) com falha.`)
process.exit(failed === 0 ? 0 : 1)
