import usePubgAirdropTimer from '../hooks/usePubgAirdropTimer.js'
import { getRemainingMs } from '../domain/airdropClock.js'
import { AIRDROP_PHASE, getAirdropPhase } from '../domain/airdropState.js'
import { formatCountdown } from '../domain/formatCountdown.js'
import styles from './DropCard.module.css'

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
})

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Ho_Chi_Minh',
})

const phaseLabels = {
  [AIRDROP_PHASE.WARMUP]: 'WARMUP - Not open yet',
  [AIRDROP_PHASE.AIRDROP_LIVE]: 'AIRDROP LIVE - Available',
  [AIRDROP_PHASE.LOOTED_OUT]: 'LOOTED OUT - No stock',
  [AIRDROP_PHASE.EXPIRED]: 'EXPIRED - Drop closed',
}

export default function DropCard({ item }) {
  const isTicket = item.type === 'ticket'
  const dropDate = new Date(item.dropEpochMs)
  const validDate = Number.isFinite(dropDate.getTime())

  const expiryEpochMs =
    Number.isFinite(item.dropEpochMs) &&
    Number.isFinite(item.claimWindowMs)
      ? item.dropEpochMs + item.claimWindowMs
      : NaN

  const { nowEpochMs, remainingMs: expiryRemainingMs } =
    usePubgAirdropTimer(expiryEpochMs)

  const phase = getAirdropPhase(item, nowEpochMs)
  const openingRemainingMs = getRemainingMs(item.dropEpochMs, 0, nowEpochMs)

  const countdownMs =
    phase === AIRDROP_PHASE.WARMUP
      ? openingRemainingMs
      : expiryRemainingMs

  const showCountdown =
    phase === AIRDROP_PHASE.WARMUP ||
    phase === AIRDROP_PHASE.AIRDROP_LIVE

  return (
    <article className={styles.card} aria-labelledby={`drop-title-${item.id}`}>
      <div className={styles.top}>
        <span className={styles.tag}>
          {isTicket ? 'VIP ACCESS' : 'CONTRABAND'}
        </span>
        <span className={styles.category}>
          {isTicket ? 'CHAMPIONSHIP TICKET' : 'G-COIN CRATE'}
        </span>
      </div>

      <div className={styles.visual} aria-hidden="true">
        <span className={styles.symbol}>{isTicket ? 'VIP' : 'G'}</span>
      </div>

      <div className={styles.content}>
        <h3 id={`drop-title-${item.id}`}>{item.title}</h3>

        <dl className={styles.details}>
          <div>
            <dt>Price</dt>
            <dd className={styles.price}>
              {currencyFormatter.format(item.priceVnd)}
            </dd>
          </div>

          <div>
            <dt>Available stock</dt>
            <dd>{item.remainingStock} units</dd>
          </div>

          <div>
            <dt>Scheduled drop</dt>
            <dd>
              {validDate ? (
                <time dateTime={dropDate.toISOString()}>
                  {dateFormatter.format(dropDate)}
                </time>
              ) : (
                <span>Schedule unavailable</span>
              )}
            </dd>
          </div>
        </dl>
      </div>

      <footer className={styles.footer}>
        <div className={styles.phaseBox}>
          <span
            className={styles.phaseStatus}
            data-phase={phase ?? 'INVALID'}
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {phaseLabels[phase] ?? 'Schedule unavailable'}
          </span>

          {showCountdown && (
            <div className={styles.countdown} aria-live="off">
              <span>
                {phase === AIRDROP_PHASE.WARMUP
                  ? 'Opens in'
                  : 'Drop closes in'}
              </span>

              <strong className={styles.clock}>
                {formatCountdown(countdownMs)}
              </strong>
            </div>
          )}
        </div>

        <p>Preview only. Claim is not available in Step 3.</p>
      </footer>
    </article>
  )
}
