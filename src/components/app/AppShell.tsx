"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useNavigation } from "@/lib/store"
import { LandingPage } from "./LandingPage"
import { LoginPage } from "./LoginPage"
import { SignupPage } from "./SignupPage"
import { DashboardPage } from "./DashboardPage"
import { CreateMemorialPage } from "./CreateMemorialPage"
import { EditMemorialPage } from "./EditMemorialPage"
import { MemorialPage } from "./MemorialPage"
import { SettingsPage } from "./SettingsPage"
import { ForgotPasswordPage } from "./ForgotPasswordPage"
import { useSession } from "next-auth/react"
import { useEffect, useRef } from "react"

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
}

export function AppShell() {
  const { route, navigate } = useNavigation()
  const { data: session, status } = useSession()
  const hydrated = useRef(false)
  const hasNavigatedOnce = useRef(false)

  useEffect(() => {
    hydrated.current = true
    const params = new URLSearchParams(window.location.search)
    if (params.get("login") === "1") {
      navigate({ page: "login" })
      window.history.replaceState({}, "", "/")
    }
  }, [navigate])

  useEffect(() => {
    if (!hydrated.current) return
    hasNavigatedOnce.current = true
    window.scrollTo(0, 0)
  }, [route.page])

  useEffect(() => {
    if (!hydrated.current) return
    if (status === "authenticated" && route.page === "landing") {
      navigate({ page: "dashboard" })
    }
  }, [status, route.page, navigate])

  useEffect(() => {
    if (!hydrated.current) return
    if (status === "unauthenticated" && (route.page === "dashboard" || route.page === "create-memorial" || route.page === "edit-memorial" || route.page === "settings")) {
      navigate({ page: "login" })
    }
  }, [status, route.page, navigate])

  const renderPage = () => {
    switch (route.page) {
      case "landing":
        return <LandingPage />
      case "login":
        return <LoginPage />
      case "signup":
        return <SignupPage />
      case "forgot-password":
        return <ForgotPasswordPage />
      case "dashboard":
        return <DashboardPage />
      case "create-memorial":
        return <CreateMemorialPage />
      case "edit-memorial":
        return <EditMemorialPage memorialId={route.memorialId} />
      case "memorial":
        return <MemorialPage slug={route.slug} />
      case "settings":
        return <SettingsPage />
      default:
        return <LandingPage />
    }
  }

  // Show a skeleton while session is loading to prevent flash
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={route.page}
        variants={pageVariants}
        initial={hasNavigatedOnce.current ? false : "initial"}
        animate="animate"
        exit="exit"
        className="min-h-screen flex flex-col"
      >
        {renderPage()}
      </motion.div>
    </AnimatePresence>
  )
}