import styles from './ArenaShell.module.css'

export default function ArenaShell() {
  return (
    <main className={styles.page}>
      <section className={styles.panel} aria-labelledby="arena-title">
        <p className={styles.eyebrow}>LAB 03 · HOMEWORK 3</p>
        <h1 id="arena-title">KRAFTON x PUBG Vietnam Arena</h1>
        <p>PVS Finals Ticket & G-Coin Contraband Crate Arena</p>
        <p className={styles.note}>
          Educational simulation. Features coming in Steps 2–5.
        </p>
      </section>
    </main>
  )
}
