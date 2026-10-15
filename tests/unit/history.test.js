import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  MAX_HISTORY, addRecord, removeRecord, filterRecords, formatDuration, formatClock,
  buildBackup, parseBackup, mergeRecords
} from '../../src/utils/history.js'

const rec = (i, extra = {}) => ({
  id: 'r' + i, createdAt: new Date(2026, 9, 1, 10, i).toISOString(), client: 'Cliente ' + i, machine: 'PC',
  status: 'resolvido', routeLabel: 'Rota', done: 2, total: 5, durationMs: 60000, message: 'msg ' + i, ...extra
})

test('addRecord põe o mais novo primeiro, não altera a lista original e respeita o limite', () => {
  const base = [rec(1)]
  const next = addRecord(base, { client: 'Novo', message: 'm' }, { id: 'x', now: new Date(2026, 9, 2) })
  assert.equal(next[0].id, 'x')
  assert.equal(base.length, 1)
  const cheia = Array.from({ length: MAX_HISTORY }, (_, i) => rec(i))
  assert.equal(addRecord(cheia, { message: 'm' }).length, MAX_HISTORY)
})

test('removeRecord e filterRecords', () => {
  assert.deepEqual(removeRecord([rec(1), rec(2)], 'r1').map((r) => r.id), ['r2'])
  const lista = [rec(1, { client: 'Ana' }), rec(2, { client: 'Bruno', machine: 'Dell' })]
  assert.equal(filterRecords(lista, 'dell').length, 1)
  assert.equal(filterRecords(lista, '  ').length, 2)
  assert.equal(filterRecords(lista, 'resolvido').length, 2) // busca também pelo texto da situação
})

test('formatDuration e formatClock', () => {
  assert.equal(formatDuration(0), 'menos de 1 min')
  assert.equal(formatDuration(754000), '12 min')
  assert.equal(formatDuration(4500000), '1h 15min')
  assert.equal(formatDuration('x'), 'menos de 1 min')
  assert.equal(formatClock(65000), '01:05')
  assert.equal(formatClock(3723000), '1:02:03')
  assert.equal(formatClock(-5), '00:00')
})

test('backup: ida e volta, validação e limpeza de campos', () => {
  const ok = parseBackup(buildBackup([rec(1), rec(2)]))
  assert.ok(ok.ok)
  assert.deepEqual(ok.records.map((r) => r.id), ['r1', 'r2'])
  assert.equal(parseBackup('não é json').ok, false)
  assert.equal(parseBackup('{"a":1}').ok, false)
  assert.equal(parseBackup(JSON.stringify({ app: 'outro', records: [rec(1)] })).ok, false)
  const sujo = parseBackup(JSON.stringify([rec(1, { phone: '69999999999', extra: 'x', client: 'A'.repeat(500) }), { id: 'x' }, null, rec(3, { createdAt: 'lixo' }), rec(4, { message: '' })]))
  assert.equal(sujo.records.length, 1)
  assert.equal(sujo.ignored, 4)
  assert.ok(!('phone' in sujo.records[0]) && !('extra' in sujo.records[0]), 'telefone e campos extras não entram')
  assert.equal(sujo.records[0].client.length, 120)
})

test('mergeRecords não repete ids, ordena do mais novo e respeita o limite', () => {
  assert.deepEqual(mergeRecords([rec(1), rec(3)], [rec(2), rec(3)]).map((r) => r.id), ['r3', 'r2', 'r1'])
  assert.equal(mergeRecords([], Array.from({ length: 60 }, (_, i) => rec(i))).length, MAX_HISTORY)
})
