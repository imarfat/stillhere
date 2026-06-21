"use client"

import { useEffect, useRef, useState } from "react"
import { formatDate } from "@/lib/slug"
import { cn } from "@/lib/utils"
import { ZoomIn } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

interface CoverHeroPreviewProps {
  coverUrl: string
  name?: string
  dob?: string | null
  dod?: string | null
  tagline?: string | null
  className?: string
}

const FRAME_WIDTH = 118
const CHROME_HEIGHT = 16
const HERO_HEIGHT = (FRAME_WIDTH * 15) / 9
const FRAME_HEIGHT = CHROME_HEIGHT + HERO_HEIGHT

function buildDateRange(dob?: string | null, dod?: string | null) {
  if (!dob && !dod) return null
  const dobFormatted = dob ? formatDate(dob) : ""
  const dodFormatted = dod ? formatDate(dod) : ""
  if (dobFormatted && dodFormatted) return `${dobFormatted} — ${dodFormatted}`
  return dodFormatted || dobFormatted || null
}

function MemorialHeroPreviewContent({
  coverUrl,
  name,
  dateRange,
  tagline,
}: {
  coverUrl: string
  name: string
  dateRange: string | null
  tagline?: string | null
}) {
  return (
    <div className="memorial-hero cover-hero-preview cover-hero-preview--mobile h-full min-h-0 overflow-hidden bg-background flex flex-col">
      <div className="memorial-hero-inner h-full min-h-0 flex flex-col">
        <div className="memorial-hero-photo relative flex-1 min-h-0">
          <img src={coverUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 hero-overlay" />
        </div>
        <div className="memorial-hero-content shrink-0">
          <div className="px-2.5 py-2">
            <div className="memorial-hero-copy">
              <p className="memorial-hero-epigraph">In loving memory of</p>
              <div className="memorial-hero-headline">
                <h1 className="memorial-hero-name font-bold">{name || "Their Name"}</h1>
                {dateRange && <p className="memorial-hero-dates">{dateRange}</p>}
              </div>
              {tagline && (
                <div className="memorial-hero-meta">
                  <p className="memorial-hero-tagline">&ldquo;{tagline}&rdquo;</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DeviceFrame({
  coverUrl,
  name,
  dateRange,
  tagline,
}: {
  coverUrl: string
  name: string
  dateRange: string | null
  tagline?: string | null
}) {
  return (
    <div className="w-[118px] overflow-hidden rounded-[1.35rem] border-2 border-border/50 bg-background shadow-sm">
      <div className="h-4 shrink-0 bg-muted/40 border-b border-border/30 flex items-center justify-center">
        <div className="w-7 h-1 rounded-full bg-border/80" />
      </div>
      <div className="overflow-hidden bg-background aspect-[9/15] w-full" style={{ height: HERO_HEIGHT }}>
        <MemorialHeroPreviewContent coverUrl={coverUrl} name={name} dateRange={dateRange} tagline={tagline} />
      </div>
    </div>
  )
}

function ScaledDeviceFrame({
  coverUrl,
  name,
  dateRange,
  tagline,
}: {
  coverUrl: string
  name: string
  dateRange: string | null
  tagline?: string | null
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateScale = () => {
      const availableHeight = container.clientHeight
      if (!availableHeight) return
      setScale(availableHeight / FRAME_HEIGHT)
    }

    updateScale()
    const observer = new ResizeObserver(updateScale)
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="h-full flex items-center justify-center">
      <div
        className="relative shrink-0"
        style={{ width: FRAME_WIDTH * scale, height: FRAME_HEIGHT * scale }}
      >
        <div
          className="absolute top-1/2 left-1/2"
          style={{
            transform: `translate(-50%, -50%) scale(${scale})`,
            transformOrigin: "center center",
          }}
        >
          <DeviceFrame coverUrl={coverUrl} name={name} dateRange={dateRange} tagline={tagline} />
        </div>
      </div>
    </div>
  )
}

export function CoverHeroPreview({
  coverUrl,
  name,
  dob,
  dod,
  tagline,
  className,
}: CoverHeroPreviewProps) {
  const dateRange = buildDateRange(dob, dod)
  const displayName = name?.trim() || "Their Name"
  const [expanded, setExpanded] = useState(false)

  const frameProps = {
    coverUrl,
    name: displayName,
    dateRange,
    tagline,
  }

  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-xs text-muted-foreground text-center">
        What you can expect to see on the memorial page
      </p>

      <div className="flex justify-center">
        <div
          role="button"
          tabIndex={0}
          onClick={() => setExpanded(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              setExpanded(true)
            }
          }}
          aria-label="Enlarge preview"
          className="group relative cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-[1.35rem]"
        >
          <DeviceFrame {...frameProps} />
          <span className="absolute inset-0 flex items-center justify-center rounded-[1.35rem] bg-black/0 transition-colors group-hover:bg-black/25 pointer-events-none">
            <span className="flex items-center gap-1.5 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-medium text-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              <ZoomIn className="w-3 h-3" />
              Enlarge
            </span>
          </span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center leading-relaxed max-w-xs mx-auto">
        On desktop and laptop, the same layout appears centered in the browser with space on either side.
      </p>

      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent className="flex flex-col items-center border-border/50 p-4 sm:p-6 gap-3 w-auto max-w-[calc(100vw-2rem)]">
          <DialogTitle className="font-serif text-lg text-center self-stretch">
            Memorial preview
          </DialogTitle>
          <div className="flex items-center justify-center h-[min(70vh,24rem)]">
            <ScaledDeviceFrame {...frameProps} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
