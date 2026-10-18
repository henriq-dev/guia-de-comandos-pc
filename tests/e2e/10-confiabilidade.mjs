// ÂNCORA: cópia que não mente, confirmação antes de limpar, alvos de toque e histórico com registro corrompido.
import { launchBrowser, APP_URL } from './_env.mjs'
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : (fail++, console.log('FALHOU', m)) }
const b = await launchBrowser()
const errs = []
const watch = (p) => { p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/ERR_|Failed to load/.test(m.text())) errs.push(m.text()) }) }

// ---- cópia: sucesso e falha de verdade
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] })
const p = await ctx.newPage(); watch(p)
await p.goto(APP_URL); await p.waitForTimeout(600)
await p.getByRole('button', { name: /Copiar comando sfc/ }).click(); await p.waitForTimeout(200)
ok(await p.getByRole('button', { name: /Copiar comando sfc/ }).first().textContent().then((t) => /Copiado!/.test(t)), 'cópia que funciona mostra Copiado!')
// Falha: Clipboard API recusa e execCommand devolve false
await p.evaluate(() => {
  Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('negado')) }, configurable: true })
  document.execCommand = () => false
})
await p.getByRole('button', { name: /Copiar comando dism \/online \/cleanup-image \/restorehealth/ }).click(); await p.waitForTimeout(200)
const txt = await p.getByRole('button', { name: /Copiar comando dism \/online \/cleanup-image \/restorehealth/ }).textContent()
ok(/Não copiou/.test(txt) && !/Copiado!/.test(txt), 'cópia que falha NÃO mostra Copiado!: ' + txt.trim())
// plano B que funciona (execCommand true)
await p.evaluate(() => { document.execCommand = () => true })
await p.getByRole('button', { name: /Copiar comando dism \/online \/cleanup-image \/restorehealth/ }).click(); await p.waitForTimeout(200)
ok(/Copiado!/.test(await p.getByRole('button', { name: /Copiar comando dism \/online \/cleanup-image \/restorehealth/ }).textContent()), 'plano B que funciona mostra Copiado!')

// ---- confirmação antes de limpar o atendimento
await p.locator('nav button').nth(1).click(); await p.waitForTimeout(500)
const reset = p.getByRole('button', { name: /Novo atendimento/ })
ok(await reset.isDisabled(), 'sem dados, limpar fica desligado')
await p.locator('input[type=checkbox]').nth(1).check(); await p.waitForTimeout(200)
await reset.click()
ok(await p.getByRole('alertdialog').isVisible(), 'pede confirmação antes de limpar')
await p.getByRole('button', { name: 'Cancelar' }).click()
ok(await p.locator('input[type=checkbox]').nth(1).isChecked(), 'Cancelar mantém as marcações')
ok(await reset.isVisible(), 'volta o botão original após cancelar')
await reset.click(); await p.getByRole('button', { name: /Sim, limpar tudo/ }).click(); await p.waitForTimeout(300)
ok(!(await p.locator('input[type=checkbox]').nth(1).isChecked()), 'Sim, limpar tudo apaga as marcações')
ok(await p.getByRole('alertdialog').count() === 0, 'confirmação some depois de limpar')

// ---- celular (toque): estrela, fechar, checkbox do relatório
const t = await (await b.newContext({ viewport: { width: 390, height: 800 }, hasTouch: true, isMobile: true })).newPage(); watch(t)
await t.goto(APP_URL); await t.waitForTimeout(500)
const star = await t.locator('.cmd-card button[aria-pressed]').first().boundingBox()
ok(star.width >= 44 && star.height >= 44, `estrela 44x44: ${Math.round(star.width)}x${Math.round(star.height)}`)
await t.locator('nav button').nth(1).click(); await t.waitForTimeout(400)
await t.locator('input[type=checkbox]').nth(1).check()
await t.getByRole('button', { name: /Gerar relatório/ }).click(); await t.waitForTimeout(400)
const x = await t.getByRole('button', { name: 'Fechar' }).boundingBox()
ok(x.width >= 44 && x.height >= 44, `fechar 44x44: ${Math.round(x.width)}x${Math.round(x.height)}`)
const cb = await t.locator('dialog input[type=checkbox]').first().boundingBox()
ok(cb.width >= 20 && cb.height >= 20, `checkbox do relatório 20px: ${Math.round(cb.width)}x${Math.round(cb.height)}`)
const fs = await t.locator('dialog pre').first().evaluate((e) => parseFloat(getComputedStyle(e).fontSize))
ok(fs >= 14, `pré-visualização com 14px ou mais: ${fs}`)
await t.keyboard.press('Escape')

// ---- histórico com registro corrompido: abre e mostra só os válidos
const good = { id: 'ok1', createdAt: new Date().toISOString(), client: 'Ana', machine: 'PC', status: 'resolvido', routeLabel: 'R', done: 1, total: 2, durationMs: 0, message: 'mensagem boa' }
const h = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage(); watch(h)
await h.addInitScript((list) => localStorage.setItem('katana-history', JSON.stringify(list)), [good, { id: 'ruim' }, null, 'x', { id: 'ruim2', createdAt: 'lixo', message: 'm' }])
await h.goto(APP_URL); await h.waitForTimeout(500)
await h.locator('nav button').nth(2).click(); await h.waitForTimeout(400)
ok(await h.locator('.history-card').count() === 1, 'histórico mostra só o registro válido')
ok(!/undefined/.test(await h.locator('main').textContent()), 'nenhum "undefined" na tela')

ok(errs.length === 0, 'sem erros de console: ' + errs.join(' | '))
console.log(`10-confiabilidade: ${pass} ok, ${fail} falhas`)
await b.close(); process.exit(fail ? 1 : 0)
