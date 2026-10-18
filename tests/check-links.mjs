// ÂNCORA: confere se cada link de "Fontes" abre. Precisa de internet, por isso NÃO faz parte do `npm test`.
// Uso: npm run check:links   (rode de vez em quando e depois de acrescentar uma fonte)
import { SOURCES } from '../src/data/sources.js'

const TIMEOUT_MS = 15000
async function check(url) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(TIMEOUT_MS), headers: { 'User-Agent': 'katana-tech-hub link-check', Accept: 'text/html' } })
      if (res.ok) return { ok: true, status: res.status, final: res.url }
      if (attempt === 2) return { ok: false, status: res.status }
    } catch (error) {
      if (attempt === 2) return { ok: false, status: error.name === 'TimeoutError' ? 'tempo esgotado' : 'sem conexão' }
    }
  }
}

let bad = 0
for (const [key, s] of Object.entries(SOURCES)) {
  const r = await check(s.url)
  if (r.ok) console.log(`OK     ${r.status}  ${key}${r.final !== s.url ? '  (redirecionado)' : ''}`)
  else { bad++; console.log(`FALHOU ${r.status}  ${key}  ${s.url}`) }
}
console.log(bad ? `\n${bad} link(s) com problema: confira e corrija em src/data/sources.js` : '\nTodos os links abriram.')
process.exit(bad ? 1 : 0)
