import { launchBrowser, APP_URL, OUT, serveDir, DIST } from './_env.mjs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
const SP = OUT, BASE = APP_URL
const b = await launchBrowser()
const errs = []; let fails = 0
const ok = (c, n, extra = '') => { if (!c) fails++; console.log(c ? 'ok   ' : 'FALHOU', n, extra) }
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } })
const p = await ctx.newPage()
p.on('pageerror', e => errs.push(e.message))
p.on('console', m => { if (m.type() === 'error' && !/ERR_TUNNEL|404/.test(m.text())) errs.push(m.text()) })
await p.goto(BASE, { waitUntil: 'load' }); await p.waitForTimeout(1000)
await p.locator('nav button').nth(1).click(); await p.waitForTimeout(1000)

const progress = async () => (await p.locator('.glass .font-mono').first().textContent()).trim()
const pickRoute = async (label) => { await p.locator('fieldset label', { hasText: label }).click(); await p.waitForTimeout(900) }
const kickers = async () => p.locator('.step-card p').evaluateAll(els => els.filter(e => e.textContent.startsWith('Etapa')).map(e => e.textContent))

ok(await p.locator('input[name=rota]').count() === 4, '4 tipos de atendimento')
ok(await p.locator('input[name=rota]').first().isChecked(), 'padrão: Manutenção completa')
ok((await progress()).startsWith('0/15'), 'completo: 0/15', await progress())
ok(await p.locator('.step-card').count() === 6, 'completo: 6 etapas')
await p.screenshot({ path: `${SP}/shots/v22-desktop-roteiro.png` })

await pickRoute('Internet instável')
ok(await p.locator('.step-card').count() === 3, 'internet: 3 etapas')
ok((await progress()).startsWith('0/10'), 'internet: 0/10', await progress())
const k = await kickers()
ok(k[0].startsWith('Etapa 01 — Triagem da Conexão'), 'kicker da 1ª etapa', k[0])
ok(await p.locator('.step-card').nth(1).locator('button.inline-code', { hasText: 'ipconfig /release & ipconfig /renew' }).count() === 1, 'dica com código renderizado como <code>')

for (const i of [0, 1, 2]) await p.locator('input[type=checkbox]').nth(i).check()
ok((await progress()).startsWith('3/10 · 30%'), 'internet: 3/10 · 30%', await progress())

await p.getByRole('button', { name: 'Gerar relatório para o cliente' }).click()
await p.waitForSelector('dialog[open]'); await p.waitForTimeout(400)
const pre = await p.locator('dialog pre').textContent()
ok(pre.includes('Atendimento: Internet instável'), 'relatório traz o tipo de atendimento')
ok(pre.includes('✅ Reinício do roteador e do modem'), 'relatório traz procedimento da rota')
ok(!pre.includes('Limpeza de arquivos temporários'), 'relatório não traz procedimentos de outra rota')
ok((await p.locator('dialog legend').textContent()).includes('(3)'), 'dialog conta 3 procedimentos')
ok(!(await p.locator('dialog').textContent()).includes('Limpeza de arquivos temporários'), 'checklist do dialog só lista a rota atual')
await p.keyboard.press('Escape'); await p.waitForTimeout(200)

await pickRoute('Computador lento')
ok(await p.locator('.step-card').count() === 5, 'lentidão: 5 etapas')
ok((await progress()).startsWith('0/12'), 'lentidão: marcações da internet não contam', await progress())
const k2 = await kickers()
ok(k2[4].startsWith('Etapa 05 — Validação & Encerramento'), 'numeração segue a posição na rota', k2[4])

await pickRoute('Tela azul')
ok(await p.locator('.step-card').count() === 6, 'tela azul: 6 etapas')
ok((await progress()).startsWith('0/15'), 'tela azul: 0/15', await progress())

await pickRoute('Internet instável')
ok((await progress()).startsWith('3/10'), 'voltar à internet restaura as 3 marcações', await progress())

// teclado: setas mudam a rota
await p.locator('input[name=rota]').nth(2).focus()
await p.keyboard.press('ArrowDown'); await p.waitForTimeout(700)
ok(await p.locator('input[name=rota]').nth(3).isChecked(), 'seta do teclado troca a rota')
ok(await p.locator('.step-card').count() === 6, 'e a lista de etapas acompanha')

// persistência da rota
await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(1000)
ok(await p.locator('input[name=rota]').nth(3).isChecked(), 'rota persiste após recarregar')
ok(await p.locator('.step-card').count() === 6, 'etapas da rota persistida')

// novo atendimento limpa marcações de todas as rotas
await pickRoute('Internet instável')
await p.getByRole('button', { name: /Novo atendimento/ }).click(); await p.waitForTimeout(400)
ok((await progress()).startsWith('0/10'), 'novo atendimento zera a rota atual')
await pickRoute('Manutenção completa')
ok((await p.locator('input[type=checkbox]:checked').count()) === 0, 'e nenhuma marcação sobra nas outras rotas')

// rota salva inválida cai na primeira
await p.evaluate(() => localStorage.setItem('katana-route', JSON.stringify('rota-que-nao-existe')))
await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(1000)
ok(await p.locator('input[name=rota]').first().isChecked(), 'id de rota inválido cai em Manutenção completa')

// celular
const m = await b.newContext({ viewport: { width: 390, height: 844 } })
const mp = await m.newPage(); mp.on('pageerror', e => errs.push('MOBILE ' + e.message))
await mp.goto(BASE, { waitUntil: 'load' }); await mp.waitForTimeout(900)
await mp.locator('nav button').nth(1).click(); await mp.waitForTimeout(1000)
ok(!(await mp.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)), 'celular: sem scroll lateral')
const cols = await mp.locator('label:has(input[name=rota])').evaluateAll(els => new Set(els.map(e => Math.round(e.getBoundingClientRect().left))).size)
ok(cols === 2, 'celular: seletor em 2 colunas compactas', cols + ' coluna(s)')
await mp.screenshot({ path: `${SP}/shots/v22-mobile-roteiro.png` })
// 320px
const s = await b.newContext({ viewport: { width: 320, height: 700 } })
const sp = await s.newPage(); await sp.goto(BASE, { waitUntil: 'load' }); await sp.waitForTimeout(800)
await sp.locator('nav button').nth(1).click(); await sp.waitForTimeout(800)
ok(!(await sp.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)), '320 px: sem scroll lateral')

console.log('erros de console:', errs.length ? errs : 'nenhum', '| falhas:', fails)
await b.close()
