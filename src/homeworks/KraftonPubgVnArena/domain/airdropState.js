export const AIRDROP_PHASE = Object.freeze({
  WARMUP: 'WARMUP',
  AIRDROP_LIVE: 'AIRDROP_LIVE',
  LOOTED_OUT: 'LOOTED_OUT',
  EXPIRED: 'EXPIRED',
})

export function getAirdropPhase(item, nowEpochMs = Date.now()) {
  if (
    !item ||
    !Number.isSafeInteger(item.dropEpochMs) ||
    !Number.isSafeInteger(item.claimWindowMs) ||
    item.claimWindowMs <= 0 ||
    !Number.isInteger(item.remainingStock) ||
    item.remainingStock < 0 ||
    !Number.isFinite(nowEpochMs)
  ) {
    return null
  }

  const expiryEpochMs = item.dropEpochMs + item.claimWindowMs

  if (!Number.isSafeInteger(expiryEpochMs)) {
    return null
  }

  if (nowEpochMs < item.dropEpochMs) {
    return AIRDROP_PHASE.WARMUP
  }

  if (nowEpochMs >= expiryEpochMs) {
    return AIRDROP_PHASE.EXPIRED
  }

  if (item.remainingStock === 0) {
    return AIRDROP_PHASE.LOOTED_OUT
  }

  return AIRDROP_PHASE.AIRDROP_LIVE
}
