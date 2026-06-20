"use client"

import { useEffect, useRef, useState } from "react"
import { formatDate } from "@/lib/slug"
import { cn } from "@/lib/utils"
import { Monitor, Smartphone, ZoomIn } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

interface CoverHeroPreviewProps {
  coverUrl: string
  name?: string
  dob?: string | null
  dod?: string | null
  tagline?: string | null
  className?: string
}

type PreviewVariant = "mobile" | "desktop"

function getFrameDimensions(variant: PreviewVariant) {
  const width = variant === "mobile" ? 118 : 360
  const height = variant === "mobile" ? 16 + (118 * 15) / 9 : 16 + 180
  return { width, height }
}

function buildDateRange(dob?: string | null, dod?: string | null) {
  if (!dob && !dod) return null
  const dobFormatted = dob ? formatDate(dob) : ""
  const dodFormatted = dod ? formatDate(dod) : ""
  if (dobFormatted && dodFormatted) return `${dobFormatted} — ${dodFormatted}`
  return dodFormatted || dobFormatted || null
}

function HeroFrame({
  coverUrl,
  name,
  dateRange,
  tagline,
  variant,
}: {
  coverUrl: string
  name: string
  dateRange: string | null
  tagline?: string | null
  variant: PreviewVariant
}) {
  const isMobile = variant === "mobile"

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-[#141210] flex items-end",
        isMobile ? "aspect-[9/15] w-full" : "h-[180px]"
      )}
    >
      <img src={coverUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 hero-overlay" />
      <div className="absolute inset-0 bg-grain opacity-40 pointer-events-none" />
      <div className={cn("relative z-10 w-full", isMobile ? "px-2.5 pb-3" : "px-3.5 pb-3.5")}>
        <p className="font-sans text-[6px] tracking-wide text-[rgba(245,240,232,0.58)] mb-0.5 sm:text-[7px]">
          In loving memory of
        </p>
        <h1
          className={cn(
            "font-serif font-bold text-gradient-warm leading-tight",
            isMobile ? "text-[10px] mb-0.5" : "text-xs mb-1"
          )}
        >
          {name || "Their Name"}
        </h1>
        {dateRange && (
          <p className="text-[6px] text-muted-foreground sm:text-[7px]">{dateRange}</p>
        )}
        {tagline && (
          <p className="text-[6px] text-muted-foreground/90 italic line-clamp-2 mt-0.5 sm:text-[7px]">
            &ldquo;{tagline}&rdquo;
          </p>
        )}
      </div>
    </div>
  )
}

function DeviceChrome({ variant }: { variant: PreviewVariant }) {
  if (variant === "mobile") {
    return (
      <div className="h-4 shrink-0 bg-muted/40 border-b border-border/30 flex items-center justify-center">
        <div className="w-7 h-1 rounded-full bg-border/80" />
      </div>
    )
  }

  return (
    <div className="h-4 shrink-0 bg-muted/30 border-b border-border/30 flex items-center px-2 gap-1">
      <div className="flex gap-0.5">
        <div className="w-1.5 h-1.5 rounded-full bg-destructive/40" />
        <div className="w-1.5 h-1.5 rounded-full bg-candle/50" />
        <div className="w-1.5 h-1.5 rounded-full bg-accent/50" />
      </div>
      <div className="flex-1 h-2 rounded-sm bg-muted/50 mx-1" />
    </div>
  )
}

function DeviceFrame({
  variant,
  coverUrl,
  name,
  dateRange,
  tagline,
}: {
  variant: PreviewVariant
  coverUrl: string
  name: string
  dateRange: string | null
  tagline?: string | null
}) {
  const isMobile = variant === "mobile"

  return (
    <div
      className={cn(
        "overflow-hidden border border-border/50 bg-background shadow-sm",
        isMobile ? "w-[118px] rounded-[1.35rem] border-2" : "w-[360px] max-w-full rounded-lg"
      )}
    >
      <DeviceChrome variant={variant} />
      <HeroFrame
        coverUrl={coverUrl}
        name={name}
        dateRange={dateRange}
        tagline={tagline}
        variant={variant}
      />
    </div>
  )
}

