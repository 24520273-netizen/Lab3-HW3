import { useId, useState } from 'react'
import { getVisibleKillFeed } from '../data/killFeedUtils.js'
import styles from './KillFeed.module.css'

const timeFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Asia/Ho_Chi_Minh',
})

export default function KillFeed({ events, squads }) {
  const squadFilterId = useId()
  const weaponFilterId = useId()

  const [selectedSquad, setSelectedSquad] = useState('all')
  const [selectedWeapon, setSelectedWeapon] = useState('all')

  const weapons = [...new Set(events.map((event) => event.weapon))]
    .toSorted((a, b) => a.localeCompare(b))

  const squadNames = new Map(
    squads.map((squad) => [squad.squadId, squad.shortName]),
  )

  const visibleEvents = getVisibleKillFeed(events, {
    squadId: selectedSquad,
    weapon: selectedWeapon,
  })

  return (
    <section className={styles.panel} aria-labelledby="kill-feed-title">
      <header className={styles.header}>
        <p className={styles.eyebrow}>BATTLEGROUND ACTIVITY</p>
        <h2 id="kill-feed-title">Battle Kill-Feed</h2>
        <p>
          Simulated elimination events. Not official live match data.
        </p>
      </header>

      <div className={styles.controls}>
        <div className={styles.control}>
          <label htmlFor={squadFilterId}>Filter squad</label>
          <select
            id={squadFilterId}
            value={selectedSquad}
            onChange={(event) => setSelectedSquad(event.target.value)}
          >
            <option value="all">All squads</option>
            {squads.map((squad) => (
              <option key={squad.squadId} value={squad.squadId}>
                {squad.shortName} - {squad.squadName}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.control}>
          <label htmlFor={weaponFilterId}>Filter weapon</label>
          <select
            id={weaponFilterId}
            value={selectedWeapon}
            onChange={(event) => setSelectedWeapon(event.target.value)}
          >
            <option value="all">All weapons</option>
            {weapons.map((weapon) => (
              <option key={weapon} value={weapon}>
                {weapon}
              </option>
            ))}
          </select>
        </div>
      </div>

      <output className={styles.status} role="status">
        Showing {visibleEvents.length} of {events.length} eliminations
      </output>

      {visibleEvents.length === 0 ? (
        <p className={styles.empty}>
          No eliminations match the selected filters.
        </p>
      ) : (
        <ol className={styles.events} aria-label="Simulated eliminations">
          {visibleEvents.map((event) => (
            <li key={event.id} className={styles.event}>
              <div className={styles.eventTop}>
                <span className={styles.squadTag}>
                  {squadNames.get(event.squadId) ?? event.squadId}
                </span>
                <time dateTime={new Date(event.occurredAtEpochMs).toISOString()}>
                  {timeFormatter.format(new Date(event.occurredAtEpochMs))}
                </time>
              </div>

              <div className={styles.elimination}>
                <strong>{event.attacker}</strong>
                <span className={styles.action}>eliminated</span>
                <strong>{event.victim}</strong>
              </div>

              <div className={styles.eventBottom}>
                <span className={styles.weapon}>{event.weapon}</span>
                <span className={styles.eventId}>{event.id}</span>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
