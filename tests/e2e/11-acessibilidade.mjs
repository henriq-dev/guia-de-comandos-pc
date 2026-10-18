import { createRequire } from 'node:module'
import { launchBrowser, APP_URL } from './_env.mjs'

const require = createRequire(import.meta.url)
const axePath = require.resolve('axe-core/axe.min.js')
let pass = 0
let fail = 0
const ok = (condition, message) => {
  if (condition) pass++
  else {
    fail++
    console.log(`FALHOU ${message}`)
  }
}
const record = {
  id: 'a11y-record',
  createdAt: new Date().toISOString(),
  client: 'Cliente Exemplo',
  machine: 'Notebook',
  status: 'resolvido',
  routeLabel: 'Manutenção completa',
  done: 1,
  total: 3,
  durationMs: 12000,
  message: 'Mensagem de atendimento de exemplo.'
}

const browser = await launchBrowser()
const errors = []
const watch = (page) => {
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error' && !/ERR_|Failed to load/.test(message.text())) errors.push(message.text())
  })
}
const visit = async (viewport = { width: 1280, height: 900 }, storageRecord) => {
  const page = await browser.newPage({ viewport, hasTouch: viewport.width < 500, isMobile: viewport.width < 500 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  watch(page)
  if (storageRecord) await page.addInitScript((value) => localStorage.setItem('katana-history', JSON.stringify([value])), storageRecord)
  await page.goto(APP_URL)
  await page.waitForTimeout(450)
  await page.addScriptTag({ path: axePath })
  return page
}
const scan = async (name, page) => {
  const result = await page.evaluate(async () => axe.run(document, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] }
  }))
  const violations = result.violations.map((violation) => `${violation.id} (${violation.impact}, ${violation.nodes.length} elemento(s))`)
  ok(violations.length === 0, `${name}: ${violations.join('; ')}`)
  if (violations.length) console.log(`FALHOU detalhes axe ${name}: ${JSON.stringify(result.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary?.split('\n').slice(0, 3).join(' ') ?? '' })) })))}`)
  console.log(`${name}: ${violations.length} violações, ${result.incomplete.length} verificações manuais/inconclusivas`)
}
const active = (page) => page.evaluate(() => {
  const el = document.activeElement
  return { tag: el?.tagName, text: (el?.innerText || el?.getAttribute('aria-label') || el?.id || '').trim(), role: el?.getAttribute('role'), focusVisible: !!el?.matches(':focus-visible') }
})

// Guia: teclado, título no accessibility tree e axe.
const page = await visit()
await page.keyboard.press('Tab')
let focus = await active(page)
ok(focus.tag === 'BUTTON' && focus.focusVisible, `primeiro Tab leva a controle com foco visível: ${JSON.stringify(focus)}`)
const ax = await page.context().newCDPSession(page)
await ax.send('Accessibility.enable')
const tree = await ax.send('Accessibility.getFullAXTree')
ok(tree.nodes.some((node) => node.role?.value === 'heading' && node.name?.value === 'Técnico Henrique'), 'árvore de acessibilidade expõe o h1 com nome')
await scan('Guia desktop', page)

// Roteiro e caixa de confirmação: selecionar por Espaço, foco no diálogo inline e restauração ao cancelar.
const routeTab = page.locator('nav button').nth(1)
await routeTab.focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(250)
const firstCheck = page.locator('input[type="checkbox"]').first()
await firstCheck.focus(); await page.keyboard.press('Space')
ok(await firstCheck.isChecked(), 'checkbox do roteiro pode ser marcado por Espaço')
await scan('Roteiro desktop', page)
const reset = page.getByRole('button', { name: /Novo atendimento/ })
await reset.focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(100)
focus = await active(page)
ok(focus.text.includes('Sim, limpar tudo'), `foco vai para a ação principal da confirmação: ${JSON.stringify(focus)}`)
await scan('Confirmação de limpeza', page)
const confirmTree = await ax.send('Accessibility.getFullAXTree')
ok(confirmTree.nodes.some((node) => node.role?.value === 'alertdialog' && node.name?.value === 'Confirmar limpeza do atendimento'), 'árvore acessível nomeia a confirmação destrutiva')
await page.keyboard.press('Tab'); await page.keyboard.press('Enter'); await page.waitForTimeout(100)
focus = await active(page)
ok(focus.text.includes('Novo atendimento'), `Cancelar devolve foco ao botão de origem: ${JSON.stringify(focus)}`)

// Confirmar limpeza move foco para o checklist, que continua a tarefa de teclado.
await reset.focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(100); await page.keyboard.press('Enter'); await page.waitForTimeout(120)
focus = await active(page)
ok(focus.tag === 'INPUT' && focus.focusVisible, `limpeza confirmada move foco ao primeiro procedimento: ${JSON.stringify(focus)}`)
await firstCheck.focus(); await page.keyboard.press('Space')
const generate = page.getByRole('button', { name: /Gerar relatório/ })
await generate.focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(250)
ok(await page.locator('dialog[open]').count() === 1, 'relatório abre por teclado')
focus = await active(page)
ok(focus.text === 'Fechar', `diálogo nativo inicia com foco no botão fechar: ${JSON.stringify(focus)}`)
await scan('Diálogo de relatório', page)
const reportTree = await ax.send('Accessibility.getFullAXTree')
ok(reportTree.nodes.some((node) => node.role?.value === 'dialog' && node.name?.value === 'Relatório para o cliente'), 'árvore acessível nomeia o diálogo do relatório')
ok(reportTree.nodes.some((node) => node.role?.value === 'region' && node.name?.value === 'Pré-visualização da mensagem'), 'árvore acessível nomeia a pré-visualização rolável')
await page.keyboard.press('Escape'); await page.waitForTimeout(120)
focus = await active(page)
ok(focus.text.includes('Gerar relatório'), `Escape fecha o diálogo e devolve foco ao acionador: ${JSON.stringify(focus)}`)

