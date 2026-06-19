import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; photoId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: memorialId, photoId } = await params

    const memorial = await db.memorial.findUnique({ where: { id: memorialId } })
    if (!memorial) {
      return NextResponse.json({ error: "Memorial not found" }, { status: 404 })
    }
    if (memorial.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const photo = await db.photo.findUnique({ where: { id: photoId } })
    if (!photo || photo.memorialId !== memorialId) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 })
    }

    await db.photo.delete({ where: { id: photoId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete photo error:", error)
    return NextResponse.json(
      { error: "Failed to delete photo" },
      { status: 500 }
    )
  }
}
