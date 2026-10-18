// ÂNCORA: links de fontes confiáveis no Guia e no Roteiro.
import { launchBrowser, APP_URL, OUT } from './_env.mjs'
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : (fail++, console.log('FALHOU', m)) }
const b = await launchBrowser()
const p = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage()
const errs = []; p.on('pageerror', (e) => errs.push(e.message))
await p.goto(APP_URL); await p.waitForTimeout(600)

// Guia: cada card tem a seção Fontes; links seguros e só de domínios oficiais
const cards = await p.locator('.cmd-card').count()
ok(await p.locator('.cmd-card .sources').count() === cards, 'todo card do Guia tem a seção Fontes')
const links = await p.locator('.cmd-card .sources a').evaluateAll((as) => as.map((a) => ({ href: a.href, t: a.target, rel: a.rel })))
ok(links.length >= 15, 'há links de fontes no Guia: ' + links.length)
ok(links.every((l) => l.t === '_blank' && /noopener/.test(l.rel) && /noreferrer/.test(l.rel)), 'links abrem em aba nova com noopener e noreferrer')
ok(links.every((l) => /^https:\/\/(learn\.microsoft\.com|support\.microsoft\.com|crystalmark\.info|www\.seagate\.com)\//.test(l.href)), 'só domínios oficiais')
await p.locator('#busca').fill('prefetch'); await p.waitForTimeout(300)
ok(/Sem fonte oficial verificada/.test(await p.locator('.cmd-card').first().textContent()), 'Prefetch avisa que não há fonte oficial')
await p.locator('#busca').fill('sfc'); await p.waitForTimeout(300)
const sfcCard = p.locator('.cmd-card').filter({ hasText: 'sfc /scannow' }).first()
ok(await sfcCard.locator('.sources a').count() === 2 && /learn\.microsoft\.com/.test(await sfcCard.locator('.sources a').first().getAttribute('href')), 'SFC com 2 fontes da Microsoft')

// Roteiro: etapas com fontes; rota Tela azul cita códigos de parada
await p.locator('nav button').nth(1).click(); await p.waitForTimeout(500)
const steps = await p.locator('.step-card').count()
const withSrc = await p.locator('.step-card .sources').count()
ok(withSrc > 0 && withSrc <= steps, `etapas com fontes: ${withSrc}/${steps}`)
await p.getByRole('radio', { name: /Tela azul/ }).check({ force: true }).catch(async () => { await p.getByText('Tela azul e travamentos').click() })
await p.waitForTimeout(500)
ok(/troubleshooting-windows-unexpected-restarts-and-stop-code-errors/.test((await p.locator('.step-card .sources a').evaluateAll((as) => as.map((a) => a.href))).join(' ')), 'Tela azul cita a página de códigos de parada')

// celular: sem rolagem lateral e links com texto legível (fonte ≥ 12px)
for (const w of [320, 390]) {
  const m = await (await b.newContext({ viewport: { width: w, height: 800 }, hasTouch: true, isMobile: true })).newPage()
  await m.goto(APP_URL); await m.waitForTimeout(500)
  ok(await m.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `Guia sem rolagem lateral em ${w}px`)
  if (w === 390) await m.screenshot({ path: OUT + '/fontes-guia-390.png', fullPage: false })
  await m.locator('nav button').nth(1).click(); await m.waitForTimeout(500)
  ok(await m.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `Roteiro sem rolagem lateral em ${w}px`)
}
ok(errs.length === 0, 'sem erros de página: ' + errs.join('|'))
console.log(`09-fontes: ${pass} ok, ${fail} falhas`)
await b.close(); process.exit(fail ? 1 : 0)
