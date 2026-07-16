"use client"

import { useState } from "react"
import { useScroll, useMotionValueEvent } from "framer-motion"
import { useNavigation } from "@/lib/store"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Menu, Sparkles, Route, Quote, type LucideIcon } from "lucide-react"

const navLinks: {
  label: string
  href: string
  icon: LucideIcon
  hint: string
}[] = [
  { label: "Features", href: "#features", icon: Sparkles, hint: "What you can create" },
  { label: "How it works", href: "#how-it-works", icon: Route, hint: "Three simple steps" },
  { label: "Stories", href: "#stories", icon: Quote, hint: "From our community" },
]

export function LandingNav() {
  const { navigate } = useNavigation()
  const [scrolled, setScrolled] = useState(
    () => typeof window !== "undefined" && window.scrollY > 48
  )
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolled(y > 48)
  })

  const handleAnchor = (href: string) => {
    setDrawerOpen(false)
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" })
  }

  const handleGetStarted = () => {
    setDrawerOpen(false)
    navigate({ page: "signup" })
  }

  return (
    <header
      className={`landing-nav xl:hidden fixed top-3 left-0 right-0 z-50 px-4 sm:px-6 md:px-8 transition-all duration-500 ${
        scrolled ? "landing-nav--scrolled py-2" : "py-2"
      }`}
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div
        className={`landing-nav__inner mx-auto max-w-6xl grid grid-cols-[1fr_auto] md:grid-cols-[auto_1fr_auto] items-center gap-3 md:gap-4 rounded-2xl px-3 sm:px-5 md:px-6 py-2.5 min-h-[3.25rem] transition-all duration-500 ${
          scrolled ? "landing-nav__inner--glass" : "landing-nav__inner--idle"
        }`}
      >
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="font-serif text-xl font-semibold text-gradient-warm tracking-tight shrink-0 min-h-11 flex items-center justify-self-start"
          aria-label="Scroll to top"
        >
          StillHere
        </button>

        <nav className="hidden md:flex items-center justify-center gap-1 lg:gap-2 min-h-11" aria-label="Tablet">
          {navLinks.map((link) => (
            <button
              key={link.href}
              type="button"
              onClick={() => handleAnchor(link.href)}
              className="inline-flex items-center justify-center h-10 px-3 lg:px-4 text-sm font-medium text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 transition-colors"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="hidden md:flex items-center justify-self-end gap-2 shrink-0 min-h-11">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate({ page: "login" })}
            className="rounded-full h-10 px-4"
          >
            Sign in
          </Button>
          <Button
            size="sm"
            onClick={handleGetStarted}
            className="rounded-full h-10 px-4 bg-primary text-primary-foreground hover:opacity-90"
          >
            Get Started
          </Button>
        </div>

        <div className="flex md:hidden items-center justify-self-end gap-2 shrink-0 min-h-11">
          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
            <DrawerTrigger asChild>
              <button
                type="button"
                className="w-11 h-11 flex items-center justify-center text-foreground hover:opacity-70 transition-opacity"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5 text-foreground" />
              </button>
            </DrawerTrigger>
            <DrawerContent className="z-[60] pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <DrawerHeader className="text-left">
                <DrawerTitle className="font-serif text-2xl text-gradient-warm">
                  StillHere
                </DrawerTitle>
              </DrawerHeader>

              <nav className="flex flex-col gap-2 px-4 py-2" aria-label="Mobile">
                {navLinks.map((link) => {
                  const Icon = link.icon
                  return (
                    <button
                      key={link.href}
                      type="button"
                      onClick={() => handleAnchor(link.href)}
                      className="flex items-center gap-3 w-full text-left px-3 py-3 min-h-[3.25rem] rounded-xl hover:bg-muted/50 active:bg-muted/60 transition-colors"
                    >
                      <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/[0.08] shrink-0">
                        <Icon className="w-[18px] h-[18px] text-primary" strokeWidth={1.75} />
                      </span>
                      <span className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-base font-medium text-foreground">{link.label}</span>
                        <span className="text-xs text-muted-foreground">{link.hint}</span>
                      </span>
                    </button>
                  )
                })}
              </nav>

              <DrawerFooter className="gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDrawerOpen(false)
                    navigate({ page: "login" })
                  }}
                  className="w-full h-12 rounded-full"
                >
                  Sign in
                </Button>
                <DrawerClose asChild>
                  <Button
                    onClick={handleGetStarted}
                    className="w-full h-12 rounded-full bg-primary text-primary-foreground hover:opacity-90"
                  >
                    Get Started
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </header>
  )
}
