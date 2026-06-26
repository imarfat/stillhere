import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { normalizeSongEmbedUrl } from "@/lib/slug"
import { getSafeEmbedUrl, getSafeMediaUrl } from "@/lib/security"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const memorial = await db.memorial.findUnique({
      where: { slug },
      include: {
        photos: {
          orderBy: { sortOrder: "asc" },
        },
        videos: {
          orderBy: { createdAt: "desc" },
        },
        timelineEvents: {
          orderBy: { eventDate: "asc" },
        },
        guestbookEntries: {
          where: { approved: true },
          orderBy: { createdAt: "desc" },
        },
        tributes: {
          orderBy: { createdAt: "desc" },
        },
        user: {
          select: { id: true, name: true },
        },
      },
    })

    if (!memorial) {
      return NextResponse.json({ error: "Memorial not found" }, { status: 404 })
    }

    const candles = memorial.tributes.filter((t) => t.kind === "candle").length
    const flowers = memorial.tributes.filter((t) => t.kind === "flower").length

    const result = {
      ...memorial,
      coverPhotoUrl: getSafeMediaUrl(memorial.coverPhotoUrl),
      songUrl: getSafeMediaUrl(memorial.songUrl),
      songEmbedUrl: normalizeSongEmbedUrl(memorial.songEmbedUrl),
      photos: memorial.photos
        .map((photo) => ({ ...photo, url: getSafeMediaUrl(photo.url) }))
        .filter((photo): photo is typeof photo & { url: string } => Boolean(photo.url)),
      videos: memorial.videos
        .map((video) => ({ ...video, embedUrl: getSafeEmbedUrl(video.embedUrl) }))
        .filter((video): video is typeof video & { embedUrl: string } => Boolean(video.embedUrl)),
      tributeCounts: { candles, flowers },
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Fetch public memorial error:", error)
    return NextResponse.json(
      { error: "Failed to fetch memorial" },
      { status: 500 }
    )
  }
}
