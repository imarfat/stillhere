"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useNavigation, type AppRoute } from "@/lib/store"
import { LandingPage } from "./LandingPage"
import { LoginPage } from "./LoginPage"
import { SignupPage } from "./SignupPage"
import { DashboardPage } from "./DashboardPage"
import { CreateMemorialPage } from "./CreateMemorialPage"
import { EditMemorialPage } from "./EditMemorialPage"
import { MemorialPage } from "./MemorialPage"
import { SettingsPage } from "./SettingsPage"
import { ForgotPasswordPage } from "./ForgotPasswordPage"
import { PrivacyPolicyPage } from "./PrivacyPolicyPage"
import { TermsOfServicePage } from "./TermsOfServicePage"
import { AppLoadingScreen } from "./AppLoadingScreen"
import { useSession } from "next-auth/react"
import { useEffect, useRef } from "react"

function routeKey(route: AppRoute) {
  if (route.page === "memorial") return `memorial-${route.slug}`
  if (route.page === "edit-memorial") return `edit-${route.memorialId}`
  return route.page
}

function isLegalPage(page: AppRoute["page"]) {
  return page === "privacy" || page === "terms"
}

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
}

function isLandingLegalHop(from: AppRoute["page"], to: AppRoute["page"]) {
  return (from === "landing" && isLegalPage(to)) || (isLegalPage(from) && to === "landing")
}

const instantPageVariants = {
  initial: { opacity: 1, y: 0 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, transition: { duration: 0 } },
}

export function AppShell() {
  const { route, navigate } = useNavigation()
  const { data: session, status } = useSession()
  const hydrated = useRef(false)
  const hasNavigatedOnce = useRef(false)
  const previousPage = useRef<AppRoute["page"]>(route.page)
  const scrollAfterExit = useRef(false)

  const skipPageTransition =
    isLegalPage(route.page) || isLegalPage(previousPage.current)

  useEffect(() => {
    hydrated.current = true
    const params = new URLSearchParams(window.location.search)
    if (params.get("login") === "1") {
      navigate({ page: "login" })
      window.history.replaceState({}, "", "/")
    }
  }, [navigate])

  useEffect(() => {
    const onPopState = () => {
      const match = window.location.pathname.match(/^\/memorial\/([^/]+)\/?$/)
      if (match) {
        navigate({ page: "memorial", slug: decodeURIComponent(match[1]) })
      } else if (useNavigation.getState().route.page === "memorial") {
        navigate({ page: "landing" })
      }
    }
    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [navigate])

  useEffect(() => {
    if (!hydrated.current) return
    hasNavigatedOnce.current = true

    if (previousPage.current !== route.page) {
      scrollAfterExit.current = true
    }

    previousPage.current = route.page
  }, [route.page])

  const handleExitComplete = () => {
    if (!scrollAfterExit.current) return
    scrollAfterExit.current = false
    window.scrollTo(0, 0)
  }

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
      case "privacy":
        return <PrivacyPolicyPage />
      case "terms":
        return <TermsOfServicePage />
      default:
        return <LandingPage />
    }
  }

  // Show a skeleton while session is loading to prevent flash
  if (status === "loading") {
    return <AppLoadingScreen />
  }

  return (
    <AnimatePresence mode="wait" onExitComplete={handleExitComplete}>
      <motion.div
        key={routeKey(route)}
        variants={skipPageTransition ? instantPageVariants : pageVariants}
        initial={
          skipPageTransition ? false : hasNavigatedOnce.current ? false : "initial"
        }
        animate="animate"
        exit="exit"
        className="min-h-screen flex flex-col"
      >
        {renderPage()}
      </motion.div>
    </AnimatePresence>
  )
}