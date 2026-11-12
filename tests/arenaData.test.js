import test from 'node:test'
import assert from 'node:assert/strict'
import {
  dropItems,
  squadStandings,
  killFeedEvents,
} from '../src/homeworks/KraftonPubgVnArena/data/arenaData.js'

test('drop items have valid contracts and unique IDs', () => {
  assert.equal(new Set(dropItems.map(item => item.id)).size, dropItems.length)

  for (const item of dropItems) {
    assert.ok(typeof item.id === 'string' && item.id.length > 0)
    assert.ok(typeof item.title === 'string' && item.title.length > 0)
    assert.ok(Number.isFinite(item.priceVnd) && item.priceVnd >= 0)
    assert.ok(Number.isInteger(item.remainingStock) && item.remainingStock >= 0)
    assert.ok(Number.isFinite(item.dropEpochMs) && item.dropEpochMs > 0)
  }
})

test('leaderboard contains four valid squads', () => {
  assert.equal(squadStandings.length, 4)

  const ids = squadStandings.map(team => team.squadId)
  assert.equal(new Set(ids).size, ids.length)
  assert.deepEqual(new Set(ids), new Set(['te', 'ces', 'roy', 'agg']))

  for (const team of squadStandings) {
    assert.ok(team.squadName)
    assert.ok(Number.isInteger(team.wwcdCount) && team.wwcdCount >= 0)
    assert.ok(Number.isInteger(team.placementPts) && team.placementPts >= 0)
    assert.ok(Number.isInteger(team.killPts) && team.killPts >= 0)
  }
})

test('kill feed has unique IDs and references existing squads', () => {
  const ids = killFeedEvents.map(event => event.id)
  const squads = new Set(squadStandings.map(team => team.squadId))

  assert.equal(new Set(ids).size, ids.length)

  for (const event of killFeedEvents) {
    assert.ok(squads.has(event.squadId))
    assert.ok(event.attacker)
    assert.ok(event.victim)
    assert.ok(event.weapon)
    assert.ok(Number.isFinite(event.occurredAtEpochMs))
  }
})
