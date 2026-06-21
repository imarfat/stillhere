"use client"

import { useEffect, useState, useCallback } from "react"
import { useNavigation } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { motion } from "framer-motion"
import {
  ArrowLeft, ExternalLink, Copy, Download, Check, Loader2, Plus, Trash2,
  ChevronUp, ChevronDown, Upload, X, Image as ImageIcon, Music,
  Video, MessageSquare, CheckCircle2, Clock, Flame, Flower2, ShieldAlert,
  Calendar, MapPin, PenLine, Quote, BookOpen, Link2, Type, User, Share2, AlignLeft,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { formatDate } from "@/lib/slug"
import { SongEmbed, SongAudioPlayer } from "@/components/app/SongEmbed"
import { CoverHeroPreview } from "@/components/app/CoverHeroPreview"
import { invalidateDashboardMemorials } from "@/lib/dashboard-cache"
import { invalidateSettingsStats } from "@/lib/settings-cache"
import { cn } from "@/lib/utils"

function FieldLabel({
  icon: Icon,
  children,
  className,
  size = "sm",
}: {
  icon: LucideIcon
  children: React.ReactNode
  className?: string
  size?: "sm" | "md"
}) {
  return (
    <Label
      className={cn(
        "flex items-center gap-1.5 font-medium",
        size === "md" ? "text-base gap-2" : "text-sm",
        className
      )}
    >
      <Icon
        className={cn(
          "shrink-0 text-primary/50",
          size === "md" ? "w-4 h-4 text-primary/60" : "w-3.5 h-3.5"
        )}
      />
      {children}
    </Label>
  )
}

function AccordionSectionLabel({
  title,
  meta,
  metaClassName,
  icon: Icon,
}: {
  title: string
  meta?: string
  metaClassName?: string
  icon?: LucideIcon
}) {
  return (
    <span className="flex flex-1 items-center justify-between gap-3 min-w-0 pr-1">
      <span data-accordion-title className="flex items-center gap-2 truncate min-w-0">
        {Icon && <Icon className="w-4 h-4 shrink-0 text-primary/50" />}
        <span className="truncate">{title}</span>
      </span>
      {meta && (
        <span className={cn("text-xs font-sans font-normal text-muted-foreground shrink-0", metaClassName)}>
          {meta}
        </span>
      )}
    </span>
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
}

interface TimelineEvent {
  id: string
  eventDate: string | null
  title: string
  description: string | null
}

interface Photo {
  id: string
  url: string
  sortOrder: number
}

interface VideoItem {
  id: string
  embedUrl: string
  title: string | null
}

interface GuestbookEntry {
  id: string
  visitorName: string
  message: string
  approved: boolean
  createdAt: string
}

interface Tribute {
  id: string
  kind: string
  visitorName: string | null
  note: string | null
  createdAt: string
}

export function EditMemorialPage({ memorialId }: { memorialId: string }) {
  const { navigate, back } = useNavigation()
  const [memorial, setMemorial] = useState<MemorialData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Timeline
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([])
  const [newEvent, setNewEvent] = useState({ eventDate: "", title: "", description: "" })
  const [addingTimeline, setAddingTimeline] = useState(false)

  // Photos
  const [photos, setPhotos] = useState<Photo[]>([])
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  // Videos
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [newVideoUrl, setNewVideoUrl] = useState("")
  const [newVideoTitle, setNewVideoTitle] = useState("")
  const [addingVideo, setAddingVideo] = useState(false)

  // Song
  const [songMode, setSongMode] = useState<"embed" | "upload">("embed")
  const [songLink, setSongLink] = useState("")
  const [songTitle, setSongTitle] = useState("")
  const [songArtist, setSongArtist] = useState("")
  const [songFile, setSongFile] = useState<File | null>(null)
  const [savingSong, setSavingSong] = useState(false)

  // Guestbook
  const [guestbookEntries, setGuestbookEntries] = useState<GuestbookEntry[]>([])
  const [loadingGuestbook, setLoadingGuestbook] = useState(true)

  // Tributes
  const [tributeCounts, setTributeCounts] = useState({ candles: 0, flowers: 0 })

  // QR
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  // Danger zone
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Form state
  const [form, setForm] = useState({
    name: "",
    dob: "",
    dod: "",
    tagline: "",
    restingPlace: "",
    bio: "",
    coverPhotoUrl: "",
  })
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)

  const fetchMemorial = useCallback(async () => {
    try {
      const res = await fetch(`/api/memorials/${memorialId}`)
      if (res.ok) {
        const data = await res.json()
        setMemorial(data)
        setForm({
          name: data.name,
          dob: data.dob ? data.dob.split("T")[0] : "",
          dod: data.dod ? data.dod.split("T")[0] : "",
          tagline: data.tagline || "",
          restingPlace: data.restingPlace || "",
          bio: data.bio || "",
          coverPhotoUrl: data.coverPhotoUrl || "",
        })
        setCoverPreview(data.coverPhotoUrl || null)
      }
    } catch {
      toast.error("Failed to load memorial")
    } finally {
      setLoading(false)
    }
  }, [memorialId])

  const fetchTimeline = useCallback(async () => {
    try {
      const res = await fetch(`/api/memorial/${memorial.slug}`)
      if (res.ok) {
        const data = await res.json()
        setTimelineEvents(data.timelineEvents || [])
        setPhotos(data.photos || [])
        setVideos(data.videos || [])
        setTributeCounts({
          candles: data.tributes?.filter((t: Tribute) => t.kind === "candle").length || 0,
          flowers: data.tributes?.filter((t: Tribute) => t.kind === "flower").length || 0,
        })
      }
    } catch {
      // silently fail for now
    }
  }, [memorialId, memorial?.slug])

  const fetchGuestbook = useCallback(async () => {
    setLoadingGuestbook(true)
    try {
      const res = await fetch(`/api/memorials/${memorialId}/guestbook`)
      if (res.ok) {
        const data = await res.json()
        setGuestbookEntries(data)
      }
    } catch {
      // silently fail
    } finally {
      setLoadingGuestbook(false)
    }
  }, [memorialId])

  useEffect(() => {
    fetchMemorial()
  }, [fetchMemorial])

  useEffect(() => {
    if (memorial?.slug) {
      fetchTimeline()
      fetchGuestbook()
    }
  }, [memorial?.slug, fetchTimeline, fetchGuestbook])

  // --- Details Save ---
  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    try {
      let coverUrl = form.coverPhotoUrl

      if (coverFile) {
        const formData = new FormData()
        formData.append("file", coverFile)
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData })
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json()
          coverUrl = uploadData.url
        }
      }

      const res = await fetch(`/api/memorials/${memorialId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          dob: form.dob || null,
          dod: form.dod || null,
          tagline: form.tagline || null,
          restingPlace: form.restingPlace || null,
          bio: form.bio || null,
          coverPhotoUrl: coverUrl || null,
        }),
      })

      if (res.ok) {
        setSaved(true)
        setCoverFile(null)
        toast.success("Memorial updated")
        fetchMemorial()
        setTimeout(() => setSaved(false), 2000)
      } else {
        toast.error("Failed to save")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  // --- Timeline ---
  const handleAddTimelineEvent = async () => {
    if (!newEvent.title.trim()) return
    setAddingTimeline(true)
    try {
      const res = await fetch(`/api/memorials/${memorialId}/timeline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventDate: newEvent.eventDate || null,
          title: newEvent.title,
          description: newEvent.description || null,
        }),
      })
      if (res.ok) {
        setNewEvent({ eventDate: "", title: "", description: "" })
        toast.success("Event added")
        fetchTimeline()
      }
    } catch {
      toast.error("Failed to add event")
    } finally {
      setAddingTimeline(false)
    }
  }

  const handleDeleteTimelineEvent = async (eventId: string) => {
    try {
      const res = await fetch(`/api/memorials/${memorialId}/timeline/${eventId}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Event removed")
        fetchTimeline()
      }
    } catch {
      toast.error("Failed to remove event")
    }
  }

  // --- Photos ---
  const handleUploadPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setUploadingPhoto(true)
    for (const file of files) {
      if (!file.type.startsWith("image/")) continue
      try {
        const formData = new FormData()
        formData.append("file", file)
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData })
        if (uploadRes.ok) {
          const { url } = await uploadRes.json()
          await fetch(`/api/memorials/${memorialId}/photos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url }),
          })
        }
      } catch {
        // continue
      }
    }
    setUploadingPhoto(false)
    toast.success("Photos uploaded")
    fetchTimeline()
  }

  const handleDeletePhoto = async (photoId: string) => {
    try {
      const res = await fetch(`/api/memorials/${memorialId}/photos/${photoId}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Photo removed")
        fetchTimeline()
      }
    } catch {
      toast.error("Failed to remove photo")
    }
  }

  const handleReorderPhotos = async (photoId: string, direction: "up" | "down") => {
    const idx = photos.findIndex((p) => p.id === photoId)
    if ((direction === "up" && idx === 0) || (direction === "down" && idx === photos.length - 1)) return

    const newOrder = [...photos]
    const swapIdx = direction === "up" ? idx - 1 : idx + 1
    ;[newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]]

    try {
      await fetch(`/api/memorials/${memorialId}/photos/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoIds: newOrder.map((p) => p.id) }),
      })
      fetchTimeline()
    } catch {
      toast.error("Failed to reorder")
    }
  }

  // --- Videos ---
  const handleAddVideo = async () => {
    if (!newVideoUrl.trim()) return
    setAddingVideo(true)
    try {
      const res = await fetch(`/api/memorials/${memorialId}/videos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newVideoUrl, title: newVideoTitle || null }),
      })
      if (res.ok) {
        setNewVideoUrl("")
        setNewVideoTitle("")
        toast.success("Video added")
        fetchTimeline()
      } else {
        const data = await res.json()
        toast.error(data.error || "Invalid video URL")
      }
    } catch {
      toast.error("Failed to add video")
    } finally {
      setAddingVideo(false)
    }
  }

  const handleDeleteVideo = async (videoId: string) => {
    try {
      const res = await fetch(`/api/memorials/${memorialId}/videos/${videoId}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Video removed")
        fetchTimeline()
      }
    } catch {
      toast.error("Failed to remove video")
    }
  }

  // --- Song ---
  const handleSaveSong = async () => {
    setSavingSong(true)
    try {
      let songUrl: string | undefined
      let songEmbedUrl: string | undefined

      if (songMode === "embed" && songLink) {
        const res = await fetch(`/api/memorials/${memorialId}/song`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            songEmbedUrl: songLink,
            songTitle: null,
            songArtist: null,
          }),
        })
        if (res.ok) {
          toast.success("Song saved")
          fetchMemorial()
        } else {
          const data = await res.json()
          toast.error(data.error || "Invalid song link")
        }
      } else if (songMode === "upload" && songFile) {
        const formData = new FormData()
        formData.append("file", songFile)
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData })
        if (uploadRes.ok) {
          const { url } = await uploadRes.json()
          songUrl = url
        }
        const res = await fetch(`/api/memorials/${memorialId}/song`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            songUrl,
            songTitle: songTitle || null,
            songArtist: songArtist || null,
          }),
        })
        if (res.ok) {
          toast.success("Song saved")
          fetchMemorial()
        }
      }
    } catch {
      toast.error("Failed to save song")
    } finally {
      setSavingSong(false)
    }
  }

  const handleRemoveSong = async () => {
    try {
      await fetch(`/api/memorials/${memorialId}/song`, { method: "DELETE" })
      toast.success("Song removed")
      fetchMemorial()
    } catch {
      toast.error("Failed to remove song")
    }
  }

  // --- Guestbook ---
  const handleApproveEntry = async (entryId: string) => {
    try {
      await fetch(`/api/memorials/${memorialId}/guestbook/${entryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: true }),
      })
      toast.success("Entry approved")
      fetchGuestbook()
    } catch {
      toast.error("Failed to approve")
    }
  }

  const handleDeleteEntry = async (entryId: string) => {
    try {
      await fetch(`/api/memorials/${memorialId}/guestbook/${entryId}`, { method: "DELETE" })
      toast.success("Entry deleted")
      fetchGuestbook()
    } catch {
      toast.error("Failed to delete")
    }
  }

  // --- QR ---
  const handleOpenQR = async () => {
    try {
      const res = await fetch(`/api/memorials/${memorialId}/qr`)
      if (res.ok) {
        const data = await res.json()
        setQrDataUrl(data.qrDataUrl)
        setQrDialogOpen(true)
      }
    } catch {
      toast.error("Failed to generate QR code")
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/memorial/${memorial?.slug}`)
    toast.success("Link copied!")
  }

  const handleDownloadQR = () => {
    if (!qrDataUrl) return
    const a = document.createElement("a")
    a.href = qrDataUrl
    a.download = `stillhere-${memorial?.slug || "qr"}.png`
    a.click()
  }

  // --- Delete ---
  const handleDeleteMemorial = async () => {
    setDeleting(true)
    try {
      await fetch(`/api/memorials/${memorialId}`, { method: "DELETE" })
      invalidateDashboardMemorials()
      invalidateSettingsStats()
      toast.success("Memorial deleted")
      navigate({ page: "dashboard" })
    } catch {
      toast.error("Failed to delete")
    } finally {
      setDeleting(false)
    }
  }

  const pendingCount = guestbookEntries.filter((e) => !e.approved).length
  const publishedCount = guestbookEntries.filter((e) => e.approved).length

  if (loading) {
    return (
      <div className="min-h-screen px-6 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="px-6 py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <Button variant="plain" size="icon" onClick={back} className="shrink-0">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="min-w-0">
                <h1 className="font-serif text-lg font-semibold truncate max-w-[200px] sm:max-w-xs">
                  {memorial?.name}
                </h1>
                <p className="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-xs">
                  /memorial/{memorial?.slug}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate({ page: "memorial", slug: memorial?.slug || "" })}
              className="gap-1.5 shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">View</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto space-y-4"
        >
          <Accordion type="multiple" defaultValue={["share", "details", ...pendingCount > 0 ? ["guestbook"] : []]}>
            {/* Share & QR */}
            <AccordionItem value="share">
              <AccordionTrigger className="font-serif text-lg">
                <AccordionSectionLabel title="Share & QR Code" icon={Share2} />
              </AccordionTrigger>
              <AccordionContent>
                <Card className="border-border/50">
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <FieldLabel icon={Link2} className="text-xs text-muted-foreground font-normal">
                        Public URL
                      </FieldLabel>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="flex-1 text-sm bg-muted px-3 py-2 rounded-lg truncate">
                          /memorial/{memorial?.slug}
                        </code>
                        <Button variant="outline" size="sm" onClick={handleCopyLink}>
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleOpenQR} className="flex-1">
                        QR Code
                      </Button>
                      <Button variant="outline" onClick={handleOpenQR} className="flex-1 gap-1.5">
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            {/* Details */}
            <AccordionItem value="details">
              <AccordionTrigger className="font-serif text-lg">
                <AccordionSectionLabel title="Details" icon={PenLine} />
              </AccordionTrigger>
              <AccordionContent>
                <form onSubmit={handleSaveDetails} className="space-y-4">
                  {/* Cover */}
                  <Card className="border-border/50 overflow-hidden gradient-border py-0 gap-0">
                    <CardContent className="p-0 relative z-10">
                      {coverPreview ? (
                        <div className="p-4 sm:p-5 space-y-4">
                          <CoverHeroPreview
                            coverUrl={coverPreview}
                            name={form.name}
                            dob={form.dob || null}
                            dod={form.dod || null}
                            tagline={form.tagline || null}
                          />
                          <div className="flex items-center justify-center gap-2 border-t border-border/30 pt-4">
                            <label>
                              <Button type="button" variant="outline" size="sm" className="cursor-pointer" asChild>
                                <span>
                                  <Upload className="w-3.5 h-3.5 mr-1.5" />
                                  Change photo
                                </span>
                              </Button>
                              <input type="file" accept="image/*" onChange={(e) => {
                                const f = e.target.files?.[0]
                                if (f) {
                                  setCoverFile(f)
                                  const r = new FileReader()
                                  r.onload = () => setCoverPreview(r.result as string)
                                  r.readAsDataURL(f)
                                }
                              }} className="hidden" />
                            </label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => { setCoverPreview(null); setCoverFile(null); setForm({ ...form, coverPhotoUrl: "" }) }}
                            >
                              <X className="w-3.5 h-3.5 mr-1.5" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50">
                          <ImageIcon className="w-8 h-8 text-muted-foreground/40 mb-2" />
                          <span className="text-xs text-muted-foreground">Upload cover photo</span>
                          <input type="file" accept="image/*" onChange={(e) => {
                            const f = e.target.files?.[0]
                            if (f) {
                              setCoverFile(f)
                              const r = new FileReader()
                              r.onload = () => setCoverPreview(r.result as string)
                              r.readAsDataURL(f)
                            }
                          }} className="hidden" />
                        </label>
                      )}
                    </CardContent>
                  </Card>

                  <div className="space-y-2">
                    <FieldLabel icon={PenLine} size="md">Full Name</FieldLabel>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="h-11" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <FieldLabel icon={Calendar}>Date of Birth</FieldLabel>
                      <Input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <FieldLabel icon={Calendar}>Date of Passing</FieldLabel>
                      <Input type="date" value={form.dod} onChange={(e) => setForm({ ...form, dod: e.target.value })} className="h-11" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <FieldLabel icon={Quote}>Tagline</FieldLabel>
                    <Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <FieldLabel icon={MapPin}>Resting Place</FieldLabel>
                    <Input value={form.restingPlace} onChange={(e) => setForm({ ...form, restingPlace: e.target.value })} className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <FieldLabel icon={BookOpen}>Life Story</FieldLabel>
                    <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={5} className="resize-y" />
                  </div>
                  <Button type="submit" disabled={saving} className="bg-primary text-primary-foreground hover:opacity-90 rounded-lg">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : saved ? <Check className="w-4 h-4 mr-2" /> : null}
                    {saving ? "Saving..." : saved ? "Saved ✓" : "Save Changes"}
                  </Button>
                </form>
              </AccordionContent>
            </AccordionItem>

            {/* Timeline */}
            <AccordionItem value="timeline">
              <AccordionTrigger className="font-serif text-lg">
                <AccordionSectionLabel
                  title="Life Timeline"
                  icon={Clock}
                  meta={
                    timelineEvents.length > 0
                      ? `${timelineEvents.length} ${timelineEvents.length === 1 ? "event" : "events"}`
                      : undefined
                  }
                />
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <Card className="border-border/50">
                    <CardContent className="p-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-[9.75rem_1fr] gap-3">
                        <div className="space-y-1 min-w-0">
                          <FieldLabel icon={Calendar} className="text-xs font-normal">Date (optional)</FieldLabel>
                          <Input type="date" value={newEvent.eventDate} onChange={(e) => setNewEvent({ ...newEvent, eventDate: e.target.value })} className="h-10 text-sm" />
                        </div>
                        <div className="space-y-1">
                          <FieldLabel icon={Type} className="text-xs font-normal">Title *</FieldLabel>
                          <Input value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} placeholder="Event title" className="h-10 text-sm" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <FieldLabel icon={AlignLeft} className="text-xs font-normal">Description</FieldLabel>
                        <Textarea value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} rows={2} className="text-sm" />
                      </div>
                      <Button size="sm" onClick={handleAddTimelineEvent} disabled={addingTimeline || !newEvent.title.trim()} className="bg-primary text-primary-foreground">
                        {addingTimeline ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Plus className="w-3.5 h-3.5 mr-1.5" />}
                        Add Event
                      </Button>
                    </CardContent>
                  </Card>

                  {timelineEvents.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No timeline events yet.</p>
                  )}

                  <div className="space-y-2">
                    {timelineEvents.map((event) => (
                      <div key={event.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                        <div className="flex-1 min-w-0">
                          {event.eventDate && (
                            <p className="text-xs text-muted-foreground">{formatDate(event.eventDate)}</p>
                          )}
                          <p className="font-medium text-sm">{event.title}</p>
                          {event.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
                          )}
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteTimelineEvent(event.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Photos */}
            <AccordionItem value="photos">
              <AccordionTrigger className="font-serif text-lg">
                <AccordionSectionLabel
                  title="Photo Gallery"
                  icon={ImageIcon}
                  meta={
                    photos.length > 0
                      ? `${photos.length} ${photos.length === 1 ? "photo" : "photos"}`
                      : undefined
                  }
                />
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors">
                    {uploadingPhoto ? (
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-muted-foreground/60 mb-2" />
                        <span className="text-sm text-muted-foreground">Upload photos</span>
                        <span className="text-xs text-muted-foreground/60">Supports multiple files</span>
                      </>
                    )}
                    <input type="file" accept="image/*" multiple onChange={handleUploadPhotos} className="hidden" disabled={uploadingPhoto} />
                  </label>

                  {photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {photos.map((photo, i) => (
                        <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden bg-muted">
                          <img src={photo.url} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                            <Button variant="secondary" size="icon" className="h-7 w-7" disabled={i === 0} onClick={() => handleReorderPhotos(photo.id, "up")}>
                              <ChevronUp className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="secondary" size="icon" className="h-7 w-7" disabled={i === photos.length - 1} onClick={() => handleReorderPhotos(photo.id, "down")}>
                              <ChevronDown className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => handleDeletePhoto(photo.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Song */}
            <AccordionItem value="song">
              <AccordionTrigger className="font-serif text-lg">
                <AccordionSectionLabel
                  title="Favourite Song"
                  icon={Music}
                  meta={
                    memorial?.songEmbedUrl || memorial?.songUrl
                      ? "Added"
                      : undefined
                  }
                />
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {memorial?.songEmbedUrl || memorial?.songUrl ? (
                    <div className="space-y-3">
                      {memorial.songEmbedUrl ? (
                        <SongEmbed embedUrl={memorial.songEmbedUrl} />
                      ) : (
                        <SongAudioPlayer
                          url={memorial.songUrl!}
                          title={memorial.songTitle}
                          artist={memorial.songArtist}
                        />
                      )}
                      <Button variant="outline" size="sm" onClick={handleRemoveSong} className="text-destructive">
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                        Remove Song
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-2 mb-3">
                        <Button variant={songMode === "embed" ? "default" : "outline"} size="sm" onClick={() => setSongMode("embed")}>
                          <Music className="w-3.5 h-3.5 mr-1.5" />
                          Link
                        </Button>
                        <Button variant={songMode === "upload" ? "default" : "outline"} size="sm" onClick={() => setSongMode("upload")}>
                          <Upload className="w-3.5 h-3.5 mr-1.5" />
                          Upload
                        </Button>
                      </div>

                      {songMode === "embed" ? (
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <FieldLabel icon={Music} className="text-xs font-normal">Spotify or Apple Music Link</FieldLabel>
                            <Input value={songLink} onChange={(e) => setSongLink(e.target.value)} placeholder="https://open.spotify.com/track/..." className="h-10 text-sm" />
                          </div>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center h-20 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50">
                          <div className="text-center">
                            <Upload className="w-5 h-5 text-muted-foreground/60 mx-auto mb-1" />
                            <span className="text-xs text-muted-foreground">Upload audio file</span>
                          </div>
                          <input type="file" accept="audio/*" onChange={(e) => setSongFile(e.target.files?.[0] || null)} className="hidden" />
                        </label>
                      )}

                      {songMode === "upload" && (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <FieldLabel icon={Type} className="text-xs font-normal">Title</FieldLabel>
                            <Input value={songTitle} onChange={(e) => setSongTitle(e.target.value)} placeholder="Song title" className="h-10 text-sm" />
                          </div>
                          <div className="space-y-1">
                            <FieldLabel icon={User} className="text-xs font-normal">Artist</FieldLabel>
                            <Input value={songArtist} onChange={(e) => setSongArtist(e.target.value)} placeholder="Artist name" className="h-10 text-sm" />
                          </div>
                        </div>
                      )}

                      <Button size="sm" onClick={handleSaveSong} disabled={savingSong} className="bg-primary text-primary-foreground">
                        {savingSong ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                        Save Song
                      </Button>
                    </>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Videos */}
            <AccordionItem value="videos">
              <AccordionTrigger className="font-serif text-lg">
                <AccordionSectionLabel
                  title="Video Tributes"
                  icon={Video}
                  meta={
                    videos.length > 0
                      ? `${videos.length} ${videos.length === 1 ? "video" : "videos"}`
                      : undefined
                  }
                />
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <Card className="border-border/50">
                    <CardContent className="p-4 space-y-3">
                      <div className="space-y-1">
                        <FieldLabel icon={Video} className="text-xs font-normal">YouTube or Vimeo URL</FieldLabel>
                        <Input value={newVideoUrl} onChange={(e) => setNewVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." className="h-10 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <FieldLabel icon={Type} className="text-xs font-normal">Title (optional)</FieldLabel>
                        <Input value={newVideoTitle} onChange={(e) => setNewVideoTitle(e.target.value)} placeholder="Video title" className="h-10 text-sm" />
                      </div>
                      <Button size="sm" onClick={handleAddVideo} disabled={addingVideo || !newVideoUrl.trim()} className="bg-primary text-primary-foreground">
                        {addingVideo ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Plus className="w-3.5 h-3.5 mr-1.5" />}
                        Add Video
                      </Button>
                    </CardContent>
                  </Card>

                  {videos.map((video) => (
                    <div key={video.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="aspect-video rounded-lg overflow-hidden bg-muted mb-2">
                          <iframe src={video.embedUrl} className="w-full h-full" allowFullScreen />
                        </div>
                        {video.title && <p className="text-sm font-medium">{video.title}</p>}
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteVideo(video.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}

                  {videos.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No videos yet.</p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Guestbook Moderation */}
            <AccordionItem value="guestbook">
              <AccordionTrigger className="font-serif text-lg">
                <AccordionSectionLabel
                  title="Guestbook"
                  icon={MessageSquare}
                  meta={pendingCount > 0 ? `${pendingCount} pending` : undefined}
                  metaClassName="text-destructive/70"
                />
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6">
                  {/* Pending */}
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-500" />
                      Awaiting Approval ({pendingCount})
                    </h4>
                    {loadingGuestbook ? (
                      <Skeleton className="h-16 rounded-lg" />
                    ) : pendingCount === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">No pending messages.</p>
                    ) : (
                      <div className="space-y-2">
                        {guestbookEntries.filter((e) => !e.approved).map((entry) => (
                          <div key={entry.id} className="p-3 bg-muted/30 rounded-lg">
                            <p className="text-sm font-medium">{entry.visitorName}</p>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{entry.message}</p>
                            <div className="flex gap-2 mt-2">
                              <Button size="sm" variant="outline" onClick={() => handleApproveEntry(entry.id)} className="text-accent hover:text-accent">
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                Approve
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDeleteEntry(entry.id)} className="text-destructive">
                                <Trash2 className="w-3.5 h-3.5 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Published */}
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-accent" />
                      Published ({publishedCount})
                    </h4>
                    {publishedCount === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">No published messages yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {guestbookEntries.filter((e) => e.approved).map((entry) => (
                          <div key={entry.id} className="p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-sm font-medium">{entry.visitorName}</p>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{entry.message}</p>
                              </div>
                              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteEntry(entry.id)}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Danger Zone */}
            <AccordionItem value="danger">
              <AccordionTrigger className="font-serif text-lg text-destructive">
                <span className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" />
                  <span data-accordion-title>Danger Zone</span>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <Card className="border-destructive/30 bg-destructive/5">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      Permanently delete this memorial and all associated data. This action cannot be undone.
                    </p>
                    <Button variant="destructive" size="sm" onClick={() => setDeleteDialogOpen(true)}>
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                      Delete Memorial
                    </Button>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </motion.div>
      </main>

      {/* QR Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">QR Code</DialogTitle>
          </DialogHeader>
          {qrDataUrl && (
            <div className="flex flex-col items-center gap-4">
              <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 rounded-lg" />
              <Button variant="outline" size="sm" onClick={handleDownloadQR} className="gap-1.5">
                <Download className="w-3.5 h-3.5" />
                Download PNG
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{memorial?.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this memorial, all photos, videos, timeline events, guestbook entries, and tributes. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMemorial} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
