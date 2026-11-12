import { useId, useState } from 'react'
import { getVisibleStandings } from '../data/leaderboardUtils.js'
import styles from './SquadLeaderboard.module.css'

export default function SquadLeaderboard({ standings }) {
  const searchId = useId()
  const sortId = useId()
  const directionId = useId()

  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState('wwcdCount')
  const [sortDirection, setSortDirection] = useState('desc')

  const visibleTeams = getVisibleStandings(
    standings,
    search,
    sortField,
    sortDirection,
  )

  return (
    <section className={styles.panel} aria-labelledby="leaderboard-title">
      <header className={styles.header}>
        <p className={styles.eyebrow}>PVS CHAMPIONSHIP</p>
        <h2 id="leaderboard-title">Squad Leaderboard</h2>
        <p>Simulated standings. Not official live tournament data.</p>
      </header>

      <div className={styles.controls}>
        <div className={styles.control}>
          <label htmlFor={searchId}>Search squad</label>
          <input
            id={searchId}
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search TE, CES..."
          />
        </div>

        <div className={styles.control}>
          <label htmlFor={sortId}>Sort by</label>
          <select
            id={sortId}
            value={sortField}
            onChange={(event) => setSortField(event.target.value)}
          >
            <option value="wwcdCount">WWCD</option>
            <option value="placementPts">Placement Points</option>
            <option value="killPts">Kill Points</option>
          </select>
        </div>

        <div className={styles.control}>
          <label htmlFor={directionId}>Order</label>
          <select
            id={directionId}
            value={sortDirection}
            onChange={(event) => setSortDirection(event.target.value)}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      <output className={styles.status} role="status">
        Showing {visibleTeams.length} of {standings.length} squads
      </output>

      {visibleTeams.length === 0 ? (
        <p className={styles.empty}>
          No squads found. Try a different search.
        </p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <caption className={styles.visuallyHidden}>
              Simulated PUBG Vietnam squad standings
            </caption>
            <thead>
              <tr>
                <th scope="col">Rank</th>
                <th scope="col">Squad</th>
                <th scope="col">WWCD</th>
                <th scope="col">Placement</th>
                <th scope="col">Kills</th>
              </tr>
            </thead>

            <tbody>
              {visibleTeams.map((team, index) => (
                <tr key={team.squadId}>
                  <td className={styles.rank}>
                    {String(index + 1).padStart(2, '0')}
                  </td>
                  <th scope="row" className={styles.squadName}>
                    <span className={styles.shortName}>
                      {team.shortName}
                    </span>
                    {team.squadName}
                  </th>
                  <td>{team.wwcdCount}</td>
                  <td>{team.placementPts}</td>
                  <td>{team.killPts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
