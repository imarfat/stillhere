"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { toast } from "sonner"
import { motion, AnimatePresence, useInView } from "framer-motion"
import {
  Flame, Flower2, ChevronDown, ChevronLeft, ChevronRight,
  MessageSquare, Share2, Copy, Download, X,
  Heart, Instagram, Facebook, CheckCircle2,
  BookOpen, Clock, ImageIcon, Music, Video,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { formatDate, formatRelativeTime } from "@/lib/slug"
import { SongEmbed, SongAudioPlayer, SafeVideoEmbed } from "@/components/app/SongEmbed"
import { getSafeMediaUrl } from "@/lib/security"
import { LifeTimeline } from "@/components/app/LifeTimeline"
import { MemorialGutterDots } from "@/components/app/MemorialHeroDots"
import { AppLoadingScreen } from "@/components/app/AppLoadingScreen"

const loaderExit = { opacity: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } }

const memorialSectionTransition = { duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] as const }
const tributesRevealDelayMs = 650 + 650

function MemorialAnimatedSection({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.12 })
  const [tributesReady, setTributesReady] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setTributesReady(true), tributesRevealDelayMs)
    return () => clearTimeout(timer)
  }, [])

  const visible = tributesReady && isInView

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={memorialSectionTransition}
      className={className}
    >
      {children}
    </motion.section>
  )
}

function MemorialSectionTitle({
  icon: Icon,
  children,
}: {
  icon: LucideIcon
  children: React.ReactNode
}) {
  return (
    <h2 className="font-serif text-2xl font-bold mb-5 flex items-center gap-2.5">
      <Icon className="w-5 h-5 shrink-0 text-primary/50" strokeWidth={1.75} />
      {children}
    </h2>
  )
}

interface MemorialData {
  id: string
  name: string
  slug: string
  dob: string | null
  dod: string | null
  tagline: string | null
  bio: string | null
  coverPhotoUrl: string | null
  restingPlace: string | null
  songUrl: string | null
  songEmbedUrl: string | null
  songTitle: string | null
  songArtist: string | null
  photos: { id: string; url: string; sortOrder: number }[]
  videos: { id: string; embedUrl: string; title: string | null }[]
  timelineEvents: { id: string; eventDate: string | null; title: string; description: string | null }[]
  guestbookEntries: { id: string; visitorName: string; message: string; createdAt: string }[]
  tributes: { id: string; kind: string; visitorName: string | null; note: string | null; createdAt: string }[]
}

