import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "sonner"
import { Providers } from "@/components/auth-provider"

export const metadata: Metadata = {
  title: "StillHere: Digital Memorials",
  description: "Create beautiful, lasting memorial pages for those you love. Share memories, photos, and tributes with family and friends.",
  keywords: ["memorial", "tribute", "remembrance", "obituary", "digital memorial"],
  icons: {
    icon: "/logo.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen">
        <Providers>
          {children}
          <Toaster richColors position="bottom-center" />
        </Providers>
      </body>
    </html>
  )
}
