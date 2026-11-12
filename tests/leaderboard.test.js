import test from 'node:test'
import assert from 'node:assert/strict'
import { squadStandings } from '../src/homeworks/KraftonPubgVnArena/data/arenaData.js'
import { getVisibleStandings } from '../src/homeworks/KraftonPubgVnArena/data/leaderboardUtils.js'

test('sorts WWCD descending by default', () => {
  const result = getVisibleStandings(squadStandings)

  assert.deepEqual(
    result.map((team) => team.squadId),
    ['te', 'ces', 'agg', 'roy'],
  )
})

test('sorts kill points ascending', () => {
  const result = getVisibleStandings(squadStandings, '', 'killPts', 'asc')

  assert.deepEqual(
    result.map((team) => team.squadId),
    ['agg', 'roy', 'te', 'ces'],
  )
})

test('filters squad names case-insensitively', () => {
  const result = getVisibleStandings(squadStandings, 'CERBERUS')

  assert.equal(result.length, 1)
  assert.equal(result[0].squadId, 'ces')
})

test('returns empty list when no squad matches', () => {
  const result = getVisibleStandings(squadStandings, 'UNKNOWN TEAM')

  assert.deepEqual(result, [])
})

test('does not mutate original standings', () => {
  const original = structuredClone(squadStandings)

  getVisibleStandings(squadStandings, '', 'placementPts', 'asc')

  assert.deepEqual(squadStandings, original)
})
