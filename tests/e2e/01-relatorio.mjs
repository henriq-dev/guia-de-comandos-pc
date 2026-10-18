import { launchBrowser, APP_URL, OUT, serveDir, DIST } from './_env.mjs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
const SP = OUT
const BASE = APP_URL
const b = await launchBrowser()
const errs = []
let fails = 0
const ok = (c, n, extra = '') => { if (!c) fails++; console.log(c ? 'ok   ' : 'FALHOU', n, extra) }

const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] })
const p = await ctx.newPage()
p.on('pageerror', e => errs.push(e.message))
p.on('console', m => { if (m.type() === 'error' && !/ERR_TUNNEL|404/.test(m.text())) errs.push(m.text()) })
await p.goto(BASE, { waitUntil: 'load' })
await p.waitForTimeout(1200)
await p.locator('nav button').nth(1).click()
await p.waitForTimeout(1200)

const gen = p.getByRole('button', { name: 'Gerar relatório para o cliente' })
ok(await gen.isDisabled(), 'botão desabilitado sem procedimentos marcados')

await p.locator('input[type=checkbox]').nth(2).check()
await p.locator('input[type=checkbox]').nth(3).check()
await p.locator('input[type=checkbox]').nth(10).check() // s4-sfc (9º checkbox)
ok(await gen.isEnabled(), 'botão habilita ao marcar')
await gen.click()
await p.waitForSelector('dialog[open]')
await p.waitForTimeout(500)

await p.fill('#rep-client', 'Maria Souza')
await p.fill('#rep-phone', '(69) 99123-4567')
await p.fill('#rep-machine', 'Notebook Dell')
await p.selectOption('#rep-status', 'parcial')
await p.fill('#rep-notes', 'Recomendado trocar o HD por SSD.')

const pre = await p.locator('dialog pre').textContent()
ok(pre.includes('Cliente: Maria Souza'), 'prévia traz o cliente')
ok(pre.includes('✅ Verificação do disco e do espaço livre'), 'prévia traz o procedimento 1')
ok(pre.includes('✅ Verificação e reparo dos arquivos do sistema (SFC)'), 'prévia traz o SFC')
ok(pre.includes('*Situação:* Parcialmente resolvido'), 'prévia traz a situação')
ok(pre.includes('Recomendado trocar o HD por SSD.'), 'prévia traz a observação')
ok((await p.locator('dialog legend').textContent()).includes('(3)'), 'contador de procedimentos = 3')

const href = await p.getByRole('link', { name: 'Abrir no WhatsApp' }).getAttribute('href')
ok(href.startsWith('https://wa.me/5569991234567?text='), 'link com telefone normalizado')
ok(decodeURIComponent(href.split('?text=')[1]) === pre, 'texto do link = texto da prévia')

await p.locator('dialog input[type=checkbox]').nth(1).uncheck()
ok(!(await p.locator('dialog pre').textContent()).includes('Verificação do disco e do espaço livre'), 'desmarcar no modal remove da prévia')
await p.locator('dialog input[type=checkbox]').nth(1).check()

await p.fill('#rep-phone', '123')
ok((await p.locator('dialog').textContent()).includes('Número incompleto'), 'aviso de telefone incompleto')
ok((await p.getByRole('link', { name: 'Abrir no WhatsApp' }).getAttribute('href')).startsWith('https://wa.me/?text='), 'sem telefone válido abre o seletor de contato')
await p.fill('#rep-phone', '(69) 99123-4567')

await p.getByRole('button', { name: 'Copiar mensagem' }).click()
await p.waitForTimeout(200)
ok((await p.locator('dialog').textContent()).includes('Copiado!'), 'botão mostra Copiado!')
ok((await p.evaluate(() => navigator.clipboard.readText())) === pre, 'área de transferência = mensagem')

await p.screenshot({ path: `${SP}/shots/v21-desktop-dialog.png` })

await p.keyboard.press('Escape')
await p.waitForTimeout(200)
ok(await p.locator('dialog[open]').count() === 0, 'Esc fecha o dialog')

await gen.click(); await p.waitForSelector('dialog[open]'); await p.waitForTimeout(400)
await p.mouse.click(8, 8)
await p.waitForTimeout(200)
ok(await p.locator('dialog[open]').count() === 0, 'clique no fundo escuro fecha')

await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(1200)
await p.getByRole('button', { name: 'Gerar relatório para o cliente' }).click()
await p.waitForSelector('dialog[open]'); await p.waitForTimeout(400)
ok((await p.inputValue('#rep-client')) === 'Maria Souza', 'cliente persiste após recarregar')
ok((await p.inputValue('#rep-phone')) === '', 'telefone NÃO persiste')
const stored = await p.evaluate(() => JSON.stringify(Object.fromEntries(Object.entries(localStorage))))
ok(!stored.includes('99123'), 'telefone ausente do localStorage')
await p.keyboard.press('Escape')

await p.getByRole('button', { name: /Novo atendimento/ }).click(); await p.getByRole('button', { name: /Sim, limpar tudo/ }).click()
await p.waitForTimeout(300)
ok(await p.getByRole('progressbar').getAttribute('aria-valuenow') === '0', 'novo atendimento zera o progresso')
ok(await p.getByRole('button', { name: 'Gerar relatório para o cliente' }).isDisabled(), 'e desabilita o relatório')

const m = await b.newContext({ viewport: { width: 390, height: 844 } })
const mp = await m.newPage()
mp.on('pageerror', e => errs.push('MOBILE ' + e.message))
await mp.goto(BASE, { waitUntil: 'load' }); await mp.waitForTimeout(1000)
await mp.locator('nav button').nth(1).click(); await mp.waitForTimeout(1000)
await mp.locator('input[type=checkbox]').nth(2).check()
await mp.getByRole('button', { name: 'Gerar relatório para o cliente' }).click()
await mp.waitForSelector('dialog[open]'); await mp.waitForTimeout(500)
const box = await mp.locator('dialog').boundingBox()
ok(box.x >= 0 && box.x + box.width <= 390, 'dialog cabe na largura do celular', JSON.stringify({ x: Math.round(box.x), w: Math.round(box.width) }))
ok(!(await mp.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)), 'sem scroll lateral com o dialog aberto')
ok(box.y >= 0 && box.y + box.height <= 844, 'dialog cabe na altura do celular', JSON.stringify({ y: Math.round(box.y), h: Math.round(box.height) }))
await mp.screenshot({ path: `${SP}/shots/v21-mobile-dialog.png` })

console.log('erros de console:', errs.length ? errs : 'nenhum', '| falhas:', fails)
await b.close()
