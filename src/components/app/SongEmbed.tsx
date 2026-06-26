import { getSongEmbedHeight } from "@/lib/slug"
import { getSafeEmbedUrl, getSafeMediaUrl } from "@/lib/security"
import { cn } from "@/lib/utils"

interface SongEmbedProps {
  embedUrl: string
  className?: string
}

function getEmbedStyles(embedUrl: string) {
  if (embedUrl.includes("spotify.com")) {
    return { bg: "bg-[#121212]", border: "border-white/10" }
  }
  if (embedUrl.includes("music.apple.com")) {
    return { bg: "bg-[#1c1c1e]", border: "border-white/10" }
  }
  return { bg: "bg-card", border: "border-border/50" }
}

export function SongEmbed({ embedUrl, className }: SongEmbedProps) {
  const safeUrl = getSafeEmbedUrl(embedUrl)
  if (!safeUrl) return null

  const height = getSongEmbedHeight(safeUrl)
  const { bg, border } = getEmbedStyles(safeUrl)

  return (
    <div className={cn("rounded-2xl overflow-hidden border", bg, border, className)}>
      <iframe
        src={safeUrl}
        style={{ height }}
        className="w-full block border-0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        title="Favourite song"
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      />
    </div>
  )
}

interface SongAudioPlayerProps {
  url: string
  title?: string | null
  artist?: string | null
  className?: string
}

export function SongAudioPlayer({ url, title, artist, className }: SongAudioPlayerProps) {
  const safeUrl = getSafeMediaUrl(url)
  if (!safeUrl) return null

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/50 bg-card p-6 sm:p-8",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-6">
        <div className="flex-1 min-w-0">
          {title && (
            <p className="font-serif text-xl sm:text-2xl font-semibold leading-tight mb-1">
              {title}
            </p>
          )}
          {artist && (
            <p className="text-sm text-muted-foreground">{artist}</p>
          )}
        </div>
        <audio controls src={safeUrl} className="w-full sm:max-w-sm shrink-0" />
      </div>
    </div>
  )
}

interface SafeVideoEmbedProps {
  embedUrl: string
  className?: string
}

export function SafeVideoEmbed({ embedUrl, className }: SafeVideoEmbedProps) {
  const safeUrl = getSafeEmbedUrl(embedUrl)
  if (!safeUrl) return null

  return (
    <iframe
      src={safeUrl}
      className={cn("w-full h-full", className)}
      allowFullScreen
      loading="lazy"
      title="Video tribute"
      sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-presentation"
    />
  )
}
