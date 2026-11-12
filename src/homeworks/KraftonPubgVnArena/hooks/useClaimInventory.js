import { useEffect, useReducer, useRef } from 'react'
import { AIRDROP_PHASE, getAirdropPhase } from '../domain/airdropState.js'
import {
  createInventoryState,
  inventoryReducer,
} from '../domain/claimInventory.js'
import { createClaimExecutor } from '../domain/claimExecutor.js'

export default function useClaimInventory(items, api) {
  const [inventory, dispatch] = useReducer(
    inventoryReducer,
    items,
    createInventoryState,
  )

  const executorRef = useRef(null)

  useEffect(() => {
    const executor = createClaimExecutor(api)
    executorRef.current = executor

    return () => {
      executor.dispose()

      if (executorRef.current === executor) {
        executorRef.current = null
      }
    }
  }, [api])

  function requestClaim(item) {
    const executor = executorRef.current

    if (!executor || executor.isBusy(item.id)) {
      return Promise.resolve(false)
    }

    if (getAirdropPhase(item, api.getNow()) !== AIRDROP_PHASE.AIRDROP_LIVE) {
      return Promise.resolve(false)
    }

    return executor.claim(item.id, {
      onStart: (claimId) => {
        dispatch({
          type: 'BEGIN',
          itemId: item.id,
          claimId,
        })
      },

      onSuccess: (result, claimId) => {
        dispatch({
          type: 'SUCCESS',
          itemId: item.id,
          claimId,
          remainingStock: result.remainingStock,
        })
      },

      onFailure: (error, claimId) => {
        dispatch({
          type: 'FAIL',
          itemId: item.id,
          claimId,
          status: error.status,
          remainingStock: error.authoritativeStock,
        })
      },
    })
  }

  function armConflict(itemId) {
    if (!executorRef.current || executorRef.current.isBusy(itemId)) {
      return false
    }

    api.simulateConflictOnce(itemId)
    dispatch({ type: 'NOTICE', itemId })
    return true
  }

  return {
    inventory,
    requestClaim,
    armConflict,
  }
}
