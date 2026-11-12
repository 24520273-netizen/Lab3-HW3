import test from 'node:test'
import assert from 'node:assert/strict'
import { killFeedEvents } from '../src/homeworks/KraftonPubgVnArena/data/arenaData.js'
import { getVisibleKillFeed } from '../src/homeworks/KraftonPubgVnArena/data/killFeedUtils.js'

test('shows all events with newest first', () => {
  const result = getVisibleKillFeed(killFeedEvents)

  assert.equal(result.length, 6)
  assert.equal(result[0].id, 'kill-006')
})

test('filters events by squad', () => {
  const result = getVisibleKillFeed(killFeedEvents, {
    squadId: 'te',
  })

  assert.deepEqual(
    result.map((event) => event.id),
    ['kill-005', 'kill-001'],
  )
})

test('filters events by weapon', () => {
  const result = getVisibleKillFeed(killFeedEvents, {
    weapon: 'M416',
  })

  assert.equal(result.length, 2)
  assert.ok(result.every((event) => event.weapon === 'M416'))
})

test('combines squad and weapon filters', () => {
  const result = getVisibleKillFeed(killFeedEvents, {
    squadId: 'ces',
    weapon: 'M416',
  })

  assert.deepEqual(
    result.map((event) => event.id),
    ['kill-006'],
  )
})

test('returns empty state for unmatched filters', () => {
  const result = getVisibleKillFeed(killFeedEvents, {
    squadId: 'agg',
    weapon: 'Kar98k',
  })

  assert.deepEqual(result, [])
})

test('does not mutate original events', () => {
  const original = structuredClone(killFeedEvents)

  getVisibleKillFeed(killFeedEvents, { squadId: 'te' })

  assert.deepEqual(killFeedEvents, original)
})
