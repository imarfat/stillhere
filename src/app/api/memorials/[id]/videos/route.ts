import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { parseVideoUrl } from "@/lib/slug"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: memorialId } = await params

    const memorial = await db.memorial.findUnique({ where: { id: memorialId } })
    if (!memorial) {
      return NextResponse.json({ error: "Memorial not found" }, { status: 404 })
    }
    if (memorial.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const { url, title } = body

    if (!url) {
      return NextResponse.json({ error: "Video URL is required" }, { status: 400 })
    }

    const parsed = parseVideoUrl(url)
    if (!parsed) {
      return NextResponse.json(
        { error: "Only YouTube and Vimeo URLs are supported" },
        { status: 400 }
      )
    }

    const video = await db.video.create({
      data: {
        memorialId,
        embedUrl: parsed.embedUrl,
        title: title || null,
      },
    })

    return NextResponse.json(video, { status: 201 })
  } catch (error) {
    console.error("Add video error:", error)
    return NextResponse.json(
      { error: "Failed to add video" },
      { status: 500 }
    )
  }
}
