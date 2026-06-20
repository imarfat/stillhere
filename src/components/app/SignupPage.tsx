"use client"

import { useState, useMemo } from "react"
import { useNavigation } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { AuthFloatingDots } from "@/components/app/AuthFloatingDots"
import { Loader2, Eye, EyeOff, X } from "lucide-react"

export function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { navigate } = useNavigation()

  const passwordChecks = useMemo(() => ({
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  }), [password])

  const passwordScore = useMemo(() => {
    return Object.values(passwordChecks).filter(Boolean).length
  }, [passwordChecks])

  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"]
  const strengthColors = ["", "bg-red-500/80", "bg-orange-500/80", "bg-yellow-500/80", "bg-green-500/80"]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name: name || undefined }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Failed to create account")
        return
      }

      toast.success("Account created! Please sign in.")
      navigate({ page: "login" })
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-8 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-primary/[0.03] max-sm:to-primary/[0.015]" />
      <div className="absolute inset-0 bg-grain" />
      <div className="absolute top-1/4 right-1/4 max-sm:left-1/2 max-sm:right-auto max-sm:-translate-x-1/2 w-[400px] h-[400px] max-sm:w-[240px] max-sm:h-[240px] bg-primary/[0.03] max-sm:bg-primary/[0.012] rounded-full blur-[100px] max-sm:blur-[70px]" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] max-sm:hidden bg-flower/[0.02] rounded-full blur-[80px]" />
      <AuthFloatingDots />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Brand */}
        <div className="text-center mb-6">
          <h1 className="font-serif text-3xl font-bold text-gradient-warm mb-1">StillHere</h1>
          <p className="text-muted-foreground text-sm">Create your account</p>
        </div>

        <Card className="border-border/50 shadow-xl shadow-black/5 backdrop-blur-sm bg-card/80">
          <CardHeader className="space-y-0.5 pb-3">
            <CardTitle className="font-serif text-xl">Get started</CardTitle>
            <CardDescription className="text-sm">Create an account to manage memorials</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-medium">Name <span className="text-muted-foreground/50 font-normal">(optional)</span></Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  autoComplete="name"
                  className="h-10 bg-muted/30 border-border/40 focus:border-primary/40 input-glow transition-colors"
                />
              </div>
              <div className="space-y-1.5">
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
                  className="h-10 bg-muted/30 border-border/40 focus:border-primary/40 input-glow transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="new-password"
                    className="h-10 pr-10 bg-muted/30 border-border/40 focus:border-primary/40 input-glow transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {password && (
                  <div className="flex items-center gap-2 pt-0.5">
                    <div className="flex flex-1 gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-0.5 flex-1 rounded-full transition-all duration-500 ${
                            i <= passwordScore ? strengthColors[passwordScore] : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                    {passwordScore > 0 && (
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {strengthLabels[passwordScore]}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="new-password"
                  className={`h-10 bg-muted/30 border-border/40 focus:border-primary/40 input-glow transition-colors ${
                    confirmPassword && password !== confirmPassword ? "border-destructive/50" : ""
                  }`}
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-[11px] text-destructive flex items-center gap-1">
                    <X className="w-3 h-3" />
                    Passwords do not match
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full h-10 bg-primary text-primary-foreground hover:opacity-90 rounded-xl text-sm font-medium max-sm:shadow-sm max-sm:shadow-primary/10 sm:shadow-md sm:shadow-primary/10 sm:btn-glow"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  onClick={() => navigate({ page: "login" })}
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Sign in
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}