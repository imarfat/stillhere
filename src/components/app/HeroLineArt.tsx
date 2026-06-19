"use client"

import { useEffect, useId, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import paths from "@/data/hero-line-art-paths.json"

const VIEWBOX_WIDTH = 1024
const VIEWBOX_HEIGHT = 576
const DRAW_DURATION = 2.2
const MAX_DELAY = 1.6
const CROSSFADE_DURATION = 1.1
const CROSSFADE_START = MAX_DELAY + DRAW_DURATION - 0.75
const DONE_AT = CROSSFADE_START + CROSSFADE_DURATION

const crossfadeEase = [0.4, 0, 0.2, 1] as const

function drawDelay(d: string): number {
  const match = d.match(/^M\s+([\d.]+)/)
  const x = match ? parseFloat(match[1]) : VIEWBOX_WIDTH / 2
  const edgeDistance = Math.min(x, VIEWBOX_WIDTH - x) / (VIEWBOX_WIDTH / 2)
  return edgeDistance * MAX_DELAY
}

type Phase = "drawing" | "crossfade" | "done"

export function HeroLineArt() {
  const reducedMotion = useReducedMotion()
  const maskId = useId().replace(/:/g, "")
  const [phase, setPhase] = useState<Phase>("drawing")

  useEffect(() => {
    if (reducedMotion) {
      setPhase("done")
      return
    }

    const crossfadeTimer = window.setTimeout(() => setPhase("crossfade"), CROSSFADE_START * 1000)
    const doneTimer = window.setTimeout(() => setPhase("done"), DONE_AT * 1000)

    return () => {
      window.clearTimeout(crossfadeTimer)
      window.clearTimeout(doneTimer)
    }
  }, [reducedMotion])

  const showMaskedLayer = phase !== "done"
  const fullOpacity = phase === "drawing" ? 0 : 1
  const maskedOpacity = phase === "crossfade" ? 0 : 1

  return (
    <div className="hero-line-art" aria-hidden="true">
      <div className="hero-line-art__frame">
        <svg
          className="hero-line-art__svg"
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          fill="none"
          preserveAspectRatio="xMidYMax meet"
        >
          {showMaskedLayer && !reducedMotion && (
            <defs>
              <mask id={maskId} maskUnits="userSpaceOnUse">
                <rect width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT} fill="black" />
                {paths.map((d, i) => (
                  <motion.path
                    key={i}
                    d={d}
                    fill="none"
                    stroke="white"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{
                      pathLength: {
                        duration: DRAW_DURATION,
                        ease: "easeInOut",
                        delay: drawDelay(d),
                      },
                      opacity: { duration: 0.1, delay: drawDelay(d) },
                    }}
                  />
                ))}
                <motion.rect
                  width={VIEWBOX_WIDTH}
                  height={VIEWBOX_HEIGHT}
                  fill="white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: phase === "crossfade" ? 1 : 0 }}
                  transition={{ duration: CROSSFADE_DURATION, ease: "easeOut" }}
                />
              </mask>
            </defs>
          )}

          {showMaskedLayer && !reducedMotion && (
            <motion.image
              href="/hero-line-art.png"
              width={VIEWBOX_WIDTH}
              height={VIEWBOX_HEIGHT}
              preserveAspectRatio="xMidYMax meet"
              mask={`url(#${maskId})`}
              animate={{ opacity: maskedOpacity }}
              transition={{ duration: CROSSFADE_DURATION, ease: crossfadeEase }}
            />
          )}

          <motion.image
            href="/hero-line-art.png"
            width={VIEWBOX_WIDTH}
            height={VIEWBOX_HEIGHT}
            preserveAspectRatio="xMidYMax meet"
            animate={{ opacity: reducedMotion || phase === "done" ? 1 : fullOpacity }}
            transition={{ duration: CROSSFADE_DURATION, ease: crossfadeEase }}
          />
        </svg>
      </div>
    </div>
  )
}