export function MemorialPage({ slug }: { slug: string }) {
  const router = useRouter()
  const [data, setData] = useState<MemorialData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // Photo carousel
  const [currentPhoto, setCurrentPhoto] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  // Tributes
  const [candleCount, setCandleCount] = useState(0)
  const [flowerCount, setFlowerCount] = useState(0)
  const [recentTributes, setRecentTributes] = useState<MemorialData["tributes"]>([])
  const [tributeForm, setTributeForm] = useState({ kind: "candle" as "candle" | "flower", visitorName: "", note: "" })
  const [tributeOpen, setTributeOpen] = useState(false)
  const [leavingTribute, setLeavingTribute] = useState(false)

  // Guestbook
  const [guestbookOpen, setGuestbookOpen] = useState(false)
  const [guestForm, setGuestForm] = useState({ visitorName: "", message: "" })
  const [submittingGuest, setSubmittingGuest] = useState(false)
  const [guestSubmitted, setGuestSubmitted] = useState(false)

  // Sticky nav
  const [showStickyNav, setShowStickyNav] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const carouselRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  const fetchMemorial = useCallback(async () => {
    try {
      const res = await fetch(`/api/memorial/${slug}`)
      if (res.ok) {
        const d = await res.json()
        setData({
          ...d,
          photos: d.photos ?? [],
          videos: d.videos ?? [],
          timelineEvents: d.timelineEvents ?? [],
          guestbookEntries: d.guestbookEntries ?? [],
          tributes: d.tributes ?? [],
        })
        setCurrentPhoto(0)
        setLightboxOpen(false)
        const candles = d.tributes?.filter((t: { kind: string }) => t.kind === "candle").length || 0
        const flowers = d.tributes?.filter((t: { kind: string }) => t.kind === "flower").length || 0
        setCandleCount(candles)
        setFlowerCount(flowers)
        setRecentTributes((d.tributes || []).slice(-3).reverse())
      } else {
        setNotFound(true)
      }
    } catch {
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    fetchMemorial()
  }, [fetchMemorial])

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return
      const rect = heroRef.current.getBoundingClientRect()
      const threshold = window.innerHeight * 0.22
      setShowStickyNav(rect.bottom < threshold)
    }
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("resize", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleScroll)
    }
  }, [])

  // --- Tribute handler ---
  const handleLeaveTribute = async () => {
    setLeavingTribute(true)
    try {
      const res = await fetch(`/api/memorials/${data?.id}/tributes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: tributeForm.kind,
          visitorName: tributeForm.visitorName || null,
          note: tributeForm.note || null,
        }),
      })
      if (res.ok) {
        const newTribute = await res.json()
        if (tributeForm.kind === "candle") setCandleCount((c) => c + 1)
        else setFlowerCount((c) => c + 1)
        setRecentTributes((prev) => [newTribute, ...prev].slice(0, 3))
        setTributeForm({ kind: "candle", visitorName: "", note: "" })
        setTributeOpen(false)
        toast.success(tributeForm.kind === "candle" ? "🕯️ Candle lit" : "🌸 Flower left")
      }
    } catch {
      toast.error("Failed to leave tribute")
    } finally {
      setLeavingTribute(false)
    }
  }

  // --- Guestbook handler ---
  const handleSubmitGuestbook = async () => {
    if (!guestForm.visitorName.trim() || !guestForm.message.trim()) {
      toast.error("Please fill in your name and message")
      return
    }
    setSubmittingGuest(true)
    try {
      const res = await fetch(`/api/memorials/${data?.id}/guestbook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorName: guestForm.visitorName,
          message: guestForm.message,
        }),
      })
      if (res.ok) {
        setGuestSubmitted(true)
        setGuestForm({ visitorName: "", message: "" })
        toast.success("Message submitted! It will appear after approval.")
      }
    } catch {
      toast.error("Failed to submit message")
    } finally {
      setSubmittingGuest(false)
    }
  }

  // --- Share ---
  const handleShareWhatsApp = () => {
    const url = `${window.location.origin}/memorial/${slug}`
    const text = `In loving memory of ${data?.name}. View their memorial: ${url}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank")
  }

  const handleShareFacebook = () => {
    const url = `${window.location.origin}/memorial/${slug}`
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank")
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/memorial/${slug}`)
    toast.success("Link copied!")
  }

  // --- Photo navigation ---
  const nextPhoto = () => {
    if (data && data.photos.length > 0) {
      setCurrentPhoto((prev) => (prev + 1) % data.photos.length)
    }
  }
  const prevPhoto = () => {
    if (data && data.photos.length > 0) {
      setCurrentPhoto((prev) => (prev - 1 + data.photos.length) % data.photos.length)
    }
  }

  // Touch swipe handlers for photo gallery
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextPhoto()
      else prevPhoto()
    }
  }

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return
      if (e.key === "Escape") setLightboxOpen(false)
      if (e.key === "ArrowRight") nextPhoto()
      if (e.key === "ArrowLeft") prevPhoto()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [lightboxOpen])

  const getDateRange = () => {
    if (!data?.dob && !data?.dod) return null
    const dob = data?.dob ? formatDate(data.dob) : ""
    const dod = data?.dod ? formatDate(data.dod) : ""
    if (dob && dod) return `${dob} to ${dod}`
    if (dod) return dod
    if (dob) return dob
    return null
  }

  const photos = (data?.photos ?? []).filter((photo) => getSafeMediaUrl(photo.url))
  const activePhoto = photos[currentPhoto]
  const coverPhotoUrl = getSafeMediaUrl(data?.coverPhotoUrl ?? null)

  return (
    <div className="min-h-dvh bg-background">
      {!loading && (notFound || !data) && (
        <motion.div
          key="memorial-not-found"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="min-h-dvh flex items-center justify-center px-6 bg-grain"
        >
          <div className="text-center max-w-sm">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/[0.06] border border-primary/10 mb-6">
              <Heart className="w-8 h-8 text-primary/40" />
            </div>
            <h1 className="font-serif text-3xl font-bold mb-3">Memorial not found</h1>
            <p className="text-muted-foreground text-sm leading-relaxed mb-8">
              This memorial may have been removed or the link is incorrect.
            </p>
            <Button
              onClick={() => router.push("/")}
              className="bg-primary text-primary-foreground hover:opacity-90 rounded-full px-6"
            >
              Go to StillHere
            </Button>
          </div>
        </motion.div>
      )}

      {!loading && data && (
        <motion.div
          key={`memorial-${slug}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="relative min-h-dvh flex flex-col md:bg-muted/25"
        >
      <MemorialGutterDots />
      {/* Sticky Nav */}
      <AnimatePresence>
        {showStickyNav && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            className="fixed top-0 inset-x-0 z-50 flex justify-center pointer-events-none"
          >
            <div className="memorial-page-frame w-full px-6 py-3 flex items-center justify-between bg-background/90 backdrop-blur-lg border-b border-border/50 md:border-x md:border-border/40 pointer-events-auto">
              <div className="memorial-sticky-heading min-w-0">
                <p className="memorial-sticky-epigraph">In loving memory of</p>
                <p className="font-serif text-lg font-semibold truncate">{data.name}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleCopyLink} className="gap-1.5">
                <Share2 className="w-3.5 h-3.5" />
                Share
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="memorial-page-frame relative z-10 mx-auto w-full flex-1 flex flex-col bg-background md:border-x md:border-border/40 md:shadow-[0_0_60px_rgba(0,0,0,0.06)]">
      {/* Hero */}
      <section ref={heroRef} className="memorial-hero relative">
        <div className="memorial-hero-inner">
          <div className="memorial-hero-photo">
            {coverPhotoUrl ? (
              <>
                <motion.img
                  src={coverPhotoUrl}
                  alt=""
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 hero-overlay" />
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                className="absolute inset-0 memorial-hero-fallback-bg"
              />
            )}
            <div className="absolute inset-0 bg-grain" />
          </div>

          <div className="memorial-hero-content w-full">
            <div className="px-6">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, delay: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="memorial-hero-copy"
              >
                <p className="memorial-hero-epigraph">In loving memory of</p>
                <div className="memorial-hero-headline">
                  <h1 className="memorial-hero-name text-4xl font-bold">
                    {data.name}
                  </h1>
                  {getDateRange() && (
                    <p className="memorial-hero-dates">{getDateRange()}</p>
                  )}
                </div>
                {(data.tagline || data.restingPlace) && (
                  <div className="memorial-hero-meta">
                    {data.tagline && (
                      <p className="memorial-hero-tagline">&ldquo;{data.tagline}&rdquo;</p>
                    )}
                    {data.restingPlace && (
                      <p className="memorial-hero-resting">
                        <span className="memorial-hero-resting-label">Resting at</span>
                        <span className="memorial-hero-resting-sep" aria-hidden="true">
                          ·
                        </span>
                        <span className="memorial-hero-resting-place">{data.restingPlace}</span>
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content + Footer */}
      <div className="relative flex-1 flex flex-col">
        <main className="relative z-10 flex-1">
        <div className="px-6">

          {/* Tributes Bar */}
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="memorial-tributes-section"
          >
            <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-lg shadow-primary/5">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <p className="text-xs text-muted-foreground">Leave a tribute</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTributeForm({ ...tributeForm, kind: "candle" })
                      setTributeOpen(tributeOpen && tributeForm.kind === "candle" ? false : true)
                    }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-300 ${
                      tributeForm.kind === "candle" && tributeOpen
                        ? "bg-candle/15 border border-candle/30 text-candle"
                        : "bg-muted/50 border border-transparent hover:bg-muted"
                    }`}
                  >
                    <Flame className={`w-4 h-4 ${tributeForm.kind === "candle" && tributeOpen ? "animate-candle-flicker" : ""}`} />
                    <span className="text-sm font-medium tabular-nums">{candleCount}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTributeForm({ ...tributeForm, kind: "flower" })
                      setTributeOpen(tributeOpen && tributeForm.kind === "flower" ? false : true)
                    }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-300 ${
                      tributeForm.kind === "flower" && tributeOpen
                        ? "bg-flower/15 border border-flower/30 text-flower"
                        : "bg-muted/50 border border-transparent hover:bg-muted"
                    }`}
                  >
                    <Flower2 className="w-4 h-4" />
                    <span className="text-sm font-medium tabular-nums">{flowerCount}</span>
                  </button>
                </div>
              </div>

              {/* Tribute form */}
              <AnimatePresence>
                {tributeOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-3 pt-2 pb-3 border-t border-border/30 mt-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Your name (optional)</Label>
                          <Input
                            value={tributeForm.visitorName}
                            onChange={(e) => setTributeForm({ ...tributeForm, visitorName: e.target.value })}
                            maxLength={60}
                            placeholder="Anonymous"
                            className="h-9 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Note (optional)</Label>
                          <Input
                            value={tributeForm.note}
                            onChange={(e) => setTributeForm({ ...tributeForm, note: e.target.value })}
                            maxLength={140}
                            placeholder="A short note..."
                            className="h-9 text-sm"
                          />
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={handleLeaveTribute}
                        disabled={leavingTribute}
                        className="w-full"
                      >
                        {leavingTribute ? "..." : tributeForm.kind === "candle" ? "🕯️ Light a Candle" : "🌸 Leave a Flower"}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Recent tributes feed */}
              {recentTributes.length > 0 && (
                <div className="mt-4 space-y-2 border-t border-border/30 pt-4">
                  <p className="text-xs text-muted-foreground font-medium mb-2">Recent tributes</p>
                  {recentTributes.map((t) => (
                    <div key={t.id} className="flex items-center gap-2 text-sm">
                      {t.kind === "candle" ? (
                        <Flame className="w-3.5 h-3.5 text-candle shrink-0" />
                      ) : (
                        <Flower2 className="w-3.5 h-3.5 text-flower shrink-0" />
                      )}
                      <span className="font-medium">{t.visitorName || "Someone"}</span>
                      {t.note && <span className="text-muted-foreground truncate flex-1">&ldquo;{t.note}&rdquo;</span>}
                      <span className="text-xs text-muted-foreground/60 shrink-0">{formatRelativeTime(t.createdAt)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.section>

          {/* Biography */}
          {data.bio && (
            <MemorialAnimatedSection className="py-6">
              <MemorialSectionTitle icon={BookOpen}>Their Story</MemorialSectionTitle>
              <div className="text-sm text-muted-foreground leading-relaxed font-sans whitespace-pre-wrap">
                {data.bio}
              </div>
            </MemorialAnimatedSection>
          )}

          {/* Timeline */}
          {data.timelineEvents && data.timelineEvents.length > 0 && (
            <MemorialAnimatedSection className="py-6">
              <MemorialSectionTitle icon={Clock}>Life Timeline</MemorialSectionTitle>
              <LifeTimeline events={data.timelineEvents} />
            </MemorialAnimatedSection>
          )}

          {/* Photo Gallery */}
          {photos.length > 0 && activePhoto && (
            <MemorialAnimatedSection className="py-6">
              <MemorialSectionTitle icon={ImageIcon}>Gallery</MemorialSectionTitle>
              <div
                ref={carouselRef}
                className="relative rounded-2xl overflow-hidden bg-muted touch-pan-y"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentPhoto}
                    src={activePhoto.url}
                    alt=""
                    className="w-full aspect-[4/3] object-cover cursor-pointer"
                    onClick={() => setLightboxOpen(true)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </AnimatePresence>

                {/* Nav arrows */}
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={prevPhoto}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center hover:bg-background/90 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextPhoto}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center hover:bg-background/90 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Dot indicators */}
                {photos.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {photos.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPhoto(i)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          i === currentPhoto ? "bg-primary w-6" : "bg-background/60"
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Counter */}
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-background/70 backdrop-blur-sm text-xs font-medium">
                  {currentPhoto + 1} / {photos.length}
                </div>
              </div>
            </MemorialAnimatedSection>
          )}

          {/* Favourite Song */}
          {(data.songEmbedUrl || data.songUrl) && (
            <MemorialAnimatedSection className="py-6">
              <MemorialSectionTitle icon={Music}>Favourite Song</MemorialSectionTitle>
              {data.songEmbedUrl ? (
                <SongEmbed embedUrl={data.songEmbedUrl} />
              ) : (
                <SongAudioPlayer
                  url={data.songUrl!}
                  title={data.songTitle}
                  artist={data.songArtist}
                />
              )}
            </MemorialAnimatedSection>
          )}

          {/* Video Tributes */}
          {data.videos && data.videos.length > 0 && (
            <MemorialAnimatedSection className="py-6">
              <MemorialSectionTitle icon={Video}>Video Tributes</MemorialSectionTitle>
              <div className="grid grid-cols-1 gap-4">
                {data.videos.map((video) => (
                  <div key={video.id} className="rounded-2xl overflow-hidden bg-card border border-border/50">
                    <div className="aspect-video">
                      <SafeVideoEmbed embedUrl={video.embedUrl} />
                    </div>
                    {video.title && (
                      <p className="px-4 py-2 text-sm font-medium text-center">{video.title}</p>
                    )}
                  </div>
                ))}
              </div>
            </MemorialAnimatedSection>
          )}

          {/* Guestbook */}
          <MemorialAnimatedSection className="py-6">
            <MemorialSectionTitle icon={MessageSquare}>Guestbook</MemorialSectionTitle>

            {/* Messages */}
            {(!data.guestbookEntries || data.guestbookEntries.length === 0) ? (
              <div className="text-center py-8 bg-muted/30 rounded-2xl">
                <MessageSquare className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No messages yet. Be the first to leave one.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.guestbookEntries.map((entry) => (
                  <Card key={entry.id} className="border-border/50 bg-muted/20">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-sm">{entry.visitorName}</p>
                          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed whitespace-pre-wrap">{entry.message}</p>
                        </div>
                        <span className="text-xs text-muted-foreground/50 shrink-0">{formatRelativeTime(entry.createdAt)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Submission form */}
            <Collapsible open={guestbookOpen} onOpenChange={setGuestbookOpen} className="mt-5">
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full rounded-xl border-dashed hover:border-primary/50"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {guestbookOpen ? "Close" : "Leave a message"}
                  <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${guestbookOpen ? "rotate-180" : ""}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                {guestSubmitted ? (
                  <div className="text-center py-6 bg-accent/10 rounded-xl">
                    <CheckCircle2 className="w-8 h-8 text-accent mx-auto mb-2" />
                    <p className="text-sm font-medium">Message submitted!</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your message will appear after it&apos;s been approved by the memorial owner.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-sm">Your Name</Label>
                      <Input
                        value={guestForm.visitorName}
                        onChange={(e) => setGuestForm({ ...guestForm, visitorName: e.target.value })}
                        maxLength={120}
                        placeholder="Your name"
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm">Message</Label>
                      <Textarea
                        value={guestForm.message}
                        onChange={(e) => setGuestForm({ ...guestForm, message: e.target.value })}
                        maxLength={2000}
                        placeholder="Share a memory or message..."
                        required
                        rows={4}
                        className="resize-y"
                      />
                      <p className="text-xs text-muted-foreground text-right">
                        {guestForm.message.length}/2000
                      </p>
                    </div>
                    <Button
                      onClick={handleSubmitGuestbook}
                      disabled={submittingGuest}
                      className="w-full bg-primary text-primary-foreground hover:opacity-90"
                    >
                      {submittingGuest ? "Submitting..." : "Submit Message"}
                    </Button>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          </MemorialAnimatedSection>

          {/* Share */}
          <MemorialAnimatedSection className="py-6">
            <MemorialSectionTitle icon={Share2}>Share</MemorialSectionTitle>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShareWhatsApp}
                className="w-full min-w-0 gap-1 rounded-xl px-2 text-xs"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span className="truncate">WhatsApp</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShareFacebook}
                className="w-full min-w-0 gap-1 rounded-xl px-2 text-xs"
              >
                <Facebook className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Facebook</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="w-full min-w-0 gap-1 rounded-xl px-2 text-xs"
              >
                <Copy className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Copy</span>
              </Button>
            </div>
          </MemorialAnimatedSection>
        </div>
        </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-6 border-t border-border/50 mt-auto">
        <div className="text-center">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="font-serif text-xl font-semibold text-gradient-warm hover:opacity-80 transition-opacity"
          >
            StillHere
          </button>
          <p className="text-xs text-muted-foreground mt-2">
            Create a memorial for someone you love
          </p>
        </div>
      </footer>
      </div>
      </div>

      {/* Lightbox Dialog */}
      {photos.length > 0 && activePhoto && (
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent showCloseButton={false} className="max-w-[95vw] sm:max-w-4xl p-0 bg-black/95 border-none">
          <div
            className="relative flex items-center justify-center min-h-[60vh] sm:min-h-[80vh]"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={currentPhoto}
                src={activePhoto.url}
                alt=""
                className="max-w-full max-h-[80vh] object-contain"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            </AnimatePresence>

            {/* Lightbox controls */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            {photos.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={nextPhoto}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </>
            )}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
              {currentPhoto + 1} / {photos.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      )}
        </motion.div>
      )}

      <AnimatePresence>
        {loading && (
          <motion.div
            key="memorial-loading"
            className="fixed inset-0 z-50"
            exit={loaderExit}
          >
            <AppLoadingScreen className="h-full min-h-0" label="Loading memorial" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
