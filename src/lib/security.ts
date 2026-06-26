export const LIMITS = {
  name: 200,
  tagline: 300,
  restingPlace: 300,
  bio: 20_000,
  visitorName: 120,
  guestbookMessage: 2000,
  tributeNote: 280,
  songTitle: 200,
  songArtist: 200,
  videoTitle: 200,
  timelineTitle: 200,
  timelineDescription: 5000,
  userName: 120,
  email: 320,
  password: 128,
  url: 2048,
} as const

const BLOB_HOST_RE = /^[a-z0-9-]+\.public\.blob\.vercel-storage\.com$/

const ALLOWED_EMBED_HOSTS = new Set([
  "www.youtube.com",
  "player.vimeo.com",
  "open.spotify.com",
  "embed.music.apple.com",
])

const IMAGE_MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
}

const AUDIO_MIME_TO_EXT: Record<string, string> = {
  "audio/mpeg": ".mp3",
  "audio/mp3": ".mp3",
  "audio/wav": ".wav",
  "audio/x-wav": ".wav",
  "audio/ogg": ".ogg",
  "audio/mp4": ".m4a",
  "audio/x-m4a": ".m4a",
  "audio/aac": ".aac",
}

export const ALLOWED_UPLOAD_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".mp3",
  ".wav",
  ".ogg",
  ".m4a",
  ".aac",
])

export { IMAGE_MIME_TO_EXT, AUDIO_MIME_TO_EXT }

export function trimToMax(value: string, max: number): string {
  return value.trim().slice(0, max)
}

export function sanitizeOptionalText(value: unknown, max: number): string | null {
  if (value == null || value === "") return null
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimToMax(trimmed, max)
}

export function sanitizeRequiredText(value: unknown, max: number): string | null {
  const sanitized = sanitizeOptionalText(value, max)
  return sanitized && sanitized.length > 0 ? sanitized : null
}

export function isValidEmail(email: string): boolean {
  if (email.length > LIMITS.email) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isSafeUserId(userId: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(userId)
}

export function isAllowedMediaUrl(url: string): boolean {
  if (!url || url.length > LIMITS.url) return false

  if (url.startsWith("/uploads/")) {
    return /^\/uploads\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9._-]+$/.test(url)
  }

  try {
    const parsed = new URL(url)
    if (parsed.protocol !== "https:") return false
    if (parsed.username || parsed.password) return false
    if (!BLOB_HOST_RE.test(parsed.hostname)) return false
    return /^\/uploads\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9._-]+$/.test(parsed.pathname)
  } catch {
    return false
  }
}

export function isAllowedAudioUrl(url: string): boolean {
  return isAllowedMediaUrl(url)
}

export function isAllowedEmbedUrl(url: string): boolean {
  if (!url || url.length > LIMITS.url) return false

  try {
    const parsed = new URL(url)
    if (parsed.protocol !== "https:") return false
    if (parsed.username || parsed.password) return false
    if (!ALLOWED_EMBED_HOSTS.has(parsed.hostname)) return false

    if (parsed.hostname === "www.youtube.com") {
      return /^\/embed\/[a-zA-Z0-9_-]{11}$/.test(parsed.pathname)
    }

    if (parsed.hostname === "player.vimeo.com") {
      return /^\/video\/\d+$/.test(parsed.pathname)
    }

    if (parsed.hostname === "open.spotify.com") {
      return /^\/embed\/(track|album|playlist|artist|episode|show)\/[a-zA-Z0-9]+$/.test(
        parsed.pathname
      )
    }

    if (parsed.hostname === "embed.music.apple.com") {
      const pathMatch = parsed.pathname.match(
        /^\/([a-z]{2})\/(song|album|playlist)\/([^/]+)$/
      )
      if (!pathMatch) return false
      const type = pathMatch[2]
      if (type === "album") {
        const trackId = parsed.searchParams.get("i")
        if (parsed.search && (!trackId || !/^\d+$/.test(trackId))) return false
      } else if (parsed.search) {
        return false
      }
      return true
    }

    return false
  } catch {
    return false
  }
}

export function getSafeEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null
  return isAllowedEmbedUrl(url) ? url : null
}

export function getSafeMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null
  return isAllowedMediaUrl(url) ? url : null
}
