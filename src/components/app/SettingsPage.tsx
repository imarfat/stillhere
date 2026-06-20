"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useNavigation } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { invalidateDashboardMemorials } from "@/lib/dashboard-cache"
import {
  emptyAccountStats,
  getSettingsStats,
  invalidateSettingsStats,
  setSettingsStats,
  type AccountStats,
} from "@/lib/settings-cache"
import { toast } from "sonner"
import { motion } from "framer-motion"
import {
  ArrowLeft, User, Mail, Lock, Loader2, Save, LogOut,
  Shield, Calendar, Flame, Image as ImageIcon, MessageSquare,
  Heart, ChevronRight, Trash2, Eye, EyeOff,
} from "lucide-react"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function SettingsPage() {
  const { data: session } = useSession()
  const { navigate, back } = useNavigation()
  const [loading, setLoading] = useState(false)
  const [statsLoading, setStatsLoading] = useState(() => getSettingsStats() === null)
  const [stats, setStats] = useState<AccountStats>(() => getSettingsStats() ?? emptyAccountStats)

  // Profile form
  const [name, setName] = useState("")
  const [nameLoading, setNameLoading] = useState(false)

  // Password form
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  useEffect(() => {
    if (session?.user?.name) setName(session.user.name)
  }, [session])

  useEffect(() => {
    const fetchStats = async () => {
      const hasCache = getSettingsStats() !== null
      if (!hasCache) setStatsLoading(true)
      try {
        const res = await fetch("/api/user/stats")
        if (res.ok) {
          const data: AccountStats = await res.json()
          setStats(data)
          setSettingsStats(data)
        }
      } catch { /* ignore */ }
      finally { setStatsLoading(false) }
    }
    fetchStats()
  }, [])

  const handleSaveName = async () => {
    setNameLoading(true)
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Failed to update name")
        return
      }
      toast.success("Name updated successfully")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setNameLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters")
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    setPasswordLoading(true)
    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Failed to change password")
        return
      }
      toast.success("Password changed successfully")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleSignOut = async () => {
    invalidateDashboardMemorials()
    invalidateSettingsStats()
    await signOut({ redirect: false })
    navigate({ page: "landing" })
  }

  const handleDeleteAccount = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/user/account", { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Failed to delete account")
        return
      }
      toast.success("Account deleted")
      invalidateDashboardMemorials()
      invalidateSettingsStats()
      await signOut({ redirect: false })
      navigate({ page: "landing" })
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrength = (pw: string) => {
    let score = 0
    if (pw.length >= 8) score++
    if (pw.length >= 12) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    return score
  }

  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong", "Excellent"]
  const strengthColors = ["", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-emerald-500"]

  const pwStrength = newPassword ? getPasswordStrength(newPassword) : 0

  if (statsLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/40">
          <div className="px-6 py-4">
            <div className="max-w-2xl mx-auto flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <Skeleton className="h-6 w-40" />
            </div>
          </div>
        </header>
        <main className="flex-1 px-6 py-8">
          <div className="max-w-2xl mx-auto space-y-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="px-6 py-4">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <Button variant="plain" size="icon" onClick={back} className="shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-serif text-xl font-semibold">Settings</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="max-w-2xl mx-auto space-y-6"
        >
          {/* Account Overview Card */}
          <Card className="border-border/50 overflow-hidden py-0 gap-0">
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/5 p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center text-primary font-serif text-2xl font-bold border-2 border-primary/20">
                  {session?.user?.name?.charAt(0)?.toUpperCase() || session?.user?.email?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-serif text-xl font-semibold truncate">
                    {session?.user?.name || "Unnamed User"}
                  </h2>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5 min-w-0">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{session?.user?.email}</span>
                  </p>
                </div>
                <Button
                  variant="plain"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-muted-foreground hover:text-foreground shrink-0"
                >
                  <LogOut className="w-4 h-4 mr-1.5" />
                  <span className="hidden sm:inline">Sign out</span>
                </Button>
              </div>
            </div>
          </Card>

          {/* Stats */}
          <Card className="border-border/30 py-0 gap-0 overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-6 divide-x divide-border/40">
                {[
                  { icon: Calendar, label: "Memorials", value: stats.memorials, color: "text-primary" },
                  { icon: ImageIcon, label: "Photos", value: stats.photos, color: "text-warm" },
                  { icon: Flame, label: "Tributes", value: stats.tributes, color: "text-candle" },
                  { icon: MessageSquare, label: "Messages", value: stats.guestbookEntries, color: "text-accent" },
                  { icon: Heart, label: "Videos", value: stats.videos, color: "text-flower" },
                  { icon: Shield, label: "Timeline", value: stats.timelineEvents, color: "text-amber-light" },
                ].map((stat) => (
                  <div key={stat.label} className="px-1 py-2.5 text-center min-w-0">
                    <stat.icon className={`w-3.5 h-3.5 mx-auto mb-1 ${stat.color} opacity-70`} />
                    <p className="text-sm font-semibold leading-none">{stat.value}</p>
                    <p className="text-[9px] text-muted-foreground mt-1 leading-tight truncate px-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Edit Profile */}
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="font-serif text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Profile
              </CardTitle>
              <CardDescription>Update your display name</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="settings-name">Display Name</Label>
                <Input
                  id="settings-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="h-11"
                />
              </div>
              <Button
                onClick={handleSaveName}
                disabled={nameLoading || name === (session?.user?.name || "")}
                className="bg-primary text-primary-foreground hover:opacity-90 rounded-lg h-10"
              >
                {nameLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Name
              </Button>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="font-serif text-lg flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                Change Password
              </CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-pw">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current-pw"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Separator className="my-2" />
              <div className="space-y-2">
                <Label htmlFor="new-pw">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-pw"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {newPassword && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-1.5"
                  >
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            i <= pwStrength ? strengthColors[pwStrength] : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Password strength: <span className="font-medium">{strengthLabels[pwStrength]}</span>
                    </p>
                  </motion.div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-pw">Confirm New Password</Label>
                <Input
                  id="confirm-pw"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="h-11"
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-destructive">Passwords do not match</p>
                )}
              </div>
              <Button
                onClick={handleChangePassword}
                disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
                className="bg-primary text-primary-foreground hover:opacity-90 rounded-lg h-10"
              >
                {passwordLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Lock className="w-4 h-4 mr-2" />}
                Change Password
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/30 bg-destructive/[0.02]">
            <CardHeader className="pb-4">
              <CardTitle className="font-serif text-lg flex items-center gap-2 text-destructive">
                <Trash2 className="w-5 h-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>Permanently delete your account and all associated memorials</CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={loading} className="rounded-lg">
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account and
                      remove all your memorial pages, photos, videos, guestbook entries, and tributes.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-white hover:bg-destructive/90"
                    >
                      Delete everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>

          {/* Back to dashboard */}
          <div className="pt-4 text-center">
            <Button
              variant="plain"
              onClick={() => navigate({ page: "dashboard" })}
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="w-4 h-4 mr-1 rotate-180" />
              Back to Dashboard
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  )
}