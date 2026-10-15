import { launchBrowser, APP_URL, OUT, serveDir, DIST } from './_env.mjs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { cpSync, rmSync, readFileSync, writeFileSync } from 'node:fs'

const URL1 = APP_URL || APP_URL
let pass = 0, fail = 0
const ok = (c, m) => { c ? pass++ : (fail++, console.log('FAIL:', m)) }
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

const b = await launchBrowser()
const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
const errors = []
page.on('pageerror', e => errors.push(e.message))
page.on('console', m => { if (m.type() === 'error' && !/ERR_TUNNEL|fonts\.g|Failed to load resource/.test(m.text())) errors.push(m.text()) })

// 1) manifest + ícones
await page.goto(URL1)
const mhref = await page.getAttribute('link[rel=manifest]', 'href')
ok(mhref === './manifest.webmanifest', 'link manifest')
const man = await (await ctx.request.get(new URL(mhref, URL1).href)).json()
ok(man.display === 'standalone' && man.short_name && man.start_url === './' && man.scope === './', 'manifest campos')
ok(man.icons.some(i => i.sizes === '192x192') && man.icons.some(i => i.sizes === '512x512' && i.purpose === 'any') && man.icons.some(i => i.purpose === 'maskable'), 'manifest ícones 192/512/maskable')
for (const i of [...man.icons, ...man.shortcuts.flatMap(s => s.icons)]) {
  const r = await ctx.request.get(new URL(i.src, new URL(mhref, URL1)).href)
  ok(r.status() === 200 && /image\/png/.test(r.headers()['content-type']), 'ícone 200 ' + i.src)
}
ok(await page.getAttribute('link[rel=apple-touch-icon]', 'href') === './icons/apple-touch-icon.png', 'apple-touch-icon')
ok((await ctx.request.get(URL1 + 'icons/apple-touch-icon.png')).status() === 200, 'apple icon 200')

// 2) SW ativa e controla
await page.evaluate(() => navigator.serviceWorker.ready)
await page.reload()
await sleep(500)
const sw = await page.evaluate(async () => {
  const r = await navigator.serviceWorker.getRegistration()
  return { active: r?.active?.state, controlled: !!navigator.serviceWorker.controller, scope: r?.scope }
})
ok(sw.active === 'activated' && sw.controlled, 'SW ativo e controlando ' + JSON.stringify(sw))
const cached = await page.evaluate(async () => {
  const names = await caches.keys()
  const shell = names.find(n => n.startsWith('katana-shell-'))
  const keys = shell ? (await (await caches.open(shell)).keys()).map(r => new URL(r.url).pathname) : []
  return { names, keys }
})
ok(cached.names.filter(n => n.startsWith('katana-shell-')).length === 1, 'um único cache shell ' + cached.names)
ok(cached.keys.some(k => k.endsWith('/index.html')) && cached.keys.some(k => k.endsWith('.js')) && cached.keys.some(k => k.endsWith('.css')) && cached.keys.some(k => k.endsWith('manifest.webmanifest')), 'precache completo ' + cached.keys.join(','))

// 3) offline real
await page.waitForSelector('.command-card, article', { timeout: 5000 })
await ctx.setOffline(true)
await page.reload()
await page.waitForSelector('main article', { timeout: 8000 })
const n = await page.locator('main article').count()
ok(n === 13, 'offline mostra 13 cards: ' + n)
ok(await page.getByText('Sem internet').isVisible(), 'aviso offline visível')

// 4) atalho ?aba=roteiro offline
await page.goto(URL1 + '?aba=roteiro')
await page.waitForSelector('text=Etapa 01', { timeout: 8000 })
ok(true, 'atalho roteiro abre offline')
ok(!page.url().includes('aba='), 'parâmetro aba removido da URL: ' + page.url())
await page.goto(URL1 + '?aba=historico')
await page.getByText('Nenhum atendimento salvo ainda').or(page.locator('#busca-historico')).first().waitFor({ timeout: 8000 })
ok(true, 'atalho histórico offline')
await page.goto(URL1 + '?aba=invalida')
await page.waitForSelector('main', { timeout: 5000 })
ok(!page.url().includes('aba='), 'aba inválida limpa da URL')

