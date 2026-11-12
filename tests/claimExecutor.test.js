import test from 'node:test'
import assert from 'node:assert/strict'
import { createClaimExecutor } from '../src/homeworks/KraftonPubgVnArena/domain/claimExecutor.js'

function deferred() {
  let resolve
  let reject

  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })

  return { promise, resolve, reject }
}

test('double click sends only one request', async () => {
  const pending = deferred()
  let calls = 0

  const api = {
    claim: () => {
      calls += 1
      return pending.promise
    },
  }

  const executor = createClaimExecutor(api, {
    makeClaimId: () => 'claim-1',
  })

  const first = executor.claim('ticket')
  const second = executor.claim('ticket')

  assert.equal(await second, false)
  assert.equal(calls, 1)
  assert.equal(executor.isBusy('ticket'), true)

  pending.resolve({ remainingStock: 1 })

  assert.equal(await first, true)
  assert.equal(executor.isBusy('ticket'), false)

  executor.dispose()
})

test('different items can claim independently', async () => {
  const requests = new Map()
  const api = {
    claim: ({ itemId }) => {
      const pending = deferred()
      requests.set(itemId, pending)
      return pending.promise
    },
  }

  let index = 0
  const executor = createClaimExecutor(api, {
    makeClaimId: () => `claim-${++index}`,
  })

  const ticket = executor.claim('ticket')
  const crate = executor.claim('crate')

  assert.equal(requests.size, 2)
  assert.equal(executor.isBusy('ticket'), true)
  assert.equal(executor.isBusy('crate'), true)

  requests.get('crate').resolve({ remainingStock: 4 })
  requests.get('ticket').resolve({ remainingStock: 1 })

  assert.equal(await ticket, true)
  assert.equal(await crate, true)

  executor.dispose()
})

test('conflict releases lock and allows retry', async () => {
  let calls = 0
  const ids = []

  const api = {
    claim: async ({ claimId }) => {
      ids.push(claimId)
      calls += 1

      if (calls === 1) {
        throw Object.assign(new Error('Conflict'), { status: 409 })
      }

      return { remainingStock: 1 }
    },
  }

  let index = 0
  const executor = createClaimExecutor(api, {
    makeClaimId: () => `claim-${++index}`,
  })

  assert.equal(await executor.claim('ticket'), false)
  assert.equal(executor.isBusy('ticket'), false)
  assert.equal(await executor.claim('ticket'), true)

  assert.equal(calls, 2)
  assert.notEqual(ids[0], ids[1])

  executor.dispose()
})

test('dispose aborts request and prevents stale callbacks', async () => {
  const pending = deferred()
  let capturedSignal
  let updates = 0

  const api = {
    claim: ({ signal }) => {
      capturedSignal = signal
      return pending.promise
    },
  }

  const executor = createClaimExecutor(api, {
    makeClaimId: () => 'claim-1',
  })

  const request = executor.claim('ticket', {
    onSuccess: () => { updates += 1 },
    onFailure: () => { updates += 1 },
  })

  executor.dispose()

  assert.equal(capturedSignal.aborted, true)

  pending.resolve({ remainingStock: 1 })
  assert.equal(await request, false)
  assert.equal(updates, 0)
})

test('disposed executor rejects new claims', async () => {
  const executor = createClaimExecutor({
    claim: async () => ({ remainingStock: 1 }),
  })

  executor.dispose()

  assert.equal(await executor.claim('ticket'), false)
})
