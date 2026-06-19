const LATIN_SLUG_REPLACEMENTS: Record<string, string> = {
  ß: "ss",
  æ: "ae",
  Æ: "ae",
  œ: "oe",
  Œ: "oe",
  ø: "o",
  Ø: "o",
  ð: "d",
  Ð: "d",
  þ: "th",
  Þ: "th",
  ł: "l",
  Ł: "l",
}

function stripDiacritics(text: string): string {
  let result = text.normalize("NFD").replace(/\p{M}/gu, "")
  for (const [char, replacement] of Object.entries(LATIN_SLUG_REPLACEMENTS)) {
    result = result.replaceAll(char, replacement)
  }
  return result
}

export function slugify(text: string): string {
  return stripDiacritics(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function generateSlug(name: string, birthYear?: number, deathYear?: number): string {
  const slugified = slugify(name)
  const base = birthYear && deathYear
    ? `${slugified}-${birthYear}-${deathYear}`
    : slugified
  return base
}

export async function generateUniqueSlug(
  name: string,
  birthYear?: number,
  deathYear?: number,
  existingSlugs: string[] = [],
): Promise<string> {
  let slug = generateSlug(name, birthYear, deathYear)

  if (!existingSlugs.includes(slug)) return slug

  for (let i = 1; i <= 6; i++) {
    const candidate = `${slug}-${Math.random().toString(36).substring(2, 8)}`
    if (!existingSlugs.includes(candidate)) return candidate
  }

  return `${slug}-${Date.now()}`
}

export function parseYouTubeUrl(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return `https://www.youtube.com/embed/${match[1]}`
  }
  return null
}

export function parseVimeoUrl(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/)
  if (match) return `https://player.vimeo.com/video/${match[1]}`
  return null
}

export function parseVideoUrl(url: string): { embedUrl: string; platform: string } | null {
  const youtube = parseYouTubeUrl(url)
  if (youtube) return { embedUrl: youtube, platform: "YouTube" }

  const vimeo = parseVimeoUrl(url)
  if (vimeo) return { embedUrl: vimeo, platform: "Vimeo" }

  return null
}

export function parseSpotifyUrl(url: string): string | null {
  const embedMatch = url.match(
    /open\.spotify\.com\/embed\/(track|album|playlist|artist|episode|show)\/([a-zA-Z0-9]+)/
  )
  if (embedMatch) {
    const [, type, id] = embedMatch
    return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`
  }

  const match = url.match(
    /spotify\.com\/(?:intl-[a-z-]+\/)?(track|album|playlist|artist|episode|show)\/([a-zA-Z0-9]+)/
  )
  if (match) {
    const [, type, id] = match
    return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`
  }
  return null
}

export function parseAppleMusicUrl(url: string): string | null {
  if (url.includes("embed.music.apple.com")) {
    return url
  }

  const songMatch = url.match(/music\.apple\.com\/([a-z]{2})\/song\/[^/?]+\/(\d+)/)
  if (songMatch) {
    return `https://embed.music.apple.com/${songMatch[1]}/song/${songMatch[2]}`
  }

  const albumMatch = url.match(/music\.apple\.com\/([a-z]{2})\/album\/[^/?]+\/(\d+)/)
  if (albumMatch) {
    const trackId = url.match(/[?&]i=(\d+)/)?.[1]
    const base = `https://embed.music.apple.com/${albumMatch[1]}/album/${albumMatch[2]}`
    return trackId ? `${base}?i=${trackId}` : base
  }

  const playlistMatch = url.match(/music\.apple\.com\/([a-z]{2})\/playlist\/[^/?]+\/pl\.([a-f0-9-]+)/)
  if (playlistMatch) {
    return `https://embed.music.apple.com/${playlistMatch[1]}/playlist/${playlistMatch[2]}`
  }

  return null
}

export function parseSongUrl(url: string): { embedUrl: string; platform: string } | null {
  const spotify = parseSpotifyUrl(url)
  if (spotify) return { embedUrl: spotify, platform: "Spotify" }

  const apple = parseAppleMusicUrl(url)
  if (apple) return { embedUrl: apple, platform: "Apple Music" }

  return null
}

export function normalizeSongEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null
  return parseSongUrl(url)?.embedUrl ?? null
}

export function getSongEmbedHeight(embedUrl: string): number {
  const spotifyMatch = embedUrl.match(/open\.spotify\.com\/embed\/(track|album|playlist|artist|episode|show)\//)
  if (spotifyMatch) {
    switch (spotifyMatch[1]) {
      case "track":
        return 152
      case "artist":
        return 352
      case "album":
      case "playlist":
        return 352
      case "episode":
      case "show":
        return 232
      default:
        return 152
    }
  }

  if (embedUrl.includes("embed.music.apple.com")) {
    if (embedUrl.includes("/song/")) return 175
    if (embedUrl.includes("/playlist/")) return 450
    return 450
  }

  return 152
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return ""
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return "just now"
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}
