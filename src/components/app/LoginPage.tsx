"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useNavigation } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { AuthFloatingDots } from "@/components/app/AuthFloatingDots"
import { Loader2, Flame } from "lucide-react"

export function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { navigate, route } = useNavigation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error("Invalid email or password")
      } else {
        const redirect = "redirect" in route && typeof route.redirect === "string" ? route.redirect : undefined
        if (redirect) {
          navigate({ page: "landing" })
        } else {
          navigate({ page: "dashboard" })
        }
        toast.success("Welcome back!")
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Decorative background */}
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
        {/* Brand */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-gradient-warm mb-2">StillHere</h1>
          <p className="text-muted-foreground text-sm">Sign in to manage your memorials</p>
        </div>

        <Card className="border-border/50 shadow-xl shadow-black/5 backdrop-blur-sm bg-card/80">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="font-serif text-2xl">Welcome back</CardTitle>
            <CardDescription>Enter your credentials to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
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
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <button
                    type="button"
                    onClick={() => navigate({ page: "forgot-password" })}
                    className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="current-password"
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
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <button
                  onClick={() => navigate({ page: "signup" })}
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Sign up
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Decorative footer line */}
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