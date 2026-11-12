import { useEffect, useState } from 'react'
import { getRemainingMs, watchAirdropTime } from '../domain/airdropClock.js'

export default function usePubgAirdropTimer(
  targetEpochMs,
  serverOffsetMs = 0,
) {
  const [snapshot, setSnapshot] = useState(() => {
    const nowMs = Date.now()

    return {
      nowEpochMs: nowMs + serverOffsetMs,
      remainingMs: getRemainingMs(targetEpochMs, serverOffsetMs, nowMs),
    }
  })

  useEffect(() => {
    return watchAirdropTime(targetEpochMs, setSnapshot, {
      serverOffsetMs,
    })
  }, [targetEpochMs, serverOffsetMs])

  return snapshot
}
