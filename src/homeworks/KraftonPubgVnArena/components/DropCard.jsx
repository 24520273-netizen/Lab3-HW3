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

export default function DropCard({ item }) {
  const isTicket = item.type === 'ticket'
  const dropDate = new Date(item.dropEpochMs)

  return (
    <article
      className={styles.card}
      aria-labelledby={`drop-title-${item.id}`}
    >
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
              <time dateTime={dropDate.toISOString()}>
                {dateFormatter.format(dropDate)}
              </time>
            </dd>
          </div>
        </dl>
      </div>

      <footer className={styles.footer}>
        <span className={styles.pending}>
          Countdown & claim coming soon
        </span>
        <p>Preview only. Claim is not available yet.</p>
      </footer>
    </article>
  )
}
