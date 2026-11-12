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

export default function DropCard({
  item,
  serverOffsetMs = 0,
  isPending = false,
  feedback,
  onClaim,
  onSimulateConflict,
}) {
  const isTicket = item.type === 'ticket'
  const dropDate = new Date(item.dropEpochMs)
  const validDate = Number.isFinite(dropDate.getTime())

  const expiryEpochMs =
    Number.isFinite(item.dropEpochMs) &&
    Number.isFinite(item.claimWindowMs)
      ? item.dropEpochMs + item.claimWindowMs
      : NaN

  const { nowEpochMs, remainingMs: expiryRemainingMs } =
    usePubgAirdropTimer(expiryEpochMs, serverOffsetMs)

  const phase = getAirdropPhase(item, nowEpochMs)
  const openingRemainingMs = getRemainingMs(item.dropEpochMs, 0, nowEpochMs)

  const countdownMs =
    phase === AIRDROP_PHASE.WARMUP
      ? openingRemainingMs
      : expiryRemainingMs

  const showCountdown =
    phase === AIRDROP_PHASE.WARMUP ||
    phase === AIRDROP_PHASE.AIRDROP_LIVE

  const canClaim =
    phase === AIRDROP_PHASE.AIRDROP_LIVE &&
    item.remainingStock > 0 &&
    !isPending

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
                'Schedule unavailable'
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

        <div className={styles.claimActions}>
          <button
            type="button"
            className={styles.claimButton}
            disabled={!canClaim}
            onClick={onClaim}
          >
            {isPending
              ? 'Processing...'
              : canClaim
                ? 'Claim (Simulation)'
                : 'Claim Unavailable'}
          </button>

          <button
            type="button"
            className={styles.conflictButton}
            disabled={!canClaim}
            onClick={onSimulateConflict}
          >
            Simulate next HTTP 409
          </button>
        </div>

        {feedback ? (
          <p
            className={styles.feedback}
            data-kind={feedback.kind}
            role={feedback.kind === 'error' ? 'alert' : 'status'}
          >
            {feedback.message}
          </p>
        ) : (
          <p className={styles.previewNote}>
            Mock inventory only. No real item will be delivered.
          </p>
        )}
      </footer>
    </article>
  )
}
