import DropCard from './components/DropCard.jsx'
import SquadLeaderboard from './components/SquadLeaderboard.jsx'
import KillFeed from './components/KillFeed.jsx'
import {
  dropItems,
  squadStandings,
  killFeedEvents,
} from './data/arenaData.js'
import styles from './ArenaShell.module.css'

export default function ArenaShell() {
  return (
    <div className={styles.arena}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <a className={styles.brand} href="#main-content">
            <span>KRAFTON</span>
            <span className={styles.brandDivider}>×</span>
            <span>PUBG VIETNAM</span>
          </a>

          <span className={styles.headerBadge}>PVS ARENA</span>
        </div>
      </header>

      <main id="main-content" className={styles.main}>
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroContent}>
            <p className={styles.eyebrow}>
              PUBG VIETNAM CHAMPIONSHIP
            </p>

            <h1 id="hero-title">
              THE BATTLEGROUND
              <span> AWAITS.</span>
            </h1>

            <p className={styles.description}>
              Experience the PVS Grand Finals Arena.
              Explore exclusive VIP Tickets, G-Coin Contraband
              Crates and the simulated championship action.
            </p>

            <div className={styles.heroLabels}>
              <span>PVS GRAND FINALS</span>
              <span>AIRDROP ARENA</span>
              <span>VIETNAM</span>
            </div>
          </div>

          <div className={styles.heroEmblem} aria-hidden="true">
            <span>PVS</span>
            <strong>FINALS</strong>
            <small>CHAMPIONSHIP ARENA</small>
          </div>
        </section>

        <section className={styles.overview} aria-label="Arena overview">
          <div>
            <strong>{squadStandings.length}</strong>
            <span>Featured Squads</span>
          </div>

          <div>
            <strong>{dropItems.length}</strong>
            <span>Exclusive Drops</span>
          </div>

          <div>
            <strong>{killFeedEvents.length}</strong>
            <span>Simulated Eliminations</span>
          </div>
        </section>

        <section className={styles.drops} aria-labelledby="drops-title">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.sectionEyebrow}>EXCLUSIVE REWARDS</p>
              <h2 id="drops-title">Airdrop Collection</h2>
            </div>
            <p>VIP Tickets & G-Coin Contraband Crates</p>
          </div>

          <div className={styles.dropGrid}>
            {dropItems.map((item) => (
              <DropCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        <section className={styles.nextPanels} aria-label="Upcoming arena panels">
          <SquadLeaderboard standings={squadStandings} />

          <KillFeed events={killFeedEvents} squads={squadStandings} />
        </section>
      </main>

      <footer className={styles.siteFooter}>
        <p>KRAFTON x PUBG Vietnam Championship Arena</p>
        <p>Educational simulation. Not affiliated with an official tournament.</p>
      </footer>
    </div>
  )
}