// Prévia longa: região rolável recebe foco e responde à tecla End.
await generate.click(); await page.waitForTimeout(150)
await page.getByLabel('Observações').fill('Observação longa para validar rolagem por teclado. '.repeat(140))
const preview = page.getByRole('region', { name: 'Pré-visualização da mensagem' })
const dimensions = await preview.evaluate((el) => ({ scrollHeight: el.scrollHeight, clientHeight: el.clientHeight }))
ok(dimensions.scrollHeight > dimensions.clientHeight, `prévia de teste tem conteúdo rolável: ${JSON.stringify(dimensions)}`)
await preview.focus(); await page.keyboard.press('PageDown'); await page.keyboard.press('ArrowDown'); await page.waitForTimeout(80)
const previewState = await preview.evaluate((el) => ({ scrollTop: el.scrollTop, scrollHeight: el.scrollHeight, clientHeight: el.clientHeight, overflowY: getComputedStyle(el).overflowY, focused: document.activeElement === el }))
ok(previewState.scrollTop > 0, `região de mensagem rola com teclado: ${JSON.stringify(previewState)}`)
await page.keyboard.press('Escape')

// Histórico vazio e com dados: axe e foco das duas confirmações destrutivas.
await page.locator('nav button').nth(2).click(); await page.waitForTimeout(220)
await scan('Histórico vazio', page)
const history = await visit({ width: 1280, height: 900 }, record)
await history.locator('nav button').nth(2).click(); await history.waitForTimeout(180)
await scan('Histórico com registro', history)
const clear = history.getByRole('button', { name: /Limpar histórico/ })
await clear.focus(); await history.keyboard.press('Enter'); await history.waitForTimeout(80)
focus = await active(history)
ok(focus.text.includes('Sim, apagar'), `limpar histórico foca ação principal: ${JSON.stringify(focus)}`)
await history.keyboard.press('Tab'); await history.keyboard.press('Enter'); await history.waitForTimeout(80)
focus = await active(history)
ok(focus.text.includes('Limpar histórico'), `cancelar limpeza restaura foco: ${JSON.stringify(focus)}`)
await clear.focus(); await history.keyboard.press('Enter'); await history.waitForTimeout(80)
await history.keyboard.press('Enter'); await history.waitForTimeout(120)
focus = await active(history)
ok(focus.text.includes('Ir para o Roteiro'), `apagar histórico move foco para a tela vazia: ${JSON.stringify(focus)}`)

const deletion = await visit({ width: 1280, height: 900 }, record)
await deletion.locator('nav button').nth(2).click(); await deletion.waitForTimeout(180)
const deleteTrigger = deletion.getByRole('button', { name: /^Excluir$/ })
await deleteTrigger.focus(); await deletion.keyboard.press('Enter'); await deletion.waitForTimeout(80)
focus = await active(deletion)
ok(focus.text.includes('Sim, excluir'), `excluir registro foca confirmação: ${JSON.stringify(focus)}`)
await deletion.keyboard.press('Tab'); await deletion.keyboard.press('Enter'); await deletion.waitForTimeout(80)
focus = await active(deletion)
ok(focus.text.includes('Excluir'), `cancelar exclusão restaura foco: ${JSON.stringify(focus)}`)
await deleteTrigger.focus(); await deletion.keyboard.press('Enter'); await deletion.waitForTimeout(80)
await deletion.keyboard.press('Enter'); await deletion.waitForTimeout(120)
focus = await active(deletion)
ok(focus.text.includes('Ir para o Roteiro'), `excluir último registro move foco para estado vazio: ${JSON.stringify(focus)}`)

// Largura estreita, relatório rolável e avisos de instalação/offline.
const mobile = await visit({ width: 320, height: 700 })
await scan('Guia 320 px', mobile)
await mobile.locator('nav button').nth(1).click(); await mobile.waitForTimeout(180)
await scan('Roteiro 320 px', mobile)
await mobile.locator('input[type="checkbox"]').first().check()
await mobile.getByRole('button', { name: /Gerar relatório/ }).click(); await mobile.waitForTimeout(180)
await scan('Relatório 320 px', mobile)

const pwa = await visit({ width: 390, height: 844 })
await pwa.evaluate(() => {
  const event = new Event('beforeinstallprompt', { cancelable: true })
  event.prompt = () => Promise.resolve()
  event.userChoice = Promise.resolve({ outcome: 'accepted', platform: 'web' })
  window.dispatchEvent(event)
})
await pwa.waitForTimeout(150)
await scan('Aviso de instalação PWA', pwa)
const pwaAx = await pwa.context().newCDPSession(pwa)
await pwaAx.send('Accessibility.enable')
const pwaTree = await pwaAx.send('Accessibility.getFullAXTree')
ok(pwaTree.nodes.some((node) => node.role?.value === 'region' && node.name?.value === 'Instalar aplicativo'), 'árvore acessível nomeia o convite PWA')
await pwa.evaluate(() => window.dispatchEvent(new Event('offline'))); await pwa.waitForTimeout(150)
await scan('Aviso offline PWA', pwa)

ok(errors.length === 0, `sem erros JavaScript: ${errors.join(' | ')}`)
console.log(`11-acessibilidade: ${pass} verificações aprovadas, ${fail} falhas`)
await browser.close()
process.exit(fail ? 1 : 0)
