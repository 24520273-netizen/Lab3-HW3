export function createClaimExecutor(
  api,
  { makeClaimId = () => crypto.randomUUID() } = {},
) {
  const inFlight = new Map()
  let disposed = false

  async function claim(itemId, callbacks = {}) {
    if (disposed || inFlight.has(itemId)) {
      return false
    }

    const claimId = makeClaimId()
    const controller = new AbortController()

    inFlight.set(itemId, { claimId, controller })

    try {
      callbacks.onStart?.(claimId)

      const result = await api.claim({
        itemId,
        claimId,
        signal: controller.signal,
      })

      if (disposed || controller.signal.aborted) {
        return false
      }

      callbacks.onSuccess?.(result, claimId)
      return true
    } catch (error) {
      if (!disposed && !controller.signal.aborted) {
        callbacks.onFailure?.(error, claimId)
      }

      return false
    } finally {
      if (inFlight.get(itemId)?.claimId === claimId) {
        inFlight.delete(itemId)
      }
    }
  }

  function isBusy(itemId) {
    return inFlight.has(itemId)
  }

  function dispose() {
    disposed = true

    for (const request of inFlight.values()) {
      request.controller.abort()
    }

    inFlight.clear()
  }

  return { claim, isBusy, dispose }
}