function ScaledDeviceFrame({
  variant,
  ...frameProps
}: {
  variant: PreviewVariant
  coverUrl: string
  name: string
  dateRange: string | null
  tagline?: string | null
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const { width, height } = getFrameDimensions(variant)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateScale = () => {
      if (variant === "desktop") {
        const availableWidth = container.clientWidth
        if (!availableWidth) return
        setScale(availableWidth / width)
        return
      }

      const availableHeight = container.clientHeight
      if (!availableHeight) return
      setScale(availableHeight / height)
    }

    updateScale()
    const observer = new ResizeObserver(updateScale)
    observer.observe(container)
    return () => observer.disconnect()
  }, [variant, width, height])

  return (
    <div
      ref={containerRef}
      className={cn(
        variant === "mobile"
          ? "h-full flex items-center justify-center"
          : "w-full flex justify-center"
      )}
    >
      <div
        className="relative shrink-0"
        style={{ width: width * scale, height: height * scale }}
      >
        <div
          className="absolute top-1/2 left-1/2"
          style={{
            transform: `translate(-50%, -50%) scale(${scale})`,
            transformOrigin: "center center",
          }}
        >
          <DeviceFrame variant={variant} {...frameProps} />
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
  const [view, setView] = useState<PreviewVariant>("mobile")
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)")
    setView(mq.matches ? "desktop" : "mobile")

    const onChange = (event: MediaQueryListEvent) => {
      setView(event.matches ? "desktop" : "mobile")
    }

    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  const frameProps = {
    coverUrl,
    name: displayName,
    dateRange,
    tagline,
  }

  return (
    <div className={cn("space-y-4", className)}>
      <p className="text-xs text-muted-foreground text-center">
        What you can expect to see on the memorial page
      </p>

      <Tabs
        value={view}
        onValueChange={(value) => setView(value as PreviewVariant)}
        className="gap-4"
      >
        <TabsList className="mx-auto h-8">
          <TabsTrigger value="mobile" className="gap-1.5 px-3 text-xs">
            <Smartphone className="w-3.5 h-3.5" />
            Mobile
          </TabsTrigger>
          <TabsTrigger value="desktop" className="gap-1.5 px-3 text-xs">
            <Monitor className="w-3.5 h-3.5" />
            Desktop
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mobile" className="flex justify-center mt-0">
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
            aria-label="Enlarge mobile preview"
            className="group relative cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-[1.35rem]"
          >
            <DeviceFrame variant="mobile" {...frameProps} />
            <span className="absolute inset-0 flex items-center justify-center rounded-[1.35rem] bg-black/0 transition-colors group-hover:bg-black/25 pointer-events-none">
              <span className="flex items-center gap-1.5 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-medium text-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                <ZoomIn className="w-3 h-3" />
                Enlarge
              </span>
            </span>
          </div>
        </TabsContent>
        <TabsContent value="desktop" className="flex justify-center mt-0 px-2">
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
            aria-label="Enlarge desktop preview"
            className="group relative w-[360px] max-w-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg"
          >
            <DeviceFrame variant="desktop" {...frameProps} />
            <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 transition-colors group-hover:bg-black/25 pointer-events-none">
              <span className="flex items-center gap-1.5 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-medium text-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                <ZoomIn className="w-3 h-3" />
                Enlarge
              </span>
            </span>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent
          className={cn(
            "flex flex-col items-center border-border/50 p-4 sm:p-6 gap-3",
            view === "mobile"
              ? "w-auto max-w-[calc(100vw-2rem)]"
              : "w-[calc(100vw-2rem)] max-w-4xl"
          )}
        >
          <DialogTitle className="font-serif text-lg text-center self-stretch">
            {view === "mobile" ? "Mobile preview" : "Desktop preview"}
          </DialogTitle>
          <div
            className={cn(
              "flex items-center justify-center",
              view === "mobile" ? "h-[min(70vh,24rem)]" : "w-full"
            )}
          >
            <ScaledDeviceFrame variant={view} {...frameProps} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