// 5) volta online: aviso some
await ctx.setOffline(false)
await sleep(300)
ok(!(await page.getByText('Sem internet').isVisible().catch(() => false)), 'aviso offline some ao voltar')

// 6) convite de instalação
await page.evaluate(() => {
  const e = new Event('beforeinstallprompt', { cancelable: true })
  e.prompt = () => { window.__prompted = true }
  e.userChoice = Promise.resolve({ outcome: 'accepted' })
  window.dispatchEvent(e)
})
await page.waitForSelector('text=Instale o app', { timeout: 3000 })
await page.getByRole('button', { name: 'Instalar', exact: true }).click()
ok(await page.evaluate(() => window.__prompted === true), 'prompt() chamado ao clicar Instalar')
await sleep(200)
ok(!(await page.getByText('Instale o app').isVisible().catch(() => false)), 'convite some após instalar')
// dispensar
await page.evaluate(() => {
  const e = new Event('beforeinstallprompt', { cancelable: true })
  e.prompt = () => {}; e.userChoice = Promise.resolve({})
  window.dispatchEvent(e)
})
await page.getByLabel('Dispensar convite de instalação').click()
ok(!(await page.getByText('Instale o app').isVisible().catch(() => false)), 'dispensar esconde convite')

// 7) fluxo de atualização: cópia do dist em outra porta, depois troca o BUILD_ID
const DIR = join(tmpdir(), 'katana-dist-upd')
rmSync(DIR, { recursive: true, force: true })
cpSync(DIST, DIR, { recursive: true })
const srv = await serveDir(DIR, 4182)
const U2 = 'http://localhost:4182/'
const ctx2 = await b.newContext({ viewport: { width: 1280, height: 800 } })
const p2 = await ctx2.newPage()
await p2.goto(U2)
await p2.evaluate(() => navigator.serviceWorker.ready)
await p2.reload(); await sleep(500)
ok(!(await p2.getByText('Nova versão disponível').isVisible().catch(() => false)), 'sem aviso de update no 1º acesso')
const swFile = DIR + '/sw.js'
writeFileSync(swFile, readFileSync(swFile, 'utf-8').replace(/BUILD_ID = '[^']+'/, "BUILD_ID = '9.9.9-teste'"))
await p2.reload()
await p2.waitForSelector('text=Nova versão disponível', { timeout: 8000 })
ok(true, 'aviso de nova versão aparece')
await Promise.all([p2.waitForNavigation({ timeout: 8000 }), p2.getByRole('button', { name: 'Atualizar agora' }).click()])
await p2.waitForSelector('main article', { timeout: 5000 })
const caches2 = await p2.evaluate(async () => (await caches.keys()))
const shells2 = caches2.filter(n => n.startsWith('katana-shell-'))
ok(shells2.length === 1 && shells2[0].includes('9.9.9-teste'), 'cache antigo removido, novo ativo: ' + caches2)
ok(!(await p2.getByText('Nova versão disponível').isVisible().catch(() => false)), 'aviso some após atualizar')
srv.close()

// 8) mobile 390: banners não estouram a largura
const ctx3 = await b.newContext({ viewport: { width: 390, height: 800 } })
const p3 = await ctx3.newPage()
await p3.goto(URL1)
await p3.evaluate(() => {
  const e = new Event('beforeinstallprompt', { cancelable: true }); e.prompt = () => {}; e.userChoice = Promise.resolve({})
  window.dispatchEvent(e)
})
await p3.waitForSelector('text=Instale o app')
await ctx3.setOffline(true)
await p3.evaluate(() => window.dispatchEvent(new Event('offline')))
await sleep(200)
const sw3 = await p3.evaluate(() => document.documentElement.scrollWidth)
ok(sw3 <= 390, 'sem scroll horizontal no mobile: ' + sw3)
await p3.screenshot({ path: OUT + '/pwa-mobile.png' })
await page.evaluate(() => {
  const e = new Event('beforeinstallprompt', { cancelable: true }); e.prompt = () => {}; e.userChoice = Promise.resolve({})
  window.dispatchEvent(e)
})
await page.screenshot({ path: OUT + '/pwa-desktop.png' })

ok(errors.length === 0, 'sem erros de console: ' + errors.join(' | '))
await b.close()
console.log(`\n${pass} ok, ${fail} falhas`)
process.exit(fail ? 1 : 0)
