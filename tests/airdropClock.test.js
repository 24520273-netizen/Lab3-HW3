import test from 'node:test'
import assert from 'node:assert/strict'
import {
  getRemainingMs,
  watchAirdropTime,
} from '../src/homeworks/KraftonPubgVnArena/domain/airdropClock.js'

test('calculates remaining time from absolute epoch', () => {
  assert.equal(getRemainingMs(10000, 0, 7000), 3000)
  assert.equal(getRemainingMs(10000, 0, 8500), 1500)
})

test('applies server offset', () => {
  assert.equal(getRemainingMs(10000, 500, 7000), 2500)
})

test('clamps elapsed time to zero', () => {
  assert.equal(getRemainingMs(10000, 0, 12000), 0)
  assert.equal(getRemainingMs(NaN), null)
})

test('does not schedule an interval after expiry', () => {
  let scheduled = 0
  const updates = []

  const cleanup = watchAirdropTime(
    1000,
    (snapshot) => updates.push(snapshot),
    {
      now: () => 2000,
      visibilitySource: null,
      startInterval: () => {
        scheduled += 1
        return 1
      },
    },
  )

  assert.equal(scheduled, 0)
  assert.equal(updates[0].remainingMs, 0)
  cleanup()
})
