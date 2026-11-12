import test from 'node:test'
import assert from 'node:assert/strict'
import { watchAirdropTime } from '../src/homeworks/KraftonPubgVnArena/domain/airdropClock.js'
import { AIRDROP_PHASE, getAirdropPhase } from '../src/homeworks/KraftonPubgVnArena/domain/airdropState.js'

function createFakeClock() {
  let currentTime = 1000
  let nextId = 1
  const timers = new Map()
  const listeners = new Set()

  const visibilitySource = {
    visibilityState: 'visible',
    addEventListener(type, callback) {
      if (type === 'visibilitychange') listeners.add(callback)
    },
    removeEventListener(type, callback) {
      if (type === 'visibilitychange') listeners.delete(callback)
    },
  }

  return {
    now: () => currentTime,
    setTime: (value) => {
      currentTime = value
    },
    startInterval(callback, intervalMs) {
      assert.equal(intervalMs, 200)
      const id = nextId++
      timers.set(id, callback)
      return id
    },
    cancelInterval(id) {
      timers.delete(id)
    },
    visibilitySource,
    fireInterval() {
      for (const callback of [...timers.values()]) callback()
    },
    fireVisibility(state) {
      visibilitySource.visibilityState = state
      for (const callback of [...listeners]) callback()
    },
    get timerCount() {
      return timers.size
    },
    get listenerCount() {
      return listeners.size
    },
  }
}

function subscribe(target, callback, clock) {
  return watchAirdropTime(target, callback, {
    now: clock.now,
    startInterval: clock.startInterval,
    cancelInterval: clock.cancelInterval,
    visibilitySource: clock.visibilitySource,
  })
}

test('timer corrects elapsed time without drift', () => {
  const clock = createFakeClock()
  const updates = []
  const cleanup = subscribe(5000, (value) => updates.push(value), clock)

  assert.equal(updates[0].remainingMs, 4000)

  clock.setTime(4200)
  clock.fireInterval()

  assert.equal(updates.at(-1).remainingMs, 800)
  cleanup()
})

test('visibilitychange immediately resynchronizes countdown', () => {
  const clock = createFakeClock()
  const updates = []
  const cleanup = subscribe(5000, (value) => updates.push(value), clock)

  clock.fireVisibility('hidden')
  clock.setTime(4800)
  clock.fireVisibility('visible')

  assert.equal(updates.at(-1).remainingMs, 200)
  cleanup()
})

test('expiry stops interval and removes listener', () => {
  const clock = createFakeClock()
  const updates = []
  const cleanup = subscribe(3000, (value) => updates.push(value), clock)

  assert.equal(clock.timerCount, 1)
  assert.equal(clock.listenerCount, 1)

  clock.setTime(4000)
  clock.fireInterval()

  assert.equal(updates.at(-1).remainingMs, 0)
  assert.equal(clock.timerCount, 0)
  assert.equal(clock.listenerCount, 0)

  cleanup()
})

test('cleanup prevents updates after unmount', () => {
  const clock = createFakeClock()
  const updates = []
  const cleanup = subscribe(5000, (value) => updates.push(value), clock)

  cleanup()

  assert.equal(clock.timerCount, 0)
  assert.equal(clock.listenerCount, 0)

  const count = updates.length
  clock.setTime(3000)
  clock.fireInterval()
  clock.fireVisibility('visible')

  assert.equal(updates.length, count)
})

test('resubscription replaces old target without duplicate intervals', () => {
  const clock = createFakeClock()
  const updates = []

  const cleanupFirst = subscribe(5000, (value) => updates.push(value), clock)
  cleanupFirst()

  const cleanupSecond = subscribe(9000, (value) => updates.push(value), clock)

  assert.equal(clock.timerCount, 1)
  assert.equal(clock.listenerCount, 1)
  assert.equal(updates.at(-1).remainingMs, 8000)

  cleanupSecond()

  assert.equal(clock.timerCount, 0)
  assert.equal(clock.listenerCount, 0)
})

test('multiple drops maintain independent countdowns', () => {
  const clock = createFakeClock()
  const first = []
  const second = []

  const cleanupFirst = subscribe(5000, (value) => first.push(value), clock)
  const cleanupSecond = subscribe(7000, (value) => second.push(value), clock)

  assert.equal(clock.timerCount, 2)

  clock.setTime(4000)
  clock.fireInterval()

  assert.equal(first.at(-1).remainingMs, 1000)
  assert.equal(second.at(-1).remainingMs, 3000)

  cleanupFirst()
  cleanupSecond()
})

test('FSM transitions at exact boundaries without mutating item', () => {
  const item = {
    dropEpochMs: 5000,
    claimWindowMs: 3000,
    remainingStock: 1,
  }
  const original = structuredClone(item)

  assert.equal(getAirdropPhase(item, 4999), AIRDROP_PHASE.WARMUP)
  assert.equal(getAirdropPhase(item, 5000), AIRDROP_PHASE.AIRDROP_LIVE)
  assert.equal(getAirdropPhase(item, 7999), AIRDROP_PHASE.AIRDROP_LIVE)
  assert.equal(getAirdropPhase(item, 8000), AIRDROP_PHASE.EXPIRED)
  assert.deepEqual(item, original)
})
