export function getVisibleKillFeed(
  events,
  { squadId = 'all', weapon = 'all' } = {},
) {
  return events
    .filter((event) => {
      const matchesSquad =
        squadId === 'all' || event.squadId === squadId

      const matchesWeapon =
        weapon === 'all' || event.weapon === weapon

      return matchesSquad && matchesWeapon
    })
    .toSorted(
      (a, b) =>
        b.occurredAtEpochMs - a.occurredAtEpochMs ||
        a.id.localeCompare(b.id),
    )
}
