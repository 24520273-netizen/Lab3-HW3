import test from 'node:test'
import assert from 'node:assert/strict'
import {
  ClaimApiError,
  createMockClaimApi,
} from '../src/homeworks/KraftonPubgVnArena/services/claimApi.js'
import { dropItems } from '../src/homeworks/KraftonPubgVnArena/data/arenaData.js'

const liveTime = Math.max(...dropItems.map((item) => item.dropEpochMs)) + 60000

function createApi() {
  return createMockClaimApi(dropItems, {
    latencyMs: 0,
    now: () => liveTime,
  })
}

test('successful claim decreases authoritative stock', async () => {
  const api = createApi()
  const initial = api.getStock('pvs-vip-pass')

  const result = await api.claim({
    itemId: 'pvs-vip-pass',
    claimId: 'claim-1',
  })

  assert.equal(result.remainingStock, initial - 1)
  assert.equal(api.getStock('pvs-vip-pass'), initial - 1)
})

test('same successful claimId does not decrease stock twice', async () => {
  const api = createApi()
  const request = { itemId: 'pvs-vip-pass', claimId: 'same-id' }

  await api.claim(request)
  await api.claim(request)

  assert.equal(api.getStock('pvs-vip-pass'), 19)
})

test('simulated HTTP 409 preserves authoritative stock', async () => {
  const api = createApi()
  api.simulateConflictOnce('pvs-vip-pass')

  await assert.rejects(
    api.claim({ itemId: 'pvs-vip-pass', claimId: 'conflict-1' }),
    (error) =>
      error instanceof ClaimApiError &&
      error.status === 409 &&
      error.authoritativeStock === 20,
  )

  assert.equal(api.getStock('pvs-vip-pass'), 20)
})

test('out of stock cannot be claimed', async () => {
  const api = createApi()
  api.setAuthoritativeStockForTest('pvs-vip-pass', 0)

  await assert.rejects(
    api.claim({ itemId: 'pvs-vip-pass', claimId: 'empty-1' }),
    (error) => error.status === 409 && error.authoritativeStock === 0,
  )
})

test('aborted request does not change stock', async () => {
  const api = createApi()
  const controller = new AbortController()
  controller.abort()

  await assert.rejects(
    api.claim({
      itemId: 'pvs-vip-pass',
      claimId: 'abort-1',
      signal: controller.signal,
    }),
    { name: 'AbortError' },
  )

  assert.equal(api.getStock('pvs-vip-pass'), 20)
})

test('mock server rejects claims before opening', async () => {
  const api = createMockClaimApi(dropItems, {
    latencyMs: 0,
    now: () => 1000,
  })

  await assert.rejects(
    api.claim({ itemId: 'pvs-vip-pass', claimId: 'warmup-1' }),
    (error) => error.status === 409,
  )
})
