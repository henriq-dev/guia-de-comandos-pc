// ÂNCORA: a pré-visualização do link (WhatsApp, Telegram, redes sociais) depende destas tags e da imagem de capa.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf-8')
const meta = (prop) => html.match(new RegExp(`<meta (?:property|name)="${prop}" content="([^"]*)"`))?.[1]

test('tags Open Graph completas e com endereço absoluto', () => {
  for (const p of ['og:title', 'og:description', 'og:type', 'og:url', 'og:image', 'twitter:card']) assert.ok(meta(p), `falta ${p}`)
  assert.match(meta('og:image'), /^https:\/\/.+\/og-image\.png$/)
  assert.match(meta('og:url'), /^https:\/\//)
})

test('imagem de capa existe, é PNG 1200x630 e tem menos de 300 KB', () => {
  const png = readFileSync(new URL('../../public/og-image.png', import.meta.url))
  assert.equal(png.subarray(1, 4).toString(), 'PNG')
  assert.equal(png.readUInt32BE(16), 1200)
  assert.equal(png.readUInt32BE(20), 630)
  assert.ok(png.length < 300 * 1024)
})
