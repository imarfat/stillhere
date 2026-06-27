"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useSession, signOut } from "next-auth/react"
import { useNavigation } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import {
  BookHeart, LogOut, MessageSquare, Image as ImageIcon, Calendar, Flame,
  ArrowRight, Search, Eye, Sparkles, Settings, SortDesc,
} from "lucide-react"
import { AuthFloatingDots } from "@/components/app/AuthFloatingDots"

const dashboardContainerClass = "max-w-5xl 2xl:max-w-6xl mx-auto w-full px-6"

const sortOptions = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name", label: "By name" },
  { value: "tributes", label: "Most tributes" },
] as const

const dashboardAccentLines = [
  "Keeping their memory alive",
  "A place for love and remembrance",
  "Held close, always",
  "Honouring those we love",
  "Memories worth sharing",
  "Love that endures",
] as const

import {
  getDashboardMemorials,
  setDashboardMemorials,
  invalidateDashboardMemorials,
  type DashboardMemorial,
} from "@/lib/dashboard-cache"
import { invalidateSettingsStats } from "@/lib/settings-cache"

export function DashboardPage() {
  const { data: session } = useSession()
  const { navigate } = useNavigation()
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name" | "tributes">("newest")

  const [memorials, setMemorials] = useState<DashboardMemorial[]>(() => getDashboardMemorials() ?? [])
  const [loading, setLoading] = useState(() => getDashboardMemorials() === null)

  const fetchMemorials = useCallback(async () => {
    const hasCache = getDashboardMemorials() !== null
    if (!hasCache) setLoading(true)
    try {
      const res = await fetch("/api/memorials")
      if (res.ok) {
        const data: DashboardMemorial[] = await res.json()
        setMemorials(data)
        setDashboardMemorials(data)
      }
    } catch {
      if (!hasCache) toast.error("Failed to load memorials")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchMemorials() }, [fetchMemorials])

  const filteredMemorials = useMemo(() => {
    let result = memorials
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.tagline && m.tagline.toLowerCase().includes(q)) ||
          m.slug.toLowerCase().includes(q)
      )
    }
    switch (sortBy) {
      case "newest":
        return [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      case "oldest":
        return [...result].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      case "name":
        return [...result].sort((a, b) => a.name.localeCompare(b.name))
      case "tributes":
        return [...result].sort((a, b) => b._count.tributes - a._count.tributes)
      default:
        return result
    }
  }, [memorials, searchQuery, sortBy])

  const handleSignOut = async () => {
    invalidateDashboardMemorials()
    invalidateSettingsStats()
    await signOut({ redirect: false })
    navigate({ page: "landing" })
  }

  const getDateRange = (dob: string | null, dod: string | null) => {
    if (dob && dod) {
      return `${new Date(dob).getFullYear()} — ${new Date(dod).getFullYear()}`
    }
    if (dod) return new Date(dod).getFullYear().toString()
    return ""
  }

  const renderMemorialStats = (memorial: DashboardMemorial) => {
    const items = [
      { key: "photos", icon: ImageIcon, count: memorial._count.photos, iconClass: "" },
      { key: "tributes", icon: Flame, count: memorial._count.tributes, iconClass: "text-candle" },
      { key: "messages", icon: MessageSquare, count: memorial._count.guestbookEntries, iconClass: "" },
    ]

    return (
      <div className="flex items-center gap-1 flex-wrap">
        {items.map(({ key, icon: Icon, count, iconClass }) => (
          <Badge
            key={key}
            variant="secondary"
            className="text-[11px] gap-1 bg-muted/60"
          >
            <Icon className={`w-2.5 h-2.5 ${iconClass}`} />
            {count}
          </Badge>
        ))}
      </div>
    )
  }

  const dashboardAccentLine = useMemo(() => {
    const index = new Date().getDate() % dashboardAccentLines.length
    return dashboardAccentLines[index]
  }, [])

  const memorialGridClass =
    "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4"

  const memorialCoverClass = useMemo(() => {
    const count = filteredMemorials.length
    if (count === 1) return "h-44 sm:h-48 2xl:h-56"
    if (count === 2) return "h-40 sm:h-44 2xl:h-48"
    return "h-40"
  }, [filteredMemorials.length])

  if (loading) {
    return (
      <div className="min-h-screen py-8 2xl:bg-muted/20">
        <div className={dashboardContainerClass}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <Skeleton className="h-8 w-40 mb-2" />
              <Skeleton className="h-4 w-56" />
            </div>
            <Skeleton className="h-10 w-24 rounded-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden 2xl:bg-muted/20">
      <div className="pointer-events-none absolute inset-0 hidden 2xl:block" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-primary/[0.03]" />
        <div className="absolute inset-0 bg-grain opacity-[0.18]" />
        <AuthFloatingDots />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 relative bg-card/92 backdrop-blur-xl border-b border-border dark:bg-background/80 dark:border-border/40">
        <div className={`${dashboardContainerClass} py-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <button
              onClick={() => navigate({ page: "landing" })}
              className="font-serif text-xl font-bold text-gradient-warm shrink-0"
            >
              StillHere
            </button>
            <div className="hidden sm:block h-4 w-px bg-border/60" />
            <span className="hidden sm:block text-sm text-muted-foreground truncate">
              {session?.user?.email}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="plain"
              size="icon"
              onClick={() => navigate({ page: "settings" })}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="plain"
              size="sm"
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 py-8 flex flex-col min-h-[calc(100dvh-4.5rem)]">
        <div className={`${dashboardContainerClass} flex-1 flex flex-col min-h-full`}>
          {/* Title + Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold">Your Memorials</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Manage and share your memorial pages
              </p>
            </div>
            <Button
              onClick={() => navigate({ page: "create-memorial" })}
              className="hidden sm:inline-flex bg-primary text-primary-foreground hover:opacity-90 rounded-full px-5 h-10 shadow-md shadow-primary/15 btn-glow self-start sm:self-auto"
            >
              <BookHeart className="w-4 h-4 mr-1.5" />
              New Memorial
            </Button>
          </div>

          {/* Search + Sort */}
          {memorials.length > 0 && (
            <div className="flex items-center gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search memorials..."
                  className="pl-10 h-10 rounded-xl bg-muted/40 border-border/30 focus:border-primary/30 input-glow"
                />
              </div>
              <div className="relative">
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                  <SelectTrigger
                    aria-label="Sort memorials"
                    className="h-10 min-h-10 data-[size=default]:h-10 py-0 min-w-[8.5rem] rounded-xl bg-muted/40 border border-border/30 px-3 pr-8 text-sm shadow-none hover:border-primary/30 transition-colors focus-visible:border-primary/30 focus-visible:ring-2 focus-visible:ring-primary/15 focus-visible:ring-offset-0 [&>svg]:hidden"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    align="end"
                    className="rounded-xl border-border/40 bg-popover p-1.5 shadow-elevated min-w-[var(--radix-select-trigger-width)]"
                  >
                    {sortOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="rounded-lg cursor-pointer py-2 pl-2.5 focus:bg-muted/80 focus:text-foreground data-[state=checked]:font-medium [&_svg]:text-primary"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <SortDesc className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Empty state */}
          {memorials.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/[0.06] border border-primary/10 mb-6 glow-warm">
                <Calendar className="w-8 h-8 text-primary/60" />
              </div>
              <h3 className="font-serif text-2xl font-semibold mb-2">No memorials yet</h3>
              <p className="text-muted-foreground text-sm mb-8 max-w-sm mx-auto leading-relaxed">
                Create your first memorial page to honor and remember someone you love.
              </p>
              <Button
                onClick={() => navigate({ page: "create-memorial" })}
                className="inline-flex bg-primary text-primary-foreground hover:opacity-90 rounded-full px-8 h-11 btn-glow"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Create your first memorial
              </Button>
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col">
              {/* Grid */}
              <div className={memorialGridClass}>
                <AnimatePresence mode="popLayout">
                  {filteredMemorials.map((memorial, i) => (
                    <motion.div
                      key={memorial.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                      layout
                    >
                      <Card
                        className="memorial-card border-border/40 cursor-pointer overflow-hidden group bg-card py-0 gap-0 shadow-soft flex flex-col"
                        onClick={() => navigate({ page: "edit-memorial", memorialId: memorial.id })}
                      >
                        {/* Cover — full frame, no overlays eating the photo */}
                        <div className={`relative shrink-0 bg-muted overflow-hidden ${memorialCoverClass}`}>
                          {memorial.coverPhotoUrl ? (
                            <img
                              src={memorial.coverPhotoUrl}
                              alt={memorial.name}
                              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/[0.04] via-transparent to-accent/[0.03]">
                              <span className="font-serif text-4xl text-primary/20 font-bold">
                                {memorial.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate({ page: "memorial", slug: memorial.slug })
                            }}
                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/75 backdrop-blur-sm flex items-center justify-center opacity-90 hover:opacity-100 hover:bg-background/90 transition-all"
                            aria-label="View public page"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <CardContent className="relative bg-card px-3.5 py-2.5 shrink-0">
                          <h3 className="font-serif text-lg font-semibold leading-tight truncate group-hover:text-primary transition-colors">
                            {memorial.name}
                          </h3>
                          {getDateRange(memorial.dob, memorial.dod) && (
                            <p className="text-xs text-muted-foreground/70 mt-0.5 font-medium">
                              {getDateRange(memorial.dob, memorial.dod)}
                            </p>
                          )}
                          <div className="mt-1.5">{renderMemorialStats(memorial)}</div>
                          {memorial.tagline && (
                            <p className="text-sm text-muted-foreground/60 mt-1.5 line-clamp-1 leading-snug">
                              {memorial.tagline}
                            </p>
                          )}

                          <div className="flex items-center justify-between gap-3 mt-2 pt-2 border-t border-border/35">
                            <span className="text-xs text-muted-foreground">Manage memorial</span>
                            <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* No search results */}
              {filteredMemorials.length === 0 && searchQuery && (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  No memorials match &ldquo;{searchQuery}&rdquo;
                </div>
              )}

              <motion.footer
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mt-auto w-full pt-10 sm:pt-12"
              >
                <div className="flex w-full items-center gap-3">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/20" />
                  <Sparkles className="w-3 h-3 shrink-0 text-primary/45 animate-pulse-soft" />
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/20" />
                </div>
                <p className="font-serif text-sm italic text-muted-foreground/80 text-center px-2 mt-4">
                  {dashboardAccentLine}
                </p>
                <div className="sm:hidden mt-5 pt-5 pb-2 border-t border-border/30">
                  <Button
                    onClick={() => navigate({ page: "create-memorial" })}
                    className="w-full rounded-xl h-11 bg-primary text-primary-foreground hover:opacity-90 shadow-md shadow-primary/20 btn-glow"
                  >
                    <BookHeart className="w-4 h-4 mr-2" />
                    New Memorial
                  </Button>
                </div>
              </motion.footer>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}