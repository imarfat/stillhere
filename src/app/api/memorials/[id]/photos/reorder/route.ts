import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

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
    const { photoIds } = body

    if (!Array.isArray(photoIds)) {
      return NextResponse.json({ error: "photoIds array is required" }, { status: 400 })
    }

    await Promise.all(
      photoIds.map((photoId: string, index: number) =>
        db.photo.update({
          where: { id: photoId },
          data: { sortOrder: index },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Reorder photos error:", error)
    return NextResponse.json(
      { error: "Failed to reorder photos" },
      { status: 500 }
    )
  }
}
