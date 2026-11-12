import test from 'node:test'
import assert from 'node:assert/strict'
import { formatCountdown } from '../src/homeworks/KraftonPubgVnArena/domain/formatCountdown.js'

test('formats hours minutes and seconds', () => {
  assert.equal(formatCountdown(3661000), '01:01:01')
})

test('formats remaining days', () => {
  assert.equal(formatCountdown(93784000), '1d 02:03:04')
})

test('rounds positive milliseconds up to one second', () => {
  assert.equal(formatCountdown(200), '00:00:01')
})

test('formats zero without negatives', () => {
  assert.equal(formatCountdown(0), '00:00:00')
})

test('handles invalid durations', () => {
  assert.equal(formatCountdown(NaN), 'Unavailable')
})
