import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isPlainObject, isString, isStringArray, isStringRecord } from '../../src/utils/validators.js'

test('validadores de dados salvos no navegador', () => {
  assert.ok(isStringArray([]) && isStringArray(['a']))
  assert.ok(!isStringArray('x') && !isStringArray([1]) && !isStringArray({}))
  assert.ok(isStringRecord({}) && isStringRecord({ a: 'x' }))
  assert.ok(!isStringRecord([]) && !isStringRecord({ a: 1 }) && !isStringRecord(null) && !isStringRecord('s'))
  assert.ok(isString('a') && !isString(1))
  assert.ok(isPlainObject({}) && !isPlainObject([]) && !isPlainObject(null))
})
