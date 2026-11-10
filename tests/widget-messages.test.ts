import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mergeWidgetMessages } from '../shared/utils/widget-messages'

test('a project file replaces single strings and keeps the rest', () => {
  const base = { widget: { messageAI: 'FeedLog AI', send: 'Senden' } }
  const merged = mergeWidgetMessages(base, { widget: { messageAI: 'Acme assistant' } })
  assert.deepEqual(merged, { widget: { messageAI: 'Acme assistant', send: 'Senden' } })
  assert.equal(base.widget.messageAI, 'FeedLog AI')
})

test('no project file gives the fork text', () => {
  const base = { widget: { send: 'Senden' } }
  assert.deepEqual(mergeWidgetMessages(base, undefined), base)
})
