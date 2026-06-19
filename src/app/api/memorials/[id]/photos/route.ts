import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

async function checkOwner(memorialId: string, userId: string) {
  const memorial = await db.memorial.findUnique({ where: { id: memorialId } })
  if (!memorial) return { error: "Memorial not found", status: 404 }
  if (memorial.userId !== userId) return { error: "Unauthorized", status: 403 }
  return { ok: true }
}

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
    const ownerCheck = await checkOwner(memorialId, session.user.id)
    if ("error" in ownerCheck) {
      return NextResponse.json({ error: ownerCheck.error }, { status: ownerCheck.status })
    }

    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json({ error: "Photo URL is required" }, { status: 400 })
    }

    const maxSortOrder = await db.photo.findFirst({
      where: { memorialId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    })

    const photo = await db.photo.create({
      data: {
        memorialId,
        url,
        sortOrder: (maxSortOrder?.sortOrder ?? -1) + 1,
      },
    })

    return NextResponse.json(photo, { status: 201 })
  } catch (error) {
    console.error("Add photo error:", error)
    return NextResponse.json(
      { error: "Failed to add photo" },
      { status: 500 }
    )
  }
}
