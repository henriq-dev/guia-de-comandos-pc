// ÂNCORA: assistente de IA no navegador. A rota /api/diagnostico é simulada: não usa chave nem internet.
import { launchBrowser, APP_URL } from './_env.mjs'
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : (fail++, console.log('FALHOU', m)) }
const b = await launchBrowser()
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } })
const p = await ctx.newPage(); const errs = []
p.on('pageerror', (e) => errs.push(e.message))
p.on('console', (m) => { if (m.type() === 'error' && !/ERR_|Failed to load|status of 4|status of 5/.test(m.text())) errs.push(m.text()) })

let calls = [], mode = 'ok'
await p.route('**/api/diagnostico', async (route) => {
  const req = route.request(); calls.push({ method: req.method(), code: req.headers()['x-access-code'], body: req.postDataJSON() })
  if (mode === 'ok') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ answer: 'Significa acesso negado.\n<img src=x onerror=window.__xss=1>\nPasso 1: sfc /scannow' }) })
  if (mode === 'code') return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ error: 'Código de acesso incorreto.' }) })
  if (mode === 'html') return route.fulfill({ status: 404, contentType: 'text/html', body: '<h1>não existe</h1>' })
  return route.fulfill({ status: 502, contentType: 'application/json', body: JSON.stringify({ error: 'Limite de uso da IA atingido.' }) })
})

await p.goto(APP_URL); await p.waitForTimeout(600)
const nav = p.locator('nav button')
ok(await nav.count() === 4, '4 abas')
ok(/Assistente IA/.test(await nav.nth(3).textContent()), 'aba Assistente IA é a última')
await nav.nth(3).click(); await p.waitForTimeout(400)
ok(/Não cole senhas/.test(await p.locator('main').textContent()), 'aviso de privacidade')
const send = p.getByRole('button', { name: /Analisar com IA/ })
ok(await send.isDisabled(), 'botão desligado sem texto')
await p.locator('#ia-texto').fill('0x80070005')
ok(await send.isEnabled(), 'botão liga com texto')

// sucesso + texto escapado
await send.click(); await p.waitForSelector('text=Diagnóstico sugerido')
ok(calls.length === 1 && calls[0].method === 'POST' && calls[0].body.text === '0x80070005', 'envia o texto por POST')
ok(calls[0].code === undefined, 'sem código de acesso por padrão')
const res = await p.locator('article').textContent()
ok(/acesso negado/.test(res) && /sfc \/scannow/.test(res), 'mostra a resposta')
ok(await p.locator('article img').count() === 0 && !(await p.evaluate(() => window.__xss)), 'HTML da resposta é texto, não executa')
await p.getByRole('button', { name: 'Copiar' }).click(); await p.waitForTimeout(200)
ok(await p.getByRole('button', { name: 'Copiado' }).isVisible(), 'botão Copiar confirma')

// código de acesso pedido pelo servidor
mode = 'code'; await send.click(); await p.waitForSelector('[role=alert]')
ok(/Código de acesso incorreto/.test(await p.locator('[role=alert]').textContent()), 'mostra erro 401')
ok(await p.locator('#ia-codigo').isVisible(), 'campo de código aparece após 401')
await p.locator('#ia-codigo').fill('abc123')
mode = 'ok'; await send.click(); await p.waitForSelector('text=Diagnóstico sugerido')
ok(calls.at(-1).code === 'abc123', 'envia o código no cabeçalho')
ok((await p.evaluate(() => localStorage.getItem('katana-ai-code'))) === '"abc123"', 'código lembrado só neste navegador')

// erro do provedor e função inexistente
mode = 'erro'; await send.click(); await p.waitForSelector('[role=alert]')
ok(/Limite de uso/.test(await p.locator('[role=alert]').textContent()), 'mostra erro do provedor')
ok(await p.locator('article').count() === 0, 'resposta antiga some ao falhar')
mode = 'html'; await send.click(); await p.waitForTimeout(500)
ok(/só funciona no site publicado/.test(await p.locator('[role=alert]').textContent()), 'mensagem amigável sem função (dev)')

// limite de tamanho e offline
ok(await p.locator('#ia-texto').getAttribute('maxlength') === '8000', 'limite de 8000 caracteres')
await ctx.setOffline(true); await p.waitForTimeout(400)
ok(await send.isDisabled(), 'desligado sem internet')
ok(/Sem internet: o assistente/.test(await p.locator('main').textContent()), 'avisa que precisa de conexão')
await ctx.setOffline(false)

// o código de acesso não entra no backup nem no histórico
await nav.nth(2).click(); await p.waitForTimeout(300)
ok(!/abc123/.test(await p.locator('main').textContent()), 'código não aparece no histórico')

// mobile: 4 abas cabem em 320px sem rolagem horizontal
for (const w of [320, 360, 390]) {
  const m = await (await b.newContext({ viewport: { width: w, height: 800 }, hasTouch: true, isMobile: true })).newPage()
  await m.goto(APP_URL); await m.waitForTimeout(500)
  await m.locator('nav button').nth(3).click(); await m.waitForTimeout(300)
  ok(await m.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `sem rolagem horizontal em ${w}px`)
  const navOk = await m.locator('nav button').evaluateAll((els, vw) => els.every((e) => { const r = e.getBoundingClientRect(); return r.left >= 0 && r.right <= vw }), w)
  ok(navOk, `4 abas à vista em ${w}px`)
  const h = await m.evaluate(() => Math.min(...[...document.querySelectorAll('nav button')].map((e) => e.getBoundingClientRect().height)))
  ok(h >= 44, `abas com 44px de altura em ${w}px: ${h}`)
}
ok(errs.length === 0, 'sem erros de console: ' + errs.join(' | '))
console.log(`11-ia: ${pass} ok, ${fail} falhas`)
await b.close()
process.exit(fail ? 1 : 0)
