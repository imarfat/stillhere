"use client"

import { Heart } from "lucide-react"
import { cn } from "@/lib/utils"

type AppLoadingScreenProps = {
  label?: string
  className?: string
}

export function AppLoadingScreen({
  label = "Loading",
  className,
}: AppLoadingScreenProps) {
  return (
    <div
      className={cn(
        "relative w-full flex items-center justify-center overflow-hidden memorial-hero-fallback-bg memorial-loading-screen min-h-screen",
        className
      )}
    >
      <div className="absolute inset-0 bg-grain opacity-40" />
      <div className="relative z-10 flex flex-col items-center gap-4">
        <Heart
          className="memorial-loading-icon w-4 h-4 text-primary/70 animate-heartbeat fill-primary/15"
          strokeWidth={1.75}
        />
        <div
          className="memorial-loading-spinner w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary/70 animate-spin"
          role="status"
          aria-label={label}
        />
      </div>
    </div>
  )
}
