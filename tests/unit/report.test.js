import { test } from 'node:test'
import assert from 'node:assert/strict'
import { allSteps } from '../../src/data/steps.js'
import { getReportItems, buildMessage, normalizePhone, buildWhatsAppLink } from '../../src/utils/report.js'

test('getReportItems usa só itens marcados e ignora os sem frase para o cliente', () => {
  const p0 = allSteps.filter((s) => s.id === 'p0')
  const items = getReportItems(p0, ['p0-restauracao', 'p0-aviso'])
  assert.deepEqual(items, ['Criação de ponto de restauração antes das alterações'])
  assert.deepEqual(getReportItems(p0, []), [])
})

test('buildMessage monta o texto do WhatsApp', () => {
  const msg = buildMessage(
    { client: 'Maria Souza', machine: 'Notebook Dell', status: 'resolvido', notes: 'Trocar HD por SSD' },
    ['Limpeza de arquivos temporários'],
    { date: new Date(2026, 9, 15), routeLabel: 'Manutenção completa' }
  )
  assert.match(msg, /Cliente: Maria Souza/)
  assert.match(msg, /✅ Limpeza de arquivos temporários/)
  assert.match(msg, /Manutenção completa/)
  assert.match(msg, /Trocar HD por SSD/)
})

test('normalizePhone: Brasil com DDD, operadora e internacional', () => {
  assert.equal(normalizePhone('(69) 99123-4567'), '5569991234567')
  assert.equal(normalizePhone('069 99123-4567'), '5569991234567')
  assert.equal(normalizePhone('+55 69 99123-4567'), '5569991234567')
  assert.equal(normalizePhone('+351 912 345 678'), '351912345678') // não vira número do Brasil
  assert.equal(normalizePhone('+44 20 7946 0958'), '442079460958')
  for (const bad of ['', '123', 'abc', '+5569', '+12', '+0123456789']) assert.equal(normalizePhone(bad), '', `inválido: ${bad}`)
})

test('buildWhatsAppLink usa o número quando válido e o seletor de contato quando não', () => {
  assert.ok(buildWhatsAppLink('(69) 99123-4567', 'oi').startsWith('https://wa.me/5569991234567?text='))
  assert.ok(buildWhatsAppLink('', 'oi').startsWith('https://wa.me/?text='))
  assert.ok(buildWhatsAppLink('', 'a b&c').endsWith('a%20b%26c'))
})
