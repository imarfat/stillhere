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
  Plus, LogOut, MessageSquare, Image as ImageIcon, Calendar, Flame,
  ArrowRight, Search, Eye, Sparkles, Settings, SortDesc,
} from "lucide-react"

const sortOptions = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name", label: "By name" },
  { value: "tributes", label: "Most tributes" },
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

  const totalTributes = memorials.reduce((sum, m) => sum + m._count.tributes, 0)
  const totalPhotos = memorials.reduce((sum, m) => sum + m._count.photos, 0)

  if (loading) {
    return (
      <div className="min-h-screen px-6 py-8">
        <div className="max-w-5xl mx-auto">
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
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
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

      <main className="flex-1 px-6 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Stats bar */}
          {memorials.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 sm:gap-6 mb-8 p-4 bg-card/60 rounded-xl border border-border/30"
            >
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="font-medium">{memorials.length}</span>
                <span className="text-muted-foreground hidden sm:inline">memorials</span>
              </div>
              <div className="h-4 w-px bg-border/50" />
              <div className="flex items-center gap-2 text-sm">
                <ImageIcon className="w-4 h-4 text-primary/70" />
                <span className="font-medium">{totalPhotos}</span>
                <span className="text-muted-foreground hidden sm:inline">photos</span>
              </div>
              <div className="h-4 w-px bg-border/50" />
              <div className="flex items-center gap-2 text-sm">
                <Flame className="w-4 h-4 text-candle/70" />
                <span className="font-medium">{totalTributes}</span>
                <span className="text-muted-foreground hidden sm:inline">tributes</span>
              </div>
            </motion.div>
          )}

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
              <Sparkles className="w-4 h-4 mr-1.5" />
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
                className="hidden sm:inline-flex bg-primary text-primary-foreground hover:opacity-90 rounded-full px-8 h-11 btn-glow"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Create your first memorial
              </Button>
            </motion.div>
          ) : (
            <>
              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                        className="border-border/40 hover:border-primary/25 cursor-pointer transition-all duration-400 overflow-hidden group card-hover bg-card py-0 gap-0"
                        onClick={() => navigate({ page: "edit-memorial", memorialId: memorial.id })}
                      >
                        {/* Cover */}
                        <div className="relative h-36 sm:h-40 bg-muted overflow-hidden">
                          {memorial.coverPhotoUrl ? (
                            <img
                              src={memorial.coverPhotoUrl}
                              alt={memorial.name}
                              className="w-full h-full object-cover origin-bottom group-hover:scale-105 transition-transform duration-700"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/[0.04] via-transparent to-accent/[0.03]">
                              <span className="font-serif text-4xl text-primary/20 font-bold">
                                {memorial.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="absolute inset-0 -bottom-px bg-gradient-to-t from-card via-card/20 to-transparent" />

                          {/* View public page button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate({ page: "memorial", slug: memorial.slug })
                            }}
                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-background/90"
                            aria-label="View public page"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <CardContent className="relative z-10 -mt-px bg-card p-4">
                          <h3 className="font-serif text-lg font-semibold mb-1 truncate group-hover:text-primary transition-colors">
                            {memorial.name}
                          </h3>
                          {getDateRange(memorial.dob, memorial.dod) && (
                            <p className="text-xs text-muted-foreground/70 mb-1.5 font-medium">
                              {getDateRange(memorial.dob, memorial.dod)}
                            </p>
                          )}
                          {memorial.tagline && (
                            <p className="text-sm text-muted-foreground/60 mb-3 line-clamp-2 leading-relaxed">
                              {memorial.tagline}
                            </p>
                          )}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {memorial._count.photos > 0 && (
                              <Badge variant="secondary" className="text-[11px] gap-1 bg-muted/60">
                                <ImageIcon className="w-2.5 h-2.5" />
                                {memorial._count.photos}
                              </Badge>
                            )}
                            {memorial._count.tributes > 0 && (
                              <Badge variant="secondary" className="text-[11px] gap-1 bg-muted/60">
                                <Flame className="w-2.5 h-2.5 text-candle" />
                                {memorial._count.tributes}
                              </Badge>
                            )}
                            {memorial._count.guestbookEntries > 0 && (
                              <Badge variant="secondary" className="text-[11px] gap-1 bg-muted/60">
                                <MessageSquare className="w-2.5 h-2.5" />
                                {memorial._count.guestbookEntries}
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center text-primary text-xs mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium">
                            Manage <ArrowRight className="w-3 h-3 ml-1" />
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
            </>
          )}
        </div>
      </main>

      {/* Mobile FAB */}
      <div className="fixed bottom-6 right-6 sm:hidden z-40">
        <Button
          onClick={() => navigate({ page: "create-memorial" })}
          size="lg"
          className="rounded-full w-14 h-14 bg-primary text-primary-foreground shadow-xl shadow-primary/30 animate-glow-pulse"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </div>
  )
}