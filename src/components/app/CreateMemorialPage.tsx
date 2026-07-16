"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useNavigation } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { ArrowLeft, Loader2, Upload, X, Image as ImageIcon, Sparkles, Calendar, MapPin, PenLine } from "lucide-react"
import { CoverHeroPreview } from "@/components/app/CoverHeroPreview"
import { invalidateDashboardMemorials } from "@/lib/dashboard-cache"
import { invalidateSettingsStats } from "@/lib/settings-cache"

export function CreateMemorialPage() {
  const { data: session } = useSession()
  const { navigate, back } = useNavigation()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: "",
    dob: "",
    dod: "",
    tagline: "",
    restingPlace: "",
    bio: "",
  })
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB")
      return
    }

    setCoverFile(file)
    const reader = new FileReader()
    reader.onload = () => setCoverPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleRemoveCover = () => {
    setCoverFile(null)
    setCoverPreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error("Please enter a name")
      return
    }

    setLoading(true)
    try {
      let coverPhotoUrl: string | undefined

      if (coverFile && session?.user?.id) {
        const formData = new FormData()
        formData.append("file", coverFile)
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json()
          coverPhotoUrl = uploadData.url
        } else {
          const uploadData = await uploadRes.json().catch(() => ({}))
          toast.error(uploadData.error || "Cover photo upload failed")
          return
        }
      }

      const res = await fetch("/api/memorials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          dob: form.dob || undefined,
          dod: form.dod || undefined,
          tagline: form.tagline || undefined,
          restingPlace: form.restingPlace || undefined,
          bio: form.bio || undefined,
          coverPhotoUrl: coverPhotoUrl || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Failed to create memorial")
        return
      }

      const memorial = await res.json()
      invalidateDashboardMemorials()
      invalidateSettingsStats()
      toast.success("Memorial created!")
      navigate({ page: "edit-memorial", memorialId: memorial.id })
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
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
            <div>
              <h1 className="font-serif text-xl font-semibold">Create a New Memorial</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Add the basics - you can always add more later</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-8">
            <span className="block h-px flex-1 bg-gradient-to-r from-transparent to-primary/30" />
            <span className="text-xs text-muted-foreground tracking-wide">Basic details</span>
            <span className="block h-px flex-1 bg-gradient-to-l from-transparent to-primary/30" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Cover Photo Upload */}
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
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverChange}
                          className="hidden"
                        />
                      </label>
                      <Button type="button" variant="outline" size="sm" onClick={handleRemoveCover}>
                        <X className="w-3.5 h-3.5 mr-1.5" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-48 sm:h-64 border-2 border-dashed border-border/60 rounded-xl cursor-pointer hover:border-primary/40 hover:bg-primary/[0.02] transition-all duration-300 group">
                    <div className="w-14 h-14 rounded-2xl bg-primary/[0.06] border border-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                      <Upload className="w-6 h-6 text-primary/50 group-hover:text-primary/80 transition-colors" />
                    </div>
                    <span className="text-sm text-muted-foreground font-medium">Add cover photo</span>
                    <span className="text-xs text-muted-foreground/60 mt-1">Optional: click or drag</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverChange}
                      className="hidden"
                    />
                  </label>
                )}
              </CardContent>
            </Card>

            {/* Name */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-2"
            >
              <Label htmlFor="name" className="text-base font-medium flex items-center gap-2">
                <PenLine className="w-4 h-4 text-primary/60" />
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Their full name"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                required
                disabled={loading}
                className="h-12 text-lg bg-card/60 border-border/50 focus:border-primary/50 input-glow transition-all"
              />
            </motion.div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="space-y-2"
              >
                <Label htmlFor="dob" className="text-sm font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary/50" />
                  Date of Birth
                </Label>
                <Input
                  id="dob"
                  type="date"
                  value={form.dob}
                  onChange={(e) => updateField("dob", e.target.value)}
                  disabled={loading}
                  className="h-11 bg-card/60 border-border/50 focus:border-primary/50 input-glow transition-all"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
              >
                <Label htmlFor="dod" className="text-sm font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary/50" />
                  Date of Passing
                </Label>
                <Input
                  id="dod"
                  type="date"
                  value={form.dod}
                  onChange={(e) => updateField("dod", e.target.value)}
                  disabled={loading}
                  className="h-11 bg-card/60 border-border/50 focus:border-primary/50 input-glow transition-all"
                />
              </motion.div>
            </div>

            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="space-y-2"
            >
              <Label htmlFor="tagline" className="text-sm font-medium">Tagline</Label>
              <Input
                id="tagline"
                placeholder="A short description or quote"
                value={form.tagline}
                onChange={(e) => updateField("tagline", e.target.value)}
                disabled={loading}
                className="h-11 bg-card/60 border-border/50 focus:border-primary/50 input-glow transition-all"
              />
            </motion.div>

            {/* Resting Place */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <Label htmlFor="restingPlace" className="text-sm font-medium flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary/50" />
                Resting Place
              </Label>
              <Input
                id="restingPlace"
                placeholder="e.g. Sunset Memorial Park, London"
                value={form.restingPlace}
                onChange={(e) => updateField("restingPlace", e.target.value)}
                disabled={loading}
                className="h-11 bg-card/60 border-border/50 focus:border-primary/50 input-glow transition-all"
              />
            </motion.div>

            {/* Bio */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="space-y-2"
            >
              <Label htmlFor="bio" className="text-sm font-medium">Life Story</Label>
              <Textarea
                id="bio"
                placeholder="Tell their story... You can add more details and format it later."
                value={form.bio}
                onChange={(e) => updateField("bio", e.target.value)}
                disabled={loading}
                rows={6}
                className="resize-y bg-card/60 border-border/50 focus:border-primary/50 input-glow transition-all"
              />
            </motion.div>

            {/* Submit */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="pt-4"
            >
              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full h-12 bg-primary text-primary-foreground hover:opacity-90 rounded-xl text-base font-medium shadow-lg shadow-primary/15 btn-glow"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Create Memorial
                  </>
                )}
              </Button>
              <p className="text-center text-xs text-muted-foreground/50 mt-3">
                You can add photos, videos, music, and more after creating
              </p>
            </motion.div>
          </form>
        </motion.div>
      </main>
    </div>
  )
}