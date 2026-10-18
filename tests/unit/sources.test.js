// ÂNCORA: protege a qualidade das fontes. Só domínios oficiais, links https, sem repetição e ligados a comandos/etapas que existem.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { SOURCES, commandSources, stepSources } from '../../src/data/sources.js'
import { commands } from '../../src/data/commands.js'
import { allSteps } from '../../src/data/steps.js'

const ALLOWED = ['learn.microsoft.com', 'support.microsoft.com', 'crystalmark.info', 'www.seagate.com']

test('toda fonte tem rótulo, https e domínio oficial permitido', () => {
  for (const [key, s] of Object.entries(SOURCES)) {
    assert.ok(s.label && s.label.length > 10, `${key}: rótulo`)
    const u = new URL(s.url)
    assert.equal(u.protocol, 'https:', `${key}: https`)
    assert.ok(ALLOWED.includes(u.hostname), `${key}: domínio ${u.hostname} não permitido`)
  }
})

test('sem endereços repetidos e sem chave sobrando', () => {
  const urls = Object.values(SOURCES).map((s) => s.url)
  assert.equal(new Set(urls).size, urls.length, 'endereço repetido')
  const used = new Set([...Object.values(commandSources), ...Object.values(stepSources)].flat())
  for (const key of Object.keys(SOURCES)) assert.ok(used.has(key), `fonte "${key}" não é usada em nenhum comando ou etapa`)
})

test('todo id citado existe e toda chave citada está cadastrada', () => {
  const cmdIds = new Set(commands.map((c) => c.id))
  const stepIds = new Set(allSteps.map((s) => s.id))
  for (const [id, keys] of Object.entries(commandSources)) {
    assert.ok(cmdIds.has(id), `comando "${id}" não existe`)
    for (const k of keys) assert.ok(SOURCES[k], `chave "${k}" não cadastrada`)
  }
  for (const [id, keys] of Object.entries(stepSources)) {
    assert.ok(stepIds.has(id), `etapa "${id}" não existe`)
    for (const k of keys) assert.ok(SOURCES[k], `chave "${k}" não cadastrada`)
  }
})

test('todo comando do Guia foi avaliado (com fonte ou marcado sem fonte)', () => {
  for (const c of commands) assert.ok(c.id in commandSources, `comando "${c.id}" sem entrada em commandSources`)
})
