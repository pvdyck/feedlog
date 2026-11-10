import assert from 'node:assert/strict'
import { test } from 'node:test'
import { composeText, WIDGET_COMPOSE_MAX } from '../shared/utils/widget-compose'

test('a host prefill keeps its text', () => {
  assert.equal(composeText({ text: 'https://example.com/card/1 ' }), 'https://example.com/card/1 ')
})

test('a long prefill is cut to the limit', () => {
  assert.equal(composeText({ text: 'x'.repeat(WIDGET_COMPOSE_MAX + 5) })?.length, WIDGET_COMPOSE_MAX)
  assert.equal(WIDGET_COMPOSE_MAX, 2000)
})

test('an empty or non-text prefill is ignored', () => {
  for (const payload of [undefined, null, {}, { text: '' }, { text: '  \n' }, { text: 42 }, 'text']) assert.equal(composeText(payload), null)
})
