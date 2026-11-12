export function createInventoryState(items) {
  return {
    confirmedStockById: Object.fromEntries(
      items.map((item) => [item.id, item.remainingStock]),
    ),
    pendingClaimById: {},
    feedbackById: {},
  }
}

export function getDisplayedStock(state, itemId) {
  const confirmed = state.confirmedStockById[itemId]

  if (!Number.isInteger(confirmed) || confirmed < 0) return 0

  const pending = state.pendingClaimById[itemId] ? 1 : 0
  return Math.max(0, confirmed - pending)
}

export function inventoryReducer(state, action) {
  const { itemId, claimId } = action

  if (!Object.hasOwn(state.confirmedStockById, itemId)) {
    return state
  }

  if (action.type === 'BEGIN') {
    if (state.pendingClaimById[itemId] || getDisplayedStock(state, itemId) === 0) {
      return state
    }

    return {
      ...state,
      pendingClaimById: {
        ...state.pendingClaimById,
        [itemId]: claimId,
      },
      feedbackById: {
        ...state.feedbackById,
        [itemId]: {
          kind: 'processing',
          message: 'Processing simulated claim...',
        },
      },
    }
  }

  if (action.type === 'NOTICE') {
    return {
      ...state,
      feedbackById: {
        ...state.feedbackById,
        [itemId]: {
          kind: 'info',
          message: 'Next claim will simulate HTTP 409 Conflict.',
        },
      },
    }
  }

  if (action.type !== 'SUCCESS' && action.type !== 'FAIL') {
    return state
  }

  if (state.pendingClaimById[itemId] !== claimId) {
    return state
  }

  const pendingClaimById = { ...state.pendingClaimById }
  delete pendingClaimById[itemId]

  const authoritativeIsValid =
    Number.isInteger(action.remainingStock) &&
    action.remainingStock >= 0

  const shouldReconcile =
    authoritativeIsValid &&
    (action.type === 'SUCCESS' || action.status === 409)

  const confirmedStockById = shouldReconcile
    ? {
        ...state.confirmedStockById,
        [itemId]: action.remainingStock,
      }
    : state.confirmedStockById

  const feedback =
    action.type === 'SUCCESS'
      ? {
          kind: 'success',
          message: 'Claim successful! Inventory updated.',
        }
      : action.status === 409
        ? {
            kind: 'error',
            message: 'HTTP 409 Conflict. Inventory synchronized with mock server.',
          }
        : {
            kind: 'error',
            message: 'Claim failed. Inventory restored. Please retry.',
          }

  return {
    ...state,
    confirmedStockById,
    pendingClaimById,
    feedbackById: {
      ...state.feedbackById,
      [itemId]: feedback,
    },
  }
}
