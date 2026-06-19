export interface DashboardMemorial {
  id: string
  name: string
  slug: string
  dob: string | null
  dod: string | null
  tagline: string | null
  coverPhotoUrl: string | null
  createdAt: string
  _count: {
    photos: number
    videos: number
    guestbookEntries: number
    tributes: number
  }
}

let cachedMemorials: DashboardMemorial[] | null = null

export function getDashboardMemorials() {
  return cachedMemorials
}

export function setDashboardMemorials(memorials: DashboardMemorial[]) {
  cachedMemorials = memorials
}

export function invalidateDashboardMemorials() {
  cachedMemorials = null
}
