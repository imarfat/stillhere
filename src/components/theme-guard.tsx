"use client"

import { useEffect, type ReactNode } from "react"
import { useTheme } from "next-themes"
import { DARK_MODE_ENABLED } from "@/lib/theme-config"

export function ThemeGuard({ children }: { children: ReactNode }) {
  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    if (!DARK_MODE_ENABLED && resolvedTheme === "dark") {
      setTheme("light")
    }
  }, [resolvedTheme, setTheme])

  return children
}
