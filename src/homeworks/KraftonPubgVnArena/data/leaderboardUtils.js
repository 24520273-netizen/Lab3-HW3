export function getVisibleStandings(
  standings,
  searchTerm = '',
  sortField = 'wwcdCount',
  sortDirection = 'desc',
) {
  const query = searchTerm.trim().toLocaleLowerCase('vi-VN')
  const direction = sortDirection === 'asc' ? 1 : -1

  return standings
    .filter((team) => {
      const searchableName = `${team.squadName} ${team.shortName}`
        .toLocaleLowerCase('vi-VN')

      return searchableName.includes(query)
    })
    .toSorted((a, b) => {
      const difference = direction * (a[sortField] - b[sortField])

      return (
        difference ||
        a.squadName.localeCompare(b.squadName, 'vi') ||
        a.squadId.localeCompare(b.squadId)
      )
    })
}
