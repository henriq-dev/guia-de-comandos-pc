import { test } from 'node:test'
import assert from 'node:assert/strict'
import { commands, categories } from '../../src/data/commands.js'
import { allSteps } from '../../src/data/steps.js'
import { routes, getRouteSteps } from '../../src/data/routes.js'

// ÂNCORA: estes testes protegem o CONTEÚDO. Se você editar commands.js, steps.js ou routes.js
// e errar um id, esquecer um campo ou apontar para algo que não existe, eles avisam.

test('comandos: ids únicos, campos obrigatórios e categorias existentes', () => {
  const ids = commands.map((c) => c.id)
  assert.equal(new Set(ids).size, ids.length, 'ids de comandos repetidos')
  const valid = new Set(categories.map((c) => c.id))
  for (const c of commands) {
    for (const field of ['title', 'description', 'code', 'guide']) assert.ok(c[field]?.trim(), `${c.id}: falta ${field}`)
    assert.ok(c.categories.length > 0 && c.categories.every((x) => valid.has(x)), `${c.id}: categoria inválida`)
  }
})

test('etapas: ids únicos (etapas e itens) e itens completos', () => {
  const stepIds = allSteps.map((s) => s.id)
  assert.equal(new Set(stepIds).size, stepIds.length, 'ids de etapas repetidos')
  const itemIds = allSteps.flatMap((s) => s.items.map((i) => i.id))
  assert.equal(new Set(itemIds).size, itemIds.length, 'ids de itens repetidos')
  for (const s of allSteps) {
    assert.ok(s.phase && s.title && s.intro, `${s.id}: falta fase, título ou introdução`)
    assert.ok(Number.isInteger(s.minutes) && s.minutes > 0, `${s.id}: minutes inválido`)
    for (const i of s.items) {
      assert.ok(i.lead && i.text, `${i.id}: falta lead ou text`)
      assert.ok(i.report === null || (typeof i.report === 'string' && i.report.trim()), `${i.id}: report precisa ser frase ou null`)
      assert.equal((i.text.match(/`/g) ?? []).length % 2, 0, `${i.id}: crases desbalanceadas`)
    }
    if (s.tip) assert.equal((s.tip.match(/`/g) ?? []).length % 2, 0, `${s.id}: crases desbalanceadas na dica`)
  }
})

test('rotas: ids únicos e todas as etapas existem', () => {
  assert.equal(new Set(routes.map((r) => r.id)).size, routes.length)
  for (const r of routes) {
    assert.ok(r.label && r.description && r.icon, `${r.id}: falta label, descrição ou ícone`)
    const steps = getRouteSteps(r)
    assert.ok(steps.length > 0 && steps.every(Boolean), `${r.id}: etapa inexistente`)
    assert.equal(new Set(r.stepIds).size, r.stepIds.length, `${r.id}: etapa repetida na rota`)
  }
})

test('botão "Ver no Guia": todo termo encontra ao menos um comando', () => {
  const texts = commands.map((c) => `${c.title} ${c.description} ${c.code}`.toLowerCase())
  for (const item of allSteps.flatMap((s) => s.items).filter((i) => i.guide)) {
    assert.ok(texts.some((t) => t.includes(item.guide.toLowerCase())), `${item.id}: "${item.guide}" não acha nenhum comando`)
  }
})

test('conteúdo: comandos críticos e tempos mantêm ressalvas de segurança', () => {
  const byId = Object.fromEntries(commands.map((c) => [c.id, c]))
  assert.match(byId.revert.code, /\/image:/i)
  assert.doesNotMatch(byId.revert.code, /\/online/i)
  assert.match(byId.dism.guide, /Get-ImageInfo/)
  assert.match(byId['temp-sys'].code, /%windir%\\Temp/i)
  assert.match(byId.chkdsk.guide, /backup/i)
  assert.match(byId['chkdsk-ssd'].guide, /não há base para proibi-lo genericamente/i)
  assert.doesNotMatch(byId['chkdsk-ssd'].guide, /gasta o SSD sem benefício/i)
  assert.ok(routes.every((route) => route.timeNote?.includes('Soma nominal') || route.timeNote?.includes('Soma nominal,')))
  assert.match(routes.find((route) => route.id === 'tela-azul').timeNote, /não prazo/i)
})
