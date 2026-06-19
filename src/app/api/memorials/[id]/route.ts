import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { normalizeSongEmbedUrl } from "@/lib/slug"

async function getMemorialWithOwnerCheck(
  id: string,
  userId: string
) {
  const memorial = await db.memorial.findUnique({ where: { id } })
  if (!memorial) {
    return { error: "Memorial not found", status: 404 }
  }
  if (memorial.userId !== userId) {
    return { error: "Unauthorized", status: 403 }
  }
  return { memorial }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const result = await getMemorialWithOwnerCheck(id, session.user.id)

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json({
      ...result.memorial,
      songEmbedUrl: normalizeSongEmbedUrl(result.memorial.songEmbedUrl),
    })
  } catch (error) {
    console.error("Fetch memorial error:", error)
    return NextResponse.json(
      { error: "Failed to fetch memorial" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const result = await getMemorialWithOwnerCheck(id, session.user.id)

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    const body = await request.json()
    const { name, dob, dod, tagline, restingPlace, coverPhotoUrl, bio } = body

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = typeof name === "string" ? name.trim() : name
    if (dob !== undefined) updateData.dob = dob ? new Date(dob) : null
    if (dod !== undefined) updateData.dod = dod ? new Date(dod) : null
    if (tagline !== undefined) updateData.tagline = tagline || null
    if (restingPlace !== undefined) updateData.restingPlace = restingPlace || null
    if (coverPhotoUrl !== undefined) updateData.coverPhotoUrl = coverPhotoUrl || null
    if (bio !== undefined) updateData.bio = bio || null

    const updated = await db.memorial.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Update memorial error:", error)
    return NextResponse.json(
      { error: "Failed to update memorial" },
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

    const { id } = await params
    const result = await getMemorialWithOwnerCheck(id, session.user.id)

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    await db.memorial.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete memorial error:", error)
    return NextResponse.json(
      { error: "Failed to delete memorial" },
      { status: 500 }
    )
  }
}
