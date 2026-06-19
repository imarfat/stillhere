import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; entryId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: memorialId, entryId } = await params

    const memorial = await db.memorial.findUnique({ where: { id: memorialId } })
    if (!memorial) {
      return NextResponse.json({ error: "Memorial not found" }, { status: 404 })
    }
    if (memorial.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const entry = await db.guestbookEntry.findUnique({ where: { id: entryId } })
    if (!entry || entry.memorialId !== memorialId) {
      return NextResponse.json({ error: "Guestbook entry not found" }, { status: 404 })
    }

    const body = await request.json()
    const { approved } = body

    const updated = await db.guestbookEntry.update({
      where: { id: entryId },
      data: { approved },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Update guestbook entry error:", error)
    return NextResponse.json(
      { error: "Failed to update guestbook entry" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; entryId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: memorialId, entryId } = await params

    const memorial = await db.memorial.findUnique({ where: { id: memorialId } })
    if (!memorial) {
      return NextResponse.json({ error: "Memorial not found" }, { status: 404 })
    }
    if (memorial.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const entry = await db.guestbookEntry.findUnique({ where: { id: entryId } })
    if (!entry || entry.memorialId !== memorialId) {
      return NextResponse.json({ error: "Guestbook entry not found" }, { status: 404 })
    }

    await db.guestbookEntry.delete({ where: { id: entryId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete guestbook entry error:", error)
    return NextResponse.json(
      { error: "Failed to delete guestbook entry" },
      { status: 500 }
    )
  }
}
