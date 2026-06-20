"use client"

import { useState } from "react"
import { useNavigation } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { AuthFloatingDots } from "@/components/app/AuthFloatingDots"
import { ArrowLeft, Loader2, Mail, Flame } from "lucide-react"

export function ForgotPasswordPage() {
  const { navigate, back } = useNavigation()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Unable to send reset email")
        return
      }

      setSent(true)
      toast.success("Check your email for reset instructions")
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-6 py-12 max-sm:py-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-primary/[0.03] max-sm:to-primary/[0.015]" />
      <div className="absolute inset-0 bg-grain" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] max-sm:w-[240px] max-sm:h-[240px] bg-primary/[0.03] max-sm:bg-primary/[0.012] rounded-full blur-[120px] max-sm:blur-[70px]" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] max-sm:hidden bg-accent/[0.02] rounded-full blur-[80px]" />
      <AuthFloatingDots />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <button
            type="button"
            onClick={() => navigate({ page: "landing" })}
            className="font-serif text-3xl font-bold text-gradient-warm mb-2 hover:opacity-90 transition-opacity"
          >
            StillHere
          </button>
          <p className="text-muted-foreground text-sm">Reset your account password</p>
        </div>

        <Card className="border-border/50 shadow-xl shadow-black/5 backdrop-blur-sm bg-card/80">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="font-serif text-2xl">Forgot password</CardTitle>
            <CardDescription>
              {sent
                ? "If an account exists for that email, we sent reset instructions."
                : "Enter your email and we will send you a reset link."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-border/40 bg-muted/20 p-4 text-sm text-muted-foreground leading-relaxed">
                  Check your inbox for a link to reset your password. The link expires in 1 hour.
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 rounded-xl"
                  onClick={() => navigate({ page: "login" })}
                >
                  Back to sign in
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="email"
                    className="h-11 bg-muted/30 border-border/40 focus:border-primary/40 input-glow transition-colors"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 bg-primary text-primary-foreground hover:opacity-90 rounded-xl text-sm font-medium max-sm:shadow-sm max-sm:shadow-primary/10 sm:shadow-md sm:shadow-primary/10 sm:btn-glow"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending link...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send reset link
                    </>
                  )}
                </Button>
              </form>
            )}

            {!sent && (
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={back}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to sign in
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="mt-8 hidden sm:flex items-center justify-center gap-3 text-xs text-muted-foreground/40"
        >
          <div className="h-px w-8 bg-gradient-to-r from-transparent to-border" />
          <Flame className="w-3 h-3 text-primary/30 animate-pulse-soft" />
          <div className="h-px w-8 bg-gradient-to-l from-transparent to-border" />
        </motion.div>
      </motion.div>
    </div>
  )
}
