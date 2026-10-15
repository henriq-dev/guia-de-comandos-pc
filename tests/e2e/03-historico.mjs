import { launchBrowser, APP_URL, OUT, serveDir, DIST } from './_env.mjs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
const SP = OUT, BASE = APP_URL
const b = await launchBrowser()
const errs = []; let fails = 0
const ok = (c, n, extra = '') => { if (!c) fails++; console.log(c ? 'ok   ' : 'FALHOU', n, extra) }
const watch = (page, tag = '') => {
  page.on('pageerror', e => errs.push(tag + e.message))
  page.on('console', m => { if (m.type() === 'error' && !/ERR_TUNNEL|404/.test(m.text())) errs.push(tag + m.text()) })
}

// ---------- fluxo completo (desktop) ----------
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] })
const p = await ctx.newPage(); watch(p)
await p.goto(BASE, { waitUntil: 'load' }); await p.waitForTimeout(900)
const tab = (i) => p.locator('nav button').nth(i)
ok(await p.locator('nav button').count() === 3, 'navegação com 3 abas')

await tab(2).click(); await p.waitForTimeout(600)
ok(await p.getByText('Nenhum atendimento salvo ainda').count() === 1, 'histórico vazio mostra a tela vazia')
await p.getByRole('button', { name: 'Ir para o Roteiro' }).click(); await p.waitForTimeout(900)
ok(await p.locator('input[name=rota]').count() === 4, 'botão leva ao Roteiro')

await p.locator('label:has(input[name=rota])', { hasText: 'Internet instável' }).click(); await p.waitForTimeout(700)
for (const i of [0, 1, 2]) await p.locator('input[type=checkbox]').nth(i).check()
await p.getByRole('button', { name: 'Gerar relatório para o cliente' }).click()
await p.waitForSelector('dialog[open]'); await p.waitForTimeout(400)
await p.fill('#rep-client', 'Maria Souza'); await p.fill('#rep-phone', '(69) 99123-4567')
await p.fill('#rep-machine', 'Notebook Dell'); await p.selectOption('#rep-status', 'parcial')
const saveBtn = p.locator('dialog footer button').first()
ok(/Salvar/.test(await saveBtn.textContent()) && await saveBtn.isEnabled(), 'botão Salvar disponível')
const msg1 = await p.locator('dialog pre').textContent()
await saveBtn.click(); await p.waitForTimeout(300)
ok((await saveBtn.textContent()).includes('Salvo') && await saveBtn.isDisabled(), 'depois de salvar: "Salvo" e desabilitado (sem duplicar)')
ok((await p.locator('dialog').textContent()).includes('Salvo no histórico.'), 'aviso "Salvo no histórico"')
ok(await tab(2).textContent().then(t => t.includes('1')), 'contador 1 aparece na aba Histórico')
const stored = await p.evaluate(() => localStorage.getItem('katana-history'))
ok(!stored.includes('99123') && !stored.includes('5569'), 'telefone NÃO foi salvo no histórico')
await p.fill('#rep-notes', 'Trocar HD'); await p.waitForTimeout(200)
ok(await saveBtn.isEnabled(), 'mudou algo: Salvar volta a valer')
await p.fill('#rep-notes', ''); await p.waitForTimeout(200)
ok(await saveBtn.isDisabled(), 'voltou ao texto salvo: continua desabilitado')

await p.getByRole('button', { name: 'Ver histórico' }).click(); await p.waitForTimeout(900)
ok(await p.locator('dialog[open]').count() === 0, '"Ver histórico" fecha o dialog')
ok(await p.locator('.history-card').count() === 1, 'histórico mostra 1 registro')
const card = p.locator('.history-card').first()
const ct = await card.textContent()
ok(ct.includes('Maria Souza') && ct.includes('Notebook Dell'), 'card traz cliente e equipamento')
ok(ct.includes('Internet instável') && ct.includes('3 de 9 procedimentos'), 'card traz o tipo e "3 de 9"', (ct.match(/\d de \d procedimentos/) || [''])[0])
ok(ct.includes('Parcialmente resolvido') && / às \d\d:\d\d/.test(ct), 'card traz situação e data com hora')

await card.getByText('Ver mensagem').click(); await p.waitForTimeout(200)
ok((await card.locator('pre').textContent()) === msg1, 'mensagem salva = mensagem gerada')
await card.getByRole('button', { name: /Copiar/ }).click(); await p.waitForTimeout(200)
ok((await card.textContent()).includes('Copiado!') && (await p.evaluate(() => navigator.clipboard.readText())) === msg1, 'copiar leva a mensagem salva')
ok((await card.getByRole('link', { name: /WhatsApp/ }).getAttribute('href')).startsWith('https://wa.me/?text='), 'WhatsApp abre o seletor de contato')

// segundo registro
await tab(1).click(); await p.waitForTimeout(700)
await p.getByRole('button', { name: 'Gerar relatório para o cliente' }).click()
await p.waitForSelector('dialog[open]'); await p.waitForTimeout(400)
await p.fill('#rep-client', 'João Pedro')
await p.locator('dialog footer button').first().click(); await p.waitForTimeout(200)
await p.getByRole('button', { name: 'Ver histórico' }).click(); await p.waitForTimeout(900)
ok(await p.locator('.history-card').count() === 2, '2 registros')
ok((await p.locator('.history-card h3').first().textContent()) === 'João Pedro', 'mais recente no topo')
ok((await tab(2).textContent()).includes('2'), 'contador 2')

