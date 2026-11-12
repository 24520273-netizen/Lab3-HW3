export function formatCountdown(remainingMs) {
  if (!Number.isFinite(remainingMs) || remainingMs < 0) {
    return 'Unavailable'
  }

  const totalSeconds = Math.ceil(remainingMs / 1000)

  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const clock = [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, '0'))
    .join(':')

  return days > 0 ? `${days}d ${clock}` : clock
}
