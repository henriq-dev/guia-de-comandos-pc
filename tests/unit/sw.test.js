// ÂNCORA: o service worker não pode perder o modo offline por causa de um arquivo opcional que faltou no deploy.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const sw = readFileSync(new URL('../../public/sw.js', import.meta.url), 'utf-8')

test('precache: JS e CSS são essenciais; manifest e ícones são opcionais (allSettled)', () => {
  assert.match(sw, /cache\.addAll\(assets\)/, 'arquivos do site continuam essenciais')
  assert.match(sw, /Promise\.allSettled/, 'opcionais não derrubam a instalação')
  assert.ok(!/addAll\(\[\s*\.\.\.assets/.test(sw), 'ícones não podem ficar no mesmo addAll dos essenciais')
})
