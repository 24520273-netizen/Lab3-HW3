import test from 'node:test'
import assert from 'node:assert/strict'
import {
  dropItems,
  squadStandings,
  killFeedEvents,
} from '../src/homeworks/KraftonPubgVnArena/data/arenaData.js'
import { getVisibleStandings } from '../src/homeworks/KraftonPubgVnArena/data/leaderboardUtils.js'
import { getVisibleKillFeed } from '../src/homeworks/KraftonPubgVnArena/data/killFeedUtils.js'
import { getRemainingMs } from '../src/homeworks/KraftonPubgVnArena/domain/airdropClock.js'
import { AIRDROP_PHASE, getAirdropPhase } from '../src/homeworks/KraftonPubgVnArena/domain/airdropState.js'
import { createMockClaimApi } from '../src/homeworks/KraftonPubgVnArena/services/claimApi.js'
import { createClaimExecutor } from '../src/homeworks/KraftonPubgVnArena/domain/claimExecutor.js'
import {
  createInventoryState,
  getDisplayedStock,
  inventoryReducer,
} from '../src/homeworks/KraftonPubgVnArena/domain/claimInventory.js'

const ticket = dropItems[0]
const crate = dropItems[1]
const liveTime = Math.max(ticket.dropEpochMs, crate.dropEpochMs) + 60000

test('drop catalog contains valid ticket and crate inventory', () => {
  assert.deepEqual(new Set(dropItems.map(item => item.type)), new Set(['ticket', 'crate']))
  assert.equal(new Set(dropItems.map(item => item.id)).size, dropItems.length)
  assert.ok(dropItems.every(item => item.remainingStock >= 0))
})

test('Vietnamese currency formatter produces VND display', () => {
  const formatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  })

  assert.ok(formatter.format(250000).includes('250.000'))
  assert.ok(formatter.format(250000).includes('₫'))
})

test('squad and kill feed filters preserve source data', () => {
  const originalSquads = structuredClone(squadStandings)
  const originalEvents = structuredClone(killFeedEvents)

  const standings = getVisibleStandings(
    squadStandings, '', 'killPts', 'desc',
  )

  const events = getVisibleKillFeed(killFeedEvents, {
    squadId: 'te',
    weapon: 'M416',
  })

  assert.deepEqual(standings.map(team => team.squadId), ['ces', 'te', 'roy', 'agg'])
  assert.deepEqual(events.map(event => event.id), ['kill-001'])
  assert.deepEqual(squadStandings, originalSquads)
  assert.deepEqual(killFeedEvents, originalEvents)
})

test('countdown recovers from elapsed time and never goes negative', () => {
  assert.equal(getRemainingMs(5000, 0, 1000), 4000)
  assert.equal(getRemainingMs(5000, 0, 4500), 500)
  assert.equal(getRemainingMs(5000, 0, 7000), 0)
})

test('FSM respects opening, stock and expiration priorities', () => {
  const item = {
    dropEpochMs: 5000,
    claimWindowMs: 3000,
    remainingStock: 1,
  }

  assert.equal(getAirdropPhase(item, 4999), AIRDROP_PHASE.WARMUP)
  assert.equal(getAirdropPhase(item, 5000), AIRDROP_PHASE.AIRDROP_LIVE)
  assert.equal(
    getAirdropPhase({ ...item, remainingStock: 0 }, 6000),
    AIRDROP_PHASE.LOOTED_OUT,
  )
  assert.equal(
    getAirdropPhase({ ...item, remainingStock: 0 }, 8000),
    AIRDROP_PHASE.EXPIRED,
  )
})

test('mock server rejects warmup and expired claims', async () => {
  for (const nowMs of [
    ticket.dropEpochMs - 1,
    ticket.dropEpochMs + ticket.claimWindowMs,
  ]) {
    const api = createMockClaimApi(dropItems, {
      latencyMs: 0,
      now: () => nowMs,
    })

    await assert.rejects(
      api.claim({
        itemId: ticket.id,
        claimId: `blocked-${nowMs}`,
      }),
      error => error.status === 409,
    )

    assert.equal(api.getStock(ticket.id), ticket.remainingStock)
  }
})

test('HTTP 409 reconciles inventory with externally changed server stock', async () => {
  const api = createMockClaimApi(dropItems, {
    latencyMs: 0,
    now: () => liveTime,
  })

  api.setAuthoritativeStockForTest(ticket.id, 7)
  api.simulateConflictOnce(ticket.id)

  let inventory = createInventoryState(dropItems)

  const executor = createClaimExecutor(api, {
    makeClaimId: () => 'final-conflict',
  })

  const request = executor.claim(ticket.id, {
    onStart: claimId => {
      inventory = inventoryReducer(inventory, {
        type: 'BEGIN',
        itemId: ticket.id,
        claimId,
      })
    },
    onFailure: (error, claimId) => {
      inventory = inventoryReducer(inventory, {
        type: 'FAIL',
        itemId: ticket.id,
        claimId,
        status: error.status,
        remainingStock: error.authoritativeStock,
      })
    },
  })

  assert.equal(getDisplayedStock(inventory, ticket.id), ticket.remainingStock - 1)
  assert.equal(await request, false)
  assert.equal(getDisplayedStock(inventory, ticket.id), 7)
  assert.equal(getDisplayedStock(inventory, crate.id), crate.remainingStock)

  executor.dispose()
})

test('same successful claim ID cannot consume stock twice', async () => {
  const api = createMockClaimApi(dropItems, {
    latencyMs: 0,
    now: () => liveTime,
  })

  const request = {
    itemId: ticket.id,
    claimId: 'final-idempotent',
  }

  await Promise.all([api.claim(request), api.claim(request)])

  assert.equal(api.getStock(ticket.id), ticket.remainingStock - 1)
})

test('out of stock is rejected without negative inventory', async () => {
  const api = createMockClaimApi(dropItems, {
    latencyMs: 0,
    now: () => liveTime,
  })

  api.setAuthoritativeStockForTest(ticket.id, 0)

  await assert.rejects(
    api.claim({ itemId: ticket.id, claimId: 'no-stock' }),
    error => error.status === 409,
  )

  assert.equal(api.getStock(ticket.id), 0)
})
