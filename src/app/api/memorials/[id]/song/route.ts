import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { parseSongUrl } from "@/lib/slug"

export async function PUT(
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
    const { songEmbedUrl, songTitle, songArtist, songUrl } = body

    const updateData: Record<string, string | null> = {}

    if (songUrl) {
      updateData.songUrl = songUrl
      updateData.songEmbedUrl = null
      updateData.songTitle = songTitle || null
      updateData.songArtist = songArtist || null
    } else if (songEmbedUrl !== undefined) {
      if (!songEmbedUrl) {
        updateData.songEmbedUrl = null
        updateData.songUrl = null
      } else {
        const parsed = parseSongUrl(songEmbedUrl)
        if (!parsed) {
          return NextResponse.json(
            { error: "Invalid song link. Use a Spotify or Apple Music URL." },
            { status: 400 }
          )
        }
        updateData.songEmbedUrl = parsed.embedUrl
        updateData.songUrl = null
        updateData.songTitle = null
        updateData.songArtist = null
      }
    } else {
      if (songTitle !== undefined) updateData.songTitle = songTitle || null
      if (songArtist !== undefined) updateData.songArtist = songArtist || null
    }

    const updated = await db.memorial.update({
      where: { id: memorialId },
      data: updateData,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Update song error:", error)
    return NextResponse.json(
      { error: "Failed to update song" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
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

    await db.memorial.update({
      where: { id: memorialId },
      data: {
        songUrl: null,
        songEmbedUrl: null,
        songTitle: null,
        songArtist: null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete song error:", error)
    return NextResponse.json(
      { error: "Failed to delete song" },
      { status: 500 }
    )
  }
}
