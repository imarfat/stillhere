import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as Record<string, string>).id

    const [memorials, photos, videos, guestbookEntries, tributes, timelineEvents] =
      await Promise.all([
        db.memorial.count({ where: { userId } }),
        db.photo.count({
          where: { memorial: { userId } },
        }),
        db.video.count({
          where: { memorial: { userId } },
        }),
        db.guestbookEntry.count({
          where: { memorial: { userId } },
        }),
        db.tribute.count({
          where: { memorial: { userId } },
        }),
        db.timelineEvent.count({
          where: { memorial: { userId } },
        }),
      ])

    return NextResponse.json({
      memorials,
      photos,
      videos,
      guestbookEntries,
      tributes,
      timelineEvents,
    })
  } catch (error) {
    console.error("Stats error:", error)
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 })
  }
}