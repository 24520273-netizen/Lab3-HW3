import test from 'node:test'
import assert from 'node:assert/strict'
import {
  AIRDROP_PHASE,
  getAirdropPhase,
} from '../src/homeworks/KraftonPubgVnArena/domain/airdropState.js'
import { dropItems } from '../src/homeworks/KraftonPubgVnArena/data/arenaData.js'

const item = {
  dropEpochMs: 10000,
  claimWindowMs: 5000,
  remainingStock: 10,
}

test('returns WARMUP before opening', () => {
  assert.equal(getAirdropPhase(item, 9999), AIRDROP_PHASE.WARMUP)
})

test('becomes AIRDROP_LIVE at opening time', () => {
  assert.equal(getAirdropPhase(item, 10000), AIRDROP_PHASE.AIRDROP_LIVE)
})

test('becomes LOOTED_OUT when stock is zero', () => {
  assert.equal(
    getAirdropPhase({ ...item, remainingStock: 0 }, 12000),
    AIRDROP_PHASE.LOOTED_OUT,
  )
})

test('expires at the exact expiry boundary', () => {
  assert.equal(getAirdropPhase(item, 15000), AIRDROP_PHASE.EXPIRED)
})

test('EXPIRED takes priority over LOOTED_OUT', () => {
  assert.equal(
    getAirdropPhase({ ...item, remainingStock: 0 }, 16000),
    AIRDROP_PHASE.EXPIRED,
  )
})

test('invalid time or stock returns null', () => {
  assert.equal(getAirdropPhase({ ...item, claimWindowMs: 0 }), null)
  assert.equal(getAirdropPhase({ ...item, remainingStock: -1 }), null)
  assert.equal(getAirdropPhase({ ...item, dropEpochMs: NaN }), null)
})

test('all configured drops have valid claim windows', () => {
  for (const drop of dropItems) {
    assert.ok(Number.isSafeInteger(drop.dropEpochMs))
    assert.ok(Number.isSafeInteger(drop.claimWindowMs))
    assert.ok(drop.claimWindowMs > 0)
    assert.notEqual(getAirdropPhase(drop), null)
  }
})