// busca
await p.fill('#busca-historico', 'maria'); await p.waitForTimeout(200)
ok(await p.locator('.history-card').count() === 1, 'busca "maria" → 1')
await p.fill('#busca-historico', 'zzzz'); await p.waitForTimeout(200)
ok(await p.getByText('Nenhum atendimento encontrado para essa busca.').count() === 1, 'busca sem resultado avisa')
await p.fill('#busca-historico', '')

// excluir com confirmação
await p.locator('.history-card').first().getByRole('button', { name: 'Excluir' }).click(); await p.waitForTimeout(200)
ok(await p.getByText('Excluir este registro?').count() === 1, 'excluir pede confirmação')
await p.getByRole('button', { name: 'Cancelar' }).click(); await p.waitForTimeout(200)
ok(await p.locator('.history-card').count() === 2, 'cancelar mantém o registro')
await p.locator('.history-card').first().getByRole('button', { name: 'Excluir' }).click()
await p.getByRole('button', { name: 'Sim, excluir' }).click(); await p.waitForTimeout(300)
ok(await p.locator('.history-card').count() === 1 && (await p.locator('.history-card h3').first().textContent()) === 'Maria Souza', 'confirmar exclui só o escolhido')

// persistência
await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(900)
ok(await p.locator('.history-card').count() === 1, 'registro e aba persistem após recarregar')

// limpar tudo
await p.getByRole('button', { name: 'Limpar histórico' }).click()
ok(await p.getByText('Apagar todo o histórico?').count() === 1, 'limpar pede confirmação')
await p.getByRole('button', { name: 'Sim, apagar' }).click(); await p.waitForTimeout(400)
ok(await p.getByText('Nenhum atendimento salvo ainda').count() === 1, 'limpar volta à tela vazia')
ok(!(await tab(2).textContent()).match(/\d/), 'contador some da aba')

// dado corrompido não quebra
await p.evaluate(() => { localStorage.setItem('katana-history', JSON.stringify('abc')); localStorage.setItem('katana-page', JSON.stringify('xyz')) })
await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(900)
ok(await p.locator('.cmd-card').count() === 13, 'página salva inválida cai em Comandos')
await tab(2).click(); await p.waitForTimeout(500)
ok(await p.getByText('Nenhum atendimento salvo ainda').count() === 1, 'histórico corrompido vira lista vazia')

// ---------- larguras: navegação e histórico sem estourar ----------
const seed = (n) => JSON.stringify(Array.from({ length: n }, (_, i) => ({
  id: 'seed' + i, createdAt: new Date(2026, 9, 14 - i, 13, 54).toISOString(),
  client: i === 0 ? 'Maria Aparecida dos Santos Albuquerque Figueiredo Lima' : ['João Pedro', 'Ana Clara'][i % 2],
  machine: i === 0 ? 'Notebook Dell Inspiron 15 3000 Série com 8 GB de memória e SSD' : 'PC Gamer',
  status: ['parcial', 'resolvido', 'acompanhar'][i % 3], routeLabel: ['Internet instável', 'Computador lento', 'Tela azul e travamentos'][i % 3],
  done: 4 + i, total: 10, message: '*Relatório de Atendimento — Técnico Henrique*\n\nCliente: Teste\n\n✅ Exemplo de procedimento'
})))
for (const w of [320, 360, 390, 768, 1280]) {
  const c = await b.newContext({ viewport: { width: w, height: 800 } })
  await c.addInitScript(([s]) => { localStorage.setItem('katana-history', s); localStorage.setItem('katana-page', JSON.stringify('historico')) }, [seed(3)])
  const q = await c.newPage(); watch(q, `W${w} `)
  await q.goto(BASE, { waitUntil: 'load' }); await q.waitForTimeout(1100)
  const overflow = await q.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  const navOk = await q.locator('nav button').evaluateAll((els, vw) => els.every(e => { const r = e.getBoundingClientRect(); return r.left >= 0 && r.right <= vw }), w)
  const cards = await q.locator('.history-card').count()
  ok(!overflow && navOk && cards === 3, `${w}px: sem scroll lateral, 3 abas à vista, 3 cards`, `overflow=${overflow} nav=${navOk} cards=${cards}`)
  if (w === 390) await q.screenshot({ path: `${SP}/shots/v23-mobile-historico.png` })
  if (w === 1280) await q.screenshot({ path: `${SP}/shots/v23-desktop-historico.png` })
  await c.close()
}

// dialog no celular com os 3 botões
const m = await b.newContext({ viewport: { width: 390, height: 844 } })
const mp = await m.newPage(); watch(mp, 'M ')
await mp.goto(BASE, { waitUntil: 'load' }); await mp.waitForTimeout(800)
await mp.locator('nav button').nth(1).click(); await mp.waitForTimeout(800)
await mp.locator('input[type=checkbox]').nth(0).check()
await mp.getByRole('button', { name: 'Gerar relatório para o cliente' }).click()
await mp.waitForSelector('dialog[open]'); await mp.waitForTimeout(500)
const btns = await mp.locator('dialog footer > *').evaluateAll(els => els.map(e => { const r = e.getBoundingClientRect(); return { l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top), b: Math.round(r.bottom) } }))
ok(btns.length === 3 && btns.every(x => x.l >= 0 && x.r <= 390 && x.b <= 844), 'dialog no celular: 3 botões dentro da tela', JSON.stringify(btns))
await mp.screenshot({ path: `${SP}/shots/v23-mobile-dialog.png` })

console.log('erros de console:', errs.length ? errs : 'nenhum', '| falhas:', fails)
await b.close()
