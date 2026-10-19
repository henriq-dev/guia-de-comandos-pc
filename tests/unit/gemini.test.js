// ÂNCORA: testes do núcleo do assistente de IA. A internet é trocada por uma resposta falsa (fetchImpl).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validateInput, buildRequest, extractText, diagnose, handleRequest, rateLimited, resetRateLimit, safeEqual, MAX_INPUT, DEFAULT_MODEL } from '../../server/gemini.js'

const okFetch = (text) => async () => ({ ok: true, status: 200, json: async () => ({ candidates: [{ content: { parts: [{ text }] } }] }) })

test('validateInput: aceita, corta espaços e recusa vazio, curto, longo e não-texto', () => {
  assert.deepEqual(validateInput('  0x0000007B  '), { ok: true, text: '0x0000007B' })
  assert.equal(validateInput('').ok, false)
  assert.equal(validateInput('ab').ok, false)
  assert.equal(validateInput(42).ok, false)
  assert.equal(validateInput('x'.repeat(MAX_INPUT + 1)).ok, false)
  assert.equal(validateInput('x'.repeat(MAX_INPUT)).ok, true)
})

test('buildRequest e extractText: formato do Gemini', () => {
  const r = buildRequest('erro')
  assert.equal(r.contents[0].parts[0].text, 'erro')
  assert.ok(r.systemInstruction.parts[0].text.includes('Windows'))
  assert.ok(r.generationConfig.maxOutputTokens <= 2000)
  assert.equal(extractText({ candidates: [{ content: { parts: [{ text: 'a' }, { text: 'b' }] } }] }), 'ab')
  assert.equal(extractText({}), '')
  assert.equal(extractText({ candidates: [{}] }), '')
})

test('diagnose: sucesso envia a chave só no cabeçalho e usa o modelo escolhido', async () => {
  let call
  const fetchImpl = async (url, init) => { call = { url, init }; return okFetch('Resposta')() }
  const r = await diagnose({ text: 'BSOD 0x7B', apiKey: 'SEGREDO', model: 'gemini-x', fetchImpl })
  assert.equal(r.status, 200)
  assert.equal(r.body.answer, 'Resposta')
  assert.ok(call.url.includes('/models/gemini-x:generateContent'))
  assert.ok(!call.url.includes('SEGREDO'), 'chave não vai na URL')
  assert.equal(call.init.headers['x-goog-api-key'], 'SEGREDO')
  assert.ok(!JSON.stringify(r.body).includes('SEGREDO'))
})

test('diagnose: erros viram mensagens claras e nunca repassam o corpo do provedor', async () => {
  assert.equal((await diagnose({ text: 'erro', apiKey: '', fetchImpl: okFetch('x') })).status, 503)
  assert.equal((await diagnose({ text: '', apiKey: 'k', fetchImpl: okFetch('x') })).status, 400)
  const f = (status) => async () => ({ ok: false, status, json: async () => ({ error: 'DETALHE SECRETO' }) })
  const r429 = await diagnose({ text: 'erro', apiKey: 'k', fetchImpl: f(429) })
  assert.equal(r429.status, 502); assert.match(r429.body.error, /Limite/)
  const r403 = await diagnose({ text: 'erro', apiKey: 'k', fetchImpl: f(403) })
  assert.match(r403.body.error, /GEMINI_API_KEY/)
  assert.ok(!JSON.stringify(r403.body).includes('SECRETO'))
  const rNet = await diagnose({ text: 'erro', apiKey: 'k', fetchImpl: async () => { throw new Error('rede') } })
  assert.equal(rNet.status, 504)
  const rEmpty = await diagnose({ text: 'erro', apiKey: 'k', fetchImpl: async () => ({ ok: true, json: async () => ({ candidates: [] }) }) })
  assert.equal(rEmpty.status, 502)
  const rBad = await diagnose({ text: 'erro', apiKey: 'k', fetchImpl: async () => ({ ok: true, json: async () => { throw new Error('x') } }) })
  assert.equal(rBad.status, 502)
})

test('handleRequest: método, código de acesso e limite por IP', async () => {
  resetRateLimit()
  const env = { GEMINI_API_KEY: 'k', ACCESS_CODE: 'abc123' }
  const base = { method: 'POST', body: { text: 'erro 0x80070005' }, env, fetchImpl: okFetch('ok'), ip: '1.1.1.1' }
  assert.equal((await handleRequest({ ...base, method: 'GET' })).status, 405)
  assert.equal((await handleRequest({ ...base, headers: {} })).status, 401)
  assert.equal((await handleRequest({ ...base, headers: { 'x-access-code': 'errado' } })).status, 401)
  assert.equal((await handleRequest({ ...base, headers: { 'x-access-code': 'abc123' } })).status, 200)
  // sem ACCESS_CODE configurado, não exige código
  assert.equal((await handleRequest({ ...base, env: { GEMINI_API_KEY: 'k' } })).status, 200)
  assert.equal(DEFAULT_MODEL.startsWith('gemini'), true)
})

test('rateLimited e safeEqual', () => {
  resetRateLimit()
  for (let i = 0; i < 10; i++) assert.equal(rateLimited('2.2.2.2', { now: 1000 + i }), false)
  assert.equal(rateLimited('2.2.2.2', { now: 1010 }), true)
  assert.equal(rateLimited('2.2.2.2', { now: 1000 + 61000 }), false, 'janela expira')
  assert.equal(rateLimited('3.3.3.3', { now: 1000 }), false, 'outro IP não é afetado')
  assert.equal(safeEqual('abc', 'abc'), true)
  assert.equal(safeEqual('abc', 'abd'), false)
  assert.equal(safeEqual('abc', 'abcd'), false)
})
