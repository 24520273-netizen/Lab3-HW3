import { AIRDROP_PHASE, getAirdropPhase } from '../domain/airdropState.js'

export class ClaimApiError extends Error {
  constructor(message, status, authoritativeStock = null) {
    super(message)
    this.name = 'ClaimApiError'
    this.status = status
    this.authoritativeStock = authoritativeStock
  }
}

function waitForLatency(delayMs, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Request aborted', 'AbortError'))
      return
    }

    const onAbort = () => {
      clearTimeout(timer)
      reject(new DOMException('Request aborted', 'AbortError'))
    }

    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, delayMs)

    signal?.addEventListener('abort', onAbort, { once: true })

    if (signal?.aborted) onAbort()
  })
}

export function createMockClaimApi(
  items,
  { latencyMs = 500, now = Date.now } = {},
) {
  const itemById = new Map(items.map((item) => [item.id, { ...item }]))
  const stockById = new Map(
    items.map((item) => [item.id, item.remainingStock]),
  )
  const completedClaims = new Map()
  const forcedConflicts = new Set()

  function getStock(itemId) {
    return stockById.get(itemId)
  }

  function setAuthoritativeStockForTest(itemId, stock) {
    if (!itemById.has(itemId)) throw new Error('Unknown item')
    if (!Number.isInteger(stock) || stock < 0) {
      throw new Error('Invalid stock')
    }

    stockById.set(itemId, stock)
  }

  function simulateConflictOnce(itemId) {
    if (!itemById.has(itemId)) throw new Error('Unknown item')
    forcedConflicts.add(itemId)
  }

  async function claim({ itemId, claimId, signal } = {}) {
    if (typeof claimId !== 'string' || !claimId) {
      throw new ClaimApiError('Missing claimId', 400)
    }

    await waitForLatency(latencyMs, signal)

    if (signal?.aborted) {
      throw new DOMException('Request aborted', 'AbortError')
    }

    const previous = completedClaims.get(claimId)

    if (previous) {
      if (previous.itemId !== itemId) {
        throw new ClaimApiError('Claim ID already used', 409, getStock(itemId))
      }
      return { ...previous }
    }

    const item = itemById.get(itemId)

    if (!item) {
      throw new ClaimApiError('Unknown drop item', 404)
    }

    const stock = stockById.get(itemId)

    if (forcedConflicts.delete(itemId)) {
      throw new ClaimApiError(
        'HTTP 409: Simulated inventory conflict',
        409,
        stock,
      )
    }

    const phase = getAirdropPhase(
      { ...item, remainingStock: stock },
      now(),
    )

    if (phase !== AIRDROP_PHASE.AIRDROP_LIVE) {
      throw new ClaimApiError(
        'HTTP 409: Drop is not available',
        409,
        stock,
      )
    }

    const remainingStock = stock - 1
    stockById.set(itemId, remainingStock)

    const result = { itemId, claimId, remainingStock }
    completedClaims.set(claimId, result)

    return { ...result }
  }

  return {
    claim,
    getStock,
    getNow: now,
    simulateConflictOnce,
    setAuthoritativeStockForTest,
  }
}
