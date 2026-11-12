import test from 'node:test'
import assert from 'node:assert/strict'
import {
  createInventoryState,
  getDisplayedStock,
  inventoryReducer,
} from '../src/homeworks/KraftonPubgVnArena/domain/claimInventory.js'

const items = [
  { id: 'ticket', remainingStock: 2 },
  { id: 'crate', remainingStock: 5 },
]

function begin(state, itemId, claimId) {
  return inventoryReducer(state, {
    type: 'BEGIN',
    itemId,
    claimId,
  })
}

test('optimistic claim immediately decreases displayed stock', () => {
  const original = createInventoryState(items)
  const pending = begin(original, 'ticket', 'claim-1')

  assert.equal(getDisplayedStock(original, 'ticket'), 2)
  assert.equal(getDisplayedStock(pending, 'ticket'), 1)
  assert.equal(getDisplayedStock(pending, 'crate'), 5)
})

test('success confirms authoritative stock', () => {
  let state = begin(createInventoryState(items), 'ticket', 'claim-1')

  state = inventoryReducer(state, {
    type: 'SUCCESS',
    itemId: 'ticket',
    claimId: 'claim-1',
    remainingStock: 1,
  })

  assert.equal(getDisplayedStock(state, 'ticket'), 1)
  assert.equal(state.pendingClaimById.ticket, undefined)
})

test('HTTP 409 rolls back using authoritative stock', () => {
  let state = begin(createInventoryState(items), 'ticket', 'claim-1')

  state = inventoryReducer(state, {
    type: 'FAIL',
    itemId: 'ticket',
    claimId: 'claim-1',
    status: 409,
    remainingStock: 2,
  })

  assert.equal(getDisplayedStock(state, 'ticket'), 2)
  assert.equal(state.feedbackById.ticket.kind, 'error')
})

test('409 reconciles even when server stock changed externally', () => {
  let state = begin(createInventoryState(items), 'ticket', 'claim-1')

  state = inventoryReducer(state, {
    type: 'FAIL',
    itemId: 'ticket',
    claimId: 'claim-1',
    status: 409,
    remainingStock: 0,
  })

  assert.equal(getDisplayedStock(state, 'ticket'), 0)
})

test('independent items do not overwrite each other', () => {
  let state = createInventoryState(items)

  state = begin(state, 'ticket', 'claim-1')
  state = begin(state, 'crate', 'claim-2')

  state = inventoryReducer(state, {
    type: 'SUCCESS',
    itemId: 'crate',
    claimId: 'claim-2',
    remainingStock: 4,
  })

  state = inventoryReducer(state, {
    type: 'FAIL',
    itemId: 'ticket',
    claimId: 'claim-1',
    status: 409,
    remainingStock: 2,
  })

  assert.equal(getDisplayedStock(state, 'ticket'), 2)
  assert.equal(getDisplayedStock(state, 'crate'), 4)
})

test('stale responses cannot overwrite a different claimId', () => {
  const pending = begin(createInventoryState(items), 'ticket', 'current')

  const result = inventoryReducer(pending, {
    type: 'SUCCESS',
    itemId: 'ticket',
    claimId: 'stale',
    remainingStock: 0,
  })

  assert.equal(result, pending)
})

test('stock cannot become negative and reducer is immutable', () => {
  const original = createInventoryState([
    { id: 'single', remainingStock: 1 },
  ])

  const pending = begin(original, 'single', 'claim-1')
  const duplicate = begin(pending, 'single', 'claim-2')

  assert.equal(getDisplayedStock(pending, 'single'), 0)
  assert.equal(duplicate, pending)
  assert.equal(getDisplayedStock(original, 'single'), 1)
})
