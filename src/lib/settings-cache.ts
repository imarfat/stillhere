export interface AccountStats {
  memorials: number
  photos: number
  videos: number
  guestbookEntries: number
  tributes: number
  timelineEvents: number
}

export const emptyAccountStats: AccountStats = {
  memorials: 0,
  photos: 0,
  videos: 0,
  guestbookEntries: 0,
  tributes: 0,
  timelineEvents: 0,
}

let cachedStats: AccountStats | null = null

export function getSettingsStats() {
  return cachedStats
}

export function setSettingsStats(stats: AccountStats) {
  cachedStats = stats
}

export function invalidateSettingsStats() {
  cachedStats = null
}
