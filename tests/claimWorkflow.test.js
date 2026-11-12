import test from 'node:test'
import assert from 'node:assert/strict'
import { dropItems } from '../src/homeworks/KraftonPubgVnArena/data/arenaData.js'
import { createMockClaimApi } from '../src/homeworks/KraftonPubgVnArena/services/claimApi.js'
import { createClaimExecutor } from '../src/homeworks/KraftonPubgVnArena/domain/claimExecutor.js'
import {
  createInventoryState,
  getDisplayedStock,
  inventoryReducer,
} from '../src/homeworks/KraftonPubgVnArena/domain/claimInventory.js'

const liveTime = Math.max(...dropItems.map((item) => item.dropEpochMs)) + 60000

function createWorkflow() {
  const api = createMockClaimApi(dropItems, {
    latencyMs: 0,
    now: () => liveTime,
  })

  let inventory = createInventoryState(dropItems)
  let nextId = 0

  const executor = createClaimExecutor(api, {
    makeClaimId: () => `workflow-${++nextId}`,
  })

  const dispatch = (action) => {
    inventory = inventoryReducer(inventory, action)
  }

  function claim(itemId) {
    return executor.claim(itemId, {
      onStart: (claimId) => {
        dispatch({ type: 'BEGIN', itemId, claimId })
      },
      onSuccess: (result, claimId) => {
        dispatch({
          type: 'SUCCESS',
          itemId,
          claimId,
          remainingStock: result.remainingStock,
        })
      },
      onFailure: (error, claimId) => {
        dispatch({
          type: 'FAIL',
          itemId,
          claimId,
          status: error.status,
          remainingStock: error.authoritativeStock,
        })
      },
    })
  }

  return {
    api,
    executor,
    claim,
    stock: (itemId) => getDisplayedStock(inventory, itemId),
    feedback: (itemId) => inventory.feedbackById[itemId],
  }
}

test('optimistic success updates stock immediately', async () => {
  const workflow = createWorkflow()
  const initial = workflow.stock('pvs-vip-pass')

  const request = workflow.claim('pvs-vip-pass')
  assert.equal(workflow.stock('pvs-vip-pass'), initial - 1)

  assert.equal(await request, true)
  assert.equal(workflow.stock('pvs-vip-pass'), initial - 1)
  assert.equal(workflow.feedback('pvs-vip-pass').kind, 'success')

  workflow.executor.dispose()
})

test('HTTP 409 restores authoritative stock and retry succeeds', async () => {
  const workflow = createWorkflow()
  const initial = workflow.stock('pvs-vip-pass')

  workflow.api.simulateConflictOnce('pvs-vip-pass')

  const conflict = workflow.claim('pvs-vip-pass')
  assert.equal(workflow.stock('pvs-vip-pass'), initial - 1)

  assert.equal(await conflict, false)
  assert.equal(workflow.stock('pvs-vip-pass'), initial)
  assert.equal(workflow.feedback('pvs-vip-pass').kind, 'error')

  assert.equal(await workflow.claim('pvs-vip-pass'), true)
  assert.equal(workflow.stock('pvs-vip-pass'), initial - 1)

  workflow.executor.dispose()
})

test('duplicate claim is blocked while first request is pending', async () => {
  const workflow = createWorkflow()
  const first = workflow.claim('pvs-vip-pass')
  const second = workflow.claim('pvs-vip-pass')

  assert.equal(await second, false)
  assert.equal(await first, true)
  assert.equal(workflow.api.getStock('pvs-vip-pass'), 19)

  workflow.executor.dispose()
})

test('simultaneous claims on different items remain independent', async () => {
  const workflow = createWorkflow()

  const ticket = workflow.claim('pvs-vip-pass')
  const crate = workflow.claim('gcoin-contraband-crate')

  await Promise.all([ticket, crate])

  assert.equal(workflow.stock('pvs-vip-pass'), 19)
  assert.equal(workflow.stock('gcoin-contraband-crate'), 49)

  workflow.executor.dispose()
})
