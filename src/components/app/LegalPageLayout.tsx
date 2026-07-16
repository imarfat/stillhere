"use client"

import { useNavigation } from "@/lib/store"
import { ArrowLeft } from "lucide-react"

type LegalPageLayoutProps = {
  title: string
  children: React.ReactNode
}

export function LegalSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="legal-section">
      <h2 className="legal-section__title">{title}</h2>
      <div className="legal-section__body">{children}</div>
    </section>
  )
}

export function LegalPageLayout({ title, children }: LegalPageLayoutProps) {
  const { navigate } = useNavigation()

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 page-decor-bg bg-gradient-to-b from-background via-background/95 to-primary/[0.04]" />
      <div className="absolute inset-0 bg-grain opacity-[0.35]" />
      <div className="hero-ambient absolute top-0 left-1/2 -translate-x-1/2 w-[520px] h-[320px] bg-primary/[0.04] rounded-full blur-[100px] pointer-events-none" />

      <header className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-md px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate({ page: "landing" })}
            className="font-serif text-xl font-semibold text-gradient-warm hover:opacity-90 transition-opacity"
          >
            StillHere
          </button>
          <button
            type="button"
            onClick={() => navigate({ page: "landing" })}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
            Back to home
          </button>
        </div>
      </header>

      <main className="relative z-10 flex-1 px-4 sm:px-6 py-10 sm:py-14">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 sm:mb-10">
            <p className="legal-page-label mb-3">Legal</p>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground">Last updated July 16, 2026</p>
          </div>

          <article className="legal-document rounded-2xl border border-border/60 bg-card/85 backdrop-blur-sm shadow-soft p-6 sm:p-8 md:p-10 legal-prose">
            {children}
          </article>
        </div>
      </main>

      <footer className="relative z-10 border-t border-border/50 bg-background/70 backdrop-blur-sm px-6 py-6 mt-auto">
        <p className="max-w-3xl mx-auto text-center text-xs text-muted-foreground/70">
          Questions? Reach us at{" "}
          <a href="mailto:hello@stillhere.app" className="text-primary hover:underline">
            hello@stillhere.app
          </a>
        </p>
      </footer>
    </div>
  )
}
