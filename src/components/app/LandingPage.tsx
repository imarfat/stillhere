"use client"

import { useState, useEffect } from "react"
import { motion, type Variants } from "framer-motion"
import { useSession } from "next-auth/react"
import { useTheme } from "next-themes"
import { useNavigation } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { HeroLineArt } from "@/components/app/HeroLineArt"
import { Heart, Flame, Flower2, Share2, Image, Music, Clock, ArrowRight, Sun, Moon, Sparkles, Feather, Quote, Star, ChevronDown } from "lucide-react"

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: "easeOut" },
  }),
}

const stagger: Variants = {
  visible: {
    transition: { staggerChildren: 0.08 },
  },
}

const desktopHeroDots = [
  { top: "10%", left: "18%", size: "w-0.5 h-0.5", color: "bg-primary/20", anim: "animate-float-slow", delay: "0.4s" },
  { top: "14%", right: "22%", size: "w-1 h-1", color: "bg-amber-light/25", anim: "animate-float", delay: "1.2s" },
  { top: "42%", left: "5%", size: "w-1 h-1", color: "bg-accent/25", anim: "animate-float", delay: "0.8s" },
  { top: "48%", right: "6%", size: "w-0.5 h-0.5", color: "bg-primary/30", anim: "animate-float-slow", delay: "2s" },
  { top: "26%", left: "32%", size: "w-0.5 h-0.5", color: "bg-primary/15", anim: "animate-float", delay: "1.6s" },
  { top: "30%", right: "32%", size: "w-1 h-1", color: "bg-accent/20", anim: "animate-float-slow", delay: "0.2s" },
  { top: "72%", left: "14%", size: "w-1.5 h-1.5", color: "bg-primary/20", anim: "animate-float", delay: "2.4s" },
  { top: "76%", right: "12%", size: "w-1 h-1", color: "bg-amber-light/20", anim: "animate-float-slow", delay: "1s" },
  { bottom: "22%", left: "26%", size: "w-0.5 h-0.5", color: "bg-accent/30", anim: "animate-float", delay: "1.8s" },
  { bottom: "18%", right: "28%", size: "w-1 h-1", color: "bg-primary/25", anim: "animate-float-slow", delay: "0.6s" },
] as const

