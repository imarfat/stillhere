"use client"

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import { type ReactNode } from "react"
import { ThemeGuard } from "@/components/theme-guard"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <ThemeGuard>{children}</ThemeGuard>
      </ThemeProvider>
    </NextAuthSessionProvider>
  )
}
