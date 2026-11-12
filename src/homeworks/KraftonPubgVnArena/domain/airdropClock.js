export function getRemainingMs(targetEpochMs, serverOffsetMs = 0, nowMs = Date.now()) {
  if (![targetEpochMs, serverOffsetMs, nowMs].every(Number.isFinite)) {
    return null
  }

  const remaining = targetEpochMs - (nowMs + serverOffsetMs)
  return Number.isFinite(remaining) ? Math.max(0, remaining) : null
}

export function watchAirdropTime(targetEpochMs, onTick, options = {}) {
  const {
    serverOffsetMs = 0,
    now = Date.now,
    intervalMs = 200,
    startInterval = setInterval,
    cancelInterval = clearInterval,
    visibilitySource = typeof document === 'undefined' ? null : document,
  } = options

  let intervalId = null
  let active = true

  const stop = () => {
    active = false

    if (intervalId !== null) {
      cancelInterval(intervalId)
      intervalId = null
    }

    visibilitySource?.removeEventListener('visibilitychange', onVisibility)
  }

  const tick = () => {
    if (!active) return

    const nowMs = now()
    const remainingMs = getRemainingMs(targetEpochMs, serverOffsetMs, nowMs)

    onTick({
      nowEpochMs: nowMs + serverOffsetMs,
      remainingMs,
    })

    if (remainingMs === null || remainingMs === 0) {
      stop()
    }
  }

  const onVisibility = () => {
    if (visibilitySource?.visibilityState !== 'hidden') {
      tick()
    }
  }

  visibilitySource?.addEventListener('visibilitychange', onVisibility)
  tick()

  if (active) {
    intervalId = startInterval(tick, intervalMs)
  }

  return stop
}