export function LandingPage() {
  const { data: session, status } = useSession()
  const { navigate } = useNavigation()
  const { setTheme, resolvedTheme } = useTheme()

  useEffect(() => {
    if (status === "authenticated") navigate({ page: "dashboard" })
  }, [status, navigate])

  const handleCreate = () => {
    if (session) navigate({ page: "dashboard" })
    else navigate({ page: "login" })
  }

  const handleLearnMore = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })
  }

  const handleToggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  return (
    <div className="flex flex-col min-h-screen relative select-none">
      {/* Theme toggle - fixed */}
      {resolvedTheme && (
        <button
          onClick={handleToggleTheme}
          className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full bg-card/90 backdrop-blur-md border border-border/60 flex items-center justify-center hover:bg-card hover:shadow-soft transition-all shadow-soft"
          aria-label="Toggle theme"
        >
          {resolvedTheme === "dark" ? <Sun className="w-4 h-4 text-amber-light" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
        </button>
      )}

      {/* ── Hero ── */}
      <section className="hero-section relative min-h-screen px-6 overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-primary/[0.06] max-sm:to-primary/[0.03]" />
        <HeroLineArt />
        <div className="absolute inset-0 bg-grain" />

        {/* Radial ambient glow — toned down on mobile */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] max-sm:w-[260px] max-sm:h-[260px] bg-primary/[0.04] max-sm:bg-primary/[0.015] rounded-full blur-[120px] max-sm:blur-[70px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] max-sm:hidden bg-accent/[0.03] rounded-full blur-[100px]" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] max-sm:hidden bg-flower/[0.02] rounded-full blur-[80px]" />

        {/* Decorative floating elements */}
        <div className="absolute top-[20%] left-[10%] w-1 h-1 rounded-full bg-primary/30 animate-float" />
        <div className="absolute top-[35%] right-[15%] w-1.5 h-1.5 rounded-full bg-primary/20 animate-float-slow" />
        <div className="absolute bottom-[30%] left-[20%] w-1 h-1 rounded-full bg-accent/30 animate-float" />
        <div className="absolute top-[60%] right-[25%] w-0.5 h-0.5 rounded-full bg-amber-light/30 animate-float-slow" />
        {desktopHeroDots.map((dot, i) => (
          <div
            key={i}
            className={`absolute hidden xl:block rounded-full ${dot.size} ${dot.color} ${dot.anim}`}
            style={{
              top: "top" in dot ? dot.top : undefined,
              bottom: "bottom" in dot ? dot.bottom : undefined,
              left: "left" in dot ? dot.left : undefined,
              right: "right" in dot ? dot.right : undefined,
              animationDelay: dot.delay,
            }}
          />
        ))}

        {/* Decorative corner ornaments — desktop only */}
        <div className="absolute top-8 left-8 hidden sm:block w-16 h-16 border-t border-l border-primary/10 rounded-tl-lg" />
        <div className="absolute top-8 right-8 hidden sm:block w-16 h-16 border-t border-r border-primary/10 rounded-tr-lg" />
        <div className="absolute bottom-8 left-8 hidden sm:block w-16 h-16 border-b border-l border-primary/10 rounded-bl-lg" />
        <div className="absolute bottom-8 right-8 hidden sm:block w-16 h-16 border-b border-r border-primary/10 rounded-br-lg" />

        <div className="relative z-10 min-h-screen max-w-2xl mx-auto w-full flex flex-col">
          <div className="flex-1 flex items-center justify-center text-center">
            <div className="w-full">
              {/* Ornament */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.2 }}
                className="mb-10 flex justify-center max-sm:translate-x-0 sm:-translate-x-2"
              >
                <div className="flex items-center gap-4">
                  <span className="block w-12 h-px bg-gradient-to-r from-transparent to-primary/40" />
                  <span className="inline-flex items-center justify-center w-3.5 h-3.5 shrink-0">
                    <Heart className="w-full h-full text-primary/60" strokeWidth={1.75} />
                  </span>
                  <span className="block w-12 h-px bg-gradient-to-l from-transparent to-primary/40" />
                </div>
              </motion.div>

              {/* Title */}
              <motion.h1
                className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 text-shadow-warm"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <span className="text-gradient-warm">StillHere</span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                className="hero-subline mb-4 max-w-xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.8 }}
              >
                Beautiful digital memorials for those you love
              </motion.p>

              <motion.p
                className="text-sm text-muted-foreground/60 mb-12 max-w-md mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.8 }}
              >
                Create a lasting tribute with photos, stories, music, and messages from family and friends. Share it with anyone through a simple link.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row gap-3 justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.8 }}
              >
                <Button
                  size="lg"
                  onClick={handleCreate}
                  className="bg-primary text-primary-foreground hover:opacity-90 px-8 h-12 text-base rounded-full shadow-lg max-sm:shadow-md max-sm:shadow-primary/10 sm:btn-glow sm:glow-strong"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create a Memorial
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleLearnMore}
                  className="px-8 h-12 text-base rounded-full border-border/40 hover:bg-muted/50 hover:border-primary/20 transition-all"
                >
                  <Feather className="w-4 h-4 mr-2" />
                  Learn More
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Scroll indicator — same column as heart */}
          <div className="shrink-0 pb-8 flex justify-center">
            <motion.div
              className="sm:hidden"
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            >
              <ChevronDown className="w-6 h-6 text-muted-foreground/40" strokeWidth={1.75} />
            </motion.div>
            <motion.div
              className="hidden sm:block"
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            >
              <div className="box-border w-6 h-9 rounded-full border border-muted-foreground/20 flex flex-col items-center pt-1.5">
                <motion.div
                  className="w-1 h-1.5 rounded-full bg-primary/50"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 2.5 }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20 sm:py-28 px-6 relative">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
          >
            <motion.h2
              className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold"
              variants={fadeUp}
              custom={0}
            >
              Keep their memory alive
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {[
              {
                icon: Flame,
                title: "Lasting Tributes",
                description: "Leave candles, flowers, and heartfelt messages that family and friends can see and add to.",
                color: "text-candle",
                bg: "bg-candle/[0.08]",
                border: "border-candle/10",
              },
              {
                icon: Image,
                title: "Share Memories",
                description: "Upload photos, add life events to a timeline, embed videos, and write their story in a beautiful biography.",
                color: "text-primary",
                bg: "bg-primary/[0.08]",
                border: "border-primary/10",
              },
              {
                icon: Share2,
                title: "Easy Sharing",
                description: "Generate QR codes for printed materials. Share instantly via WhatsApp, Facebook, or a simple link.",
                color: "text-accent",
                bg: "bg-accent/[0.08]",
                border: "border-accent/10",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={fadeUp}
                custom={i + 2}
              >
                <div className={`bg-card border ${feature.border} rounded-2xl p-6 sm:p-8 h-full transition-all duration-500 group select-none hover:-translate-y-1 hover:border-primary/20 hover:shadow-[0_8px_32px_rgba(196,148,74,0.12)] dark:hover:shadow-[0_6px_24px_rgba(212,165,116,0.05)]`}>
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.bg} mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it Works ── */}
      <section className="py-20 sm:py-28 px-6 bg-muted/35 relative overflow-hidden">
        {/* Subtle decorative arc */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/[0.02] rounded-full blur-[100px]" />

        <div className="max-w-5xl mx-auto relative">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
          >
            <motion.h2
              className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold"
              variants={fadeUp}
              custom={0}
            >
              How it works
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-14 relative">
            {/* Connector line (desktop only) — animates on scroll */}
            <motion.div
              className="hidden md:block absolute top-12 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-border to-transparent"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
              style={{ transformOrigin: "center" }}
            />

            {[
              {
                step: "01",
                icon: Heart,
                title: "Create",
                description: "Sign up for free and create a memorial page in minutes. Just a name and a few details to get started.",
              },
              {
                step: "02",
                icon: Music,
                title: "Personalize",
                description: "Add photos, write their life story, set a favourite song, create a timeline, and embed video tributes.",
              },
              {
                step: "03",
                icon: Share2,
                title: "Share",
                description: "Share the memorial link or QR code with family and friends. They can leave tributes and guestbook messages.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 50, scale: 0.92 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.7,
                  delay: i * 0.2,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="text-center relative"
              >
                <motion.div
                  className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-card border border-primary/15 mb-6 shadow-sm"
                  initial={{ scale: 0, rotate: -20 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: i * 0.2 + 0.15,
                  }}
                >
                  <item.icon className="w-8 h-8 text-primary" />
                  <motion.span
                    className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shadow-md"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 12,
                      delay: i * 0.2 + 0.4,
                    }}
                  >
                    {item.step}
                  </motion.span>
                </motion.div>
                <motion.h3
                  className="font-serif text-2xl font-semibold mb-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.2 + 0.35 }}
                >
                  {item.title}
                </motion.h3>
                <motion.p
                  className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.2 + 0.5 }}
                >
                  {item.description}
                </motion.p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature Tags ── */}
      <section className="py-20 sm:py-28 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
          >
            <motion.p
              className="text-primary text-xs font-semibold tracking-[0.2em] uppercase mb-4"
              variants={fadeUp}
              custom={0}
            >
              Complete feature set
            </motion.p>
            <motion.h2
              className="font-serif text-3xl sm:text-4xl font-bold mb-10"
              variants={fadeUp}
              custom={1}
            >
              Everything to honor a life
            </motion.h2>

            <motion.div
              className="grid grid-cols-3 gap-2 sm:gap-3 mb-12 max-w-3xl mx-auto"
              variants={fadeUp}
              custom={2}
            >
              {[
                { icon: Clock, label: "Life Timeline" },
                { icon: Image, label: "Photo Gallery" },
                { icon: Music, label: "Favourite Song" },
                { icon: Flower2, label: "Flower Tributes" },
                { icon: Flame, label: "Candle Tributes" },
                { icon: Share2, label: "QR Code Sharing" },
              ].map((tag) => (
                <div
                  key={tag.label}
                  className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-full bg-card border border-border/50 text-xs sm:text-sm hover:border-primary/30 hover:shadow-soft transition-all duration-300 cursor-default"
                >
                  <tag.icon className="w-4 h-4 text-primary" />
                  <span className="font-medium">{tag.label}</span>
                </div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} custom={3}>
              <Button
                size="lg"
                onClick={handleCreate}
                className="bg-primary text-primary-foreground hover:opacity-90 px-8 h-12 text-base rounded-full shadow-lg max-sm:shadow-md max-sm:shadow-primary/10 sm:btn-glow sm:glow-strong"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Get Started — It&apos;s Free
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 sm:py-28 px-6 bg-muted/35 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/[0.02] rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-flower/[0.02] rounded-full blur-[80px]" />

        <div className="max-w-5xl mx-auto relative">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
          >
            <motion.p
              className="text-primary text-xs font-semibold tracking-[0.2em] uppercase mb-4"
              variants={fadeUp}
              custom={0}
            >
              From our community
            </motion.p>
            <motion.h2
              className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold"
              variants={fadeUp}
              custom={1}
            >
              Words of comfort
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {[
              {
                quote: "StillHere gave us a beautiful space to remember Mom. The tributes from family around the world brought us so much comfort during a difficult time.",
                name: "Sarah M.",
                role: "Daughter",
                icon: Heart,
              },
              {
                quote: "I created a memorial for my best friend. Seeing the candles and flowers from people who loved him makes me feel like his memory will truly live on.",
                name: "James L.",
                role: "Friend",
                icon: Flame,
              },
              {
                quote: "The QR code feature is wonderful. We placed it on the service program and now everyone can revisit the memorial and share their own memories.",
                name: "Maria K.",
                role: "Granddaughter",
                icon: Star,
              },
            ].map((testimonial, i) => (
              <motion.div
                key={testimonial.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={fadeUp}
                custom={i + 2}
              >
                <div className="bg-card border border-border/50 rounded-2xl p-6 sm:p-8 h-full transition-all duration-500 group relative hover:-translate-y-1 hover:border-primary/20 hover:shadow-[0_8px_32px_rgba(196,148,74,0.12)] dark:hover:shadow-[0_6px_24px_rgba(212,165,116,0.05)] select-none">
                  <Quote className="absolute top-6 right-6 w-8 h-8 text-primary/10 group-hover:text-primary/20 transition-colors" />
                  <div className="flex items-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-primary/80 text-primary/80" />
                    ))}
                  </div>
                  <p className="text-sm sm:text-base leading-relaxed text-muted-foreground mb-6 relative z-10">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <testimonial.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 px-6 border-t border-border/30 mt-auto relative">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-serif text-xl font-semibold text-gradient-warm">StillHere</span>
          <p className="text-sm text-muted-foreground/70">
            Create a memorial for someone you love
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCreate}
            className="text-primary hover:text-primary/80 hover:bg-primary/5"
          >
            Get Started <ArrowRight className="ml-1 w-3 h-3" />
          </Button>
        </div>
      </footer>
    </div>
  )
}

